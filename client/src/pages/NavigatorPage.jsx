import { useState, useRef, useEffect } from "react";
import "./NavigatorPage.css";

const PRESET_TOPICS = [
  "Union Budget 2026", "RBI Monetary Policy", "India-US Trade Deal", "EV Policy India",
  "Sebi F&O Regulations", "Adani Group Latest", "AI Startups Funding", "Rupee vs Dollar",
];

const MOCK_BRIEFING = {
  title: "RBI Monetary Policy — March 2026",
  sources: 8,
  readTime: "2 min briefing",
  summary: "The Reserve Bank of India's Monetary Policy Committee held the repo rate steady at 6.5% in its March 2026 meeting, marking the sixth consecutive pause. The decision was 4-2, with two members voting for a 25bps cut citing easing inflation. Governor Das emphasized India's resilient GDP growth of 8.4% while flagging global volatility from US tariff escalations.",
  keyPoints: [
    "Repo rate unchanged at 6.5%; SDF at 6.25%, MSF at 6.75%",
    "CPI inflation projected at 4.5% for FY27, within the 4% ± 2% band",
    "GDP growth forecast revised upward to 7.2% for FY27",
    "RBI to inject ₹1.5 lakh crore liquidity via OMOs in Q1",
    "Two MPC members dissented — flagged growth risks from global headwinds",
  ],
  players: ["Shaktikanta Das (Governor)", "MPC Majority (4 members)", "2 Dissenting Members"],
  watchNext: ["Fed rate decision impact on RBI stance", "India inflation trajectory Q1 FY27", "FII flows post-policy"],
};

const MOCK_QA = {
  "impact on home loan": "Home loan EMIs are likely to remain stable in the near term. With the repo rate unchanged, banks have no immediate trigger to revise lending rates. However, if RBI cuts in June — which markets are pricing at 60% probability — floating rate home loans could see EMI reductions of ₹400-800 per lakh.",
  "what did dissenting members say": "The two dissenting MPC members — Dr. Ashima Goyal and Prof. Jayanth Varma — argued that with inflation comfortably within the 4% target band and global growth slowing, a 25bps pre-emptive cut would support consumption and investment without sacrificing credibility.",
  "default": "Based on ET's coverage of the RBI policy, the key takeaway is that the MPC is in a 'wait and watch' mode — comfortable with current growth but cautious about external risks. The next pivotal moment is the June meeting, where a cut is increasingly likely if inflation prints below 4.3%.",
};

export default function NavigatorPage() {
  const [topic, setTopic] = useState("");
  const [briefingReady, setBriefingReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userQ, setUserQ] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadBriefing = (t) => {
    const chosen = t || topic;
    if (!chosen.trim()) return;
    setTopic(chosen);
    setLoading(true);
    setBriefingReady(false);
    setMessages([]);
    setTimeout(() => { setLoading(false); setBriefingReady(true); }, 2000);
  };

  const askQuestion = () => {
    if (!userQ.trim()) return;
    const q = userQ;
    setUserQ("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setQaLoading(true);
    setTimeout(() => {
      const key = Object.keys(MOCK_QA).find(k => q.toLowerCase().includes(k)) || "default";
      setMessages(prev => [...prev, { role: "ai", text: MOCK_QA[key] }]);
      setQaLoading(false);
    }, 1400);
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
        </div>

        {briefingReady && (
          <div className="briefing-layout">
            <div className="briefing-main">
              <div className="briefing-card">
                <div className="briefing-header">
                  <span className="ai-badge">AI Synthesized · {MOCK_BRIEFING.sources} ET articles</span>
                  <span className="briefing-readtime">{MOCK_BRIEFING.readTime}</span>
                </div>
                <h2 className="briefing-title">{MOCK_BRIEFING.title}</h2>
                <p className="briefing-summary">{MOCK_BRIEFING.summary}</p>

                <div className="briefing-section">
                  <h4 className="briefing-section-title">Key Points</h4>
                  <ul className="key-points-list">
                    {MOCK_BRIEFING.keyPoints.map((kp, i) => (
                      <li key={i} className="key-point">{kp}</li>
                    ))}
                  </ul>
                </div>

                <div className="briefing-two-col">
                  <div>
                    <h4 className="briefing-section-title">Key Players</h4>
                    {MOCK_BRIEFING.players.map((p, i) => (
                      <div key={i} className="player-pill">{p}</div>
                    ))}
                  </div>
                  <div>
                    <h4 className="briefing-section-title">Watch Next</h4>
                    {MOCK_BRIEFING.watchNext.map((w, i) => (
                      <div key={i} className="watch-item">→ {w}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="qa-section">
                <h3 className="nav-section-label">Ask a follow-up question</h3>
                <div className="qa-suggestions">
                  {["Impact on home loan?", "What did dissenting members say?"].map(s => (
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
              </div>
            </div>

            <div className="briefing-sidebar">
              <h4 className="nav-section-label">Source articles ({MOCK_BRIEFING.sources})</h4>
              {["RBI keeps repo rate at 6.5%", "Two MPC members vote for cut", "RBI to inject ₹1.5L cr via OMO", "Impact on home loans analysed", "Markets react to policy pause", "Inflation outlook: 4.5% FY27", "GDP revised to 7.2%", "Next MPC meeting June 2026"].map((s, i) => (
                <div key={i} className="source-item">
                  <span className="source-dot" />
                  <span className="source-title">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}