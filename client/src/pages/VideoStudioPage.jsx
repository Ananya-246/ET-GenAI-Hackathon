import { useState } from "react";
import "./VideoStudioPage.css";

const SAMPLE_ARTICLES = [
  "RBI holds repo rate at 6.5% for sixth straight meeting",
  "Sensex rallies 600 points on strong Q4 earnings",
  "Sebi tightens F&O norms — weekly contracts limited",
  "India GDP growth revised to 7.2% for FY27",
];

const VOICES = ["Priya (Female, News)", "Arjun (Male, Formal)", "Deepa (Female, Conversational)"];
const STYLES = ["Breaking News", "Market Wrap", "Explainer", "Feature Story"];

const MOCK_SCRIPT = `[Opening shot: India flag + market ticker animation]

NARRATOR: The Reserve Bank of India has held its benchmark repo rate steady at 6.5 percent — marking the sixth consecutive pause by the Monetary Policy Committee.

[Cut to: RBI building visual + data overlay: "Repo Rate: 6.5%"]

NARRATOR: The decision, taken in a 4 to 2 vote, reflects the MPC's confidence in India's economic resilience, even as two members pushed for an immediate cut.

[Cut to: GDP chart animation rising]

NARRATOR: GDP growth for FY27 has been revised upward to 7.2 percent — signaling that India remains the world's fastest-growing major economy.

[Closing shot: ET logo + "Stay Invested" card]

NARRATOR: For The Economic Times, this is your Market Update.`;

export default function VideoStudioPage() {
  const [articleText, setArticleText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(null);
  const [script, setScript] = useState("");

  const generate = () => {
    if (!articleText.trim()) return;
    setLoading(true);
    setStage("script");
    setScript("");
    setTimeout(() => {
      setScript(MOCK_SCRIPT);
      setStage("ready");
      setLoading(false);
    }, 2500);
  };

  return (
    <div className="video-studio-page">
      <div className="page-header">
        <div className="container">
          <span className="ai-badge" style={{ marginBottom: 10 }}>AI Video Studio</span>
          <h1>Article → Broadcast video in 90 seconds</h1>
          <p>AI-generated narration, animated data visuals, and contextual overlays.</p>
        </div>
      </div>

      <div className="container studio-body">
        <div className="studio-layout">
          <div className="studio-input-panel">
            <h3 className="studio-label">Paste article or headline</h3>
            <div className="sample-articles">
              {SAMPLE_ARTICLES.map(a => (
                <button key={a} className="sample-chip" onClick={() => setArticleText(a)}>{a}</button>
              ))}
            </div>
            <textarea
              rows={6}
              value={articleText}
              onChange={e => setArticleText(e.target.value)}
              placeholder="Paste the ET article text or headline here..."
              style={{ resize: "vertical", marginBottom: 16 }}
            />

            <div className="studio-options-row">
              <div className="studio-option-group">
                <label className="studio-label">Video style</label>
                <div className="option-chips">
                  {STYLES.map(s => (
                    <button key={s} className={`option-chip ${selectedStyle === s ? "active" : ""}`} onClick={() => setSelectedStyle(s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="studio-option-group">
                <label className="studio-label">Narrator voice</label>
                <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}>
                  {VOICES.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <button className="btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={generate} disabled={loading}>
              {loading ? <><span className="spinner" /> Generating video script...</> : "🎬 Generate Video →"}
            </button>
          </div>

          <div className="studio-preview-panel">
            <h3 className="studio-label">Preview</h3>
            {!stage && (
              <div className="studio-placeholder">
                <div className="placeholder-screen">
                  <div className="placeholder-et-logo">ET</div>
                  <p>Your AI video will appear here</p>
                  <span>60–90 second broadcast-quality output</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="studio-placeholder">
                <div className="placeholder-screen generating">
                  <div className="gen-spinner" />
                  <p>Generating script + visuals...</p>
                  <div className="gen-steps">
                    {["Analyzing article", "Writing script", "Selecting visuals", "Rendering preview"].map((s, i) => (
                      <div key={s} className="gen-step">
                        <span className="gen-step-dot active" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {stage === "ready" && (
              <div className="video-ready">
                <div className="video-mock-player">
                  <div className="video-top-bar">
                    <span className="et-badge">LIVE</span>
                    <span className="video-title-overlay">RBI Policy Update · March 2026</span>
                  </div>
                  <div className="video-visual">
                    <div className="video-stat-card">
                      <div className="stat-label">Repo Rate</div>
                      <div className="stat-value">6.5%</div>
                      <div className="stat-change unchanged">Unchanged</div>
                    </div>
                    <div className="video-stat-card">
                      <div className="stat-label">GDP FY27</div>
                      <div className="stat-value">7.2%</div>
                      <div className="stat-change up">▲ Revised up</div>
                    </div>
                    <div className="video-stat-card">
                      <div className="stat-label">MPC Vote</div>
                      <div className="stat-value">4–2</div>
                      <div className="stat-change">Pause</div>
                    </div>
                  </div>
                  <div className="video-bottom-ticker">
                    <span className="et-badge" style={{ fontSize: 9 }}>ET</span>
                    <span>Economic Times Market Update · {new Date().toLocaleDateString("en-IN")}</span>
                  </div>
                </div>

                <div className="script-panel">
                  <div className="script-header">
                    <span className="ai-badge">Generated Script</span>
                    <span className="studio-label" style={{ marginBottom: 0 }}>{selectedStyle} · {selectedVoice}</span>
                  </div>
                  <pre className="script-text">{script}</pre>
                </div>

                <div className="video-actions">
                  <button className="btn-primary">⬇ Download Script</button>
                  <button className="btn-outline">🔊 Preview Audio</button>
                  <button className="btn-dark">📤 Export Video</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}