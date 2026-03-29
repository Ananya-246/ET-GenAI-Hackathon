import { useState, useRef, useEffect } from "react";
import { askNavigatorQuestion, generateNavigatorBriefing } from "../services/api";
import useAISettings from "../hooks/useAISettings";
import "./NavigatorPage.css";

const PRESET_TOPICS = [
  "Union Budget 2026", "RBI Monetary Policy", "India-US Trade Deal", "EV Policy India",
  "Sebi F&O Regulations", "Adani Group Latest", "AI Startups Funding", "Rupee vs Dollar",
];

export default function NavigatorPage() {
  const { settings, setSetting } = useAISettings();
  const [topic, setTopic] = useState("");
  const [briefingReady, setBriefingReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [briefingError, setBriefingError] = useState("");
  const [briefing, setBriefing] = useState(null);
  const [briefingId, setBriefingId] = useState("");
  const [messages, setMessages] = useState([]);
  const [userQ, setUserQ] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadBriefing = async (t) => {
    const chosen = t || topic;
    if (!chosen.trim()) return;

    setTopic(chosen);
    setLoading(true);
    setBriefingError("");
    setBriefingReady(false);
    setBriefing(null);
    setBriefingId("");
    setMessages([]);

    try {
      const { data } = await generateNavigatorBriefing(chosen, settings.navigatorMaxSources || 8);
      setBriefing(data);
      setBriefingId(data?.briefing_id || "");
      setBriefingReady(true);
    } catch (err) {
      setBriefingError(err?.response?.data?.error || "Could not generate briefing right now.");
      setBriefingReady(false);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!userQ.trim()) return;
    if (!briefingId) return;

    const q = userQ;
    setUserQ("");
    setQaError("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setQaLoading(true);

    try {
      const { data } = await askNavigatorQuestion(briefingId, q);
      const sourceLine = (data?.citations || []).length
        ? `\n\nSources: ${(data.citations || []).map(c => `#${c.id} ${c.title}`).join(" | ")}`
        : "";
      setMessages(prev => [...prev, {
        role: "ai",
        text: `${data?.answer || "I could not answer that right now."}${sourceLine}`,
      }]);
    } catch (err) {
      setQaError(err?.response?.data?.error || "Could not answer that question right now.");
      setMessages(prev => [...prev, {
        role: "ai",
        text: "I can only answer from the selected ET briefing sources.",
      }]);
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="navigator-page">
      <div className="page-header">
        <div className="container">
          <span className="ai-badge" style={{ marginBottom: 10 }}>News Navigator — AI Briefings</span>
          <h1>One briefing. Not eight articles.</h1>
          <p>Ask anything across all ET coverage — get a synthesized, explorable answer.</p>
        </div>
      </div>

      <div className="container nav-body">
        <div className="topic-section">
          <h3 className="nav-section-label">Choose a topic or story</h3>
          <div className="topic-presets">
            {PRESET_TOPICS.map(t => (
              <button key={t} className={`preset-chip ${topic === t ? "active" : ""}`} onClick={() => loadBriefing(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="topic-input-row">
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loadBriefing()}
              placeholder="Or type any topic — e.g. 'Tata Motors EV strategy'"
            />
            <button className="btn-primary" onClick={() => loadBriefing()} disabled={loading}>
              {loading ? <><span className="spinner" /> Synthesizing...</> : "Get Briefing →"}
            </button>
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ fontSize: 12, color: "var(--et-muted)", minWidth: 150 }}>Coverage depth (sources)</label>
            <input
              type="range"
              min={3}
              max={12}
              value={settings.navigatorMaxSources || 8}
              onChange={(e) => setSetting("navigatorMaxSources", Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ width: 28, fontSize: 12, fontWeight: 700 }}>{settings.navigatorMaxSources || 8}</span>
          </div>
          {briefingError && <p className="navigator-error">{briefingError}</p>}
        </div>

        {briefingReady && (
          <div className="briefing-layout">
            <div className="briefing-main">
              <div className="briefing-card">
                <div className="briefing-header">
                  <span className="ai-badge">AI Synthesized · {briefing?.sources_count || 0} ET articles</span>
                  <span className="briefing-readtime">2 min briefing</span>
                </div>
                <h2 className="briefing-title">{briefing?.title || topic}</h2>
                <p className="briefing-summary">{briefing?.summary || ""}</p>

                <div className="briefing-section">
                  <h4 className="briefing-section-title">Key Points</h4>
                  <ul className="key-points-list">
                    {(briefing?.key_points || []).map((kp, i) => (
                      <li key={i} className="key-point">{kp}</li>
                    ))}
                  </ul>
                </div>

                <div className="briefing-two-col">
                  <div>
                    <h4 className="briefing-section-title">Key Players</h4>
                    {(briefing?.key_players || []).map((p, i) => (
                      <div key={i} className="player-pill">{p}</div>
                    ))}
                  </div>
                  <div>
                    <h4 className="briefing-section-title">Watch Next</h4>
                    {(briefing?.watch_next || []).map((w, i) => (
                      <div key={i} className="watch-item">→ {w}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="qa-section">
                <h3 className="nav-section-label">Ask a follow-up question</h3>
                <div className="qa-suggestions">
                  {(briefing?.suggested_questions || ["What are the biggest takeaways?", "What should I watch next?"]).map(s => (
                    <button key={s} className="qa-suggestion-chip" onClick={() => { setUserQ(s); }}>
                      {s}
                    </button>
                  ))}
                </div>
                <div className="chat-window">
                  {messages.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.role}`}>
                      {m.role === "ai" && <span className="ai-badge" style={{ marginBottom: 6, fontSize: 9 }}>ET AI</span>}
                      <p>{m.text}</p>
                    </div>
                  ))}
                  {qaLoading && (
                    <div className="chat-bubble ai">
                      <span className="ai-badge" style={{ marginBottom: 6, fontSize: 9 }}>ET AI</span>
                      <p className="typing-dots"><span /><span /><span /></p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="qa-input-row">
                  <input
                    value={userQ}
                    onChange={e => setUserQ(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && askQuestion()}
                    placeholder="Ask anything about this story..."
                  />
                  <button className="btn-primary" onClick={askQuestion} disabled={qaLoading}>Ask</button>
                </div>
                {qaError && <p className="navigator-error">{qaError}</p>}
              </div>
            </div>

            <div className="briefing-sidebar">
              <h4 className="nav-section-label">Source articles ({briefing?.sources_count || 0})</h4>
              {(briefing?.sources || []).map((s) => (
                <div key={s.id} className="source-item">
                  <span className="source-dot" />
                  <span className="source-title">#{s.id} {s.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}