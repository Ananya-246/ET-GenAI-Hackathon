import { useState } from 'react';
import { generateVideoScript } from '../services/api';
import './VideoStudioPage.css';

const SAMPLE_ARTICLES = [
  'RBI holds repo rate at 6.5% for sixth straight meeting',
  'Sensex rallies 600 points on strong Q4 earnings',
  'Sebi tightens F&O norms — weekly contracts limited',
  'India GDP growth revised to 7.2% for FY27',
];

const VOICES = ['Priya (Female, News)', 'Arjun (Male, Formal)', 'Deepa (Female, Conversational)'];
const STYLES = ['Breaking News', 'Market Wrap', 'Explainer', 'Feature Story'];

const STAGES = [
  { label: 'Writing script with Groq AI',    duration: 5000  },
  { label: 'Generating anchor video via D-ID', duration: 30000 },
  { label: 'Rendering and encoding',           duration: 40000 },
  { label: 'Finalizing video',                 duration: 10000 },
];

export default function VideoStudioPage() {
  const [articleText, setArticleText] = useState('');
  const [voice, setVoice]   = useState(VOICES[0]);
  const [style, setStyle]   = useState(STYLES[0]);
  const [loading, setLoading] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);
  const [showScript, setShowScript] = useState(false);

  const handleGenerate = async () => {
    if (!articleText.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setStageIdx(0);

    let idx = 0;
    const advance = () => {
      idx++;
      if (idx < STAGES.length) {
        setStageIdx(idx);
        setTimeout(advance, STAGES[idx].duration);
      }
    };
    setTimeout(advance, STAGES[0].duration);

    try {
      const res = await generateVideoScript(articleText, style, voice);
      setResult(res.data);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
        'Generation failed. Make sure Flask is running and DID_API_KEY is set.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="video-studio-page">
      <div className="page-header">
        <div className="container">
          <span className="ai-badge" style={{ marginBottom: 10 }}>AI Video Studio</span>
          <h1>Article → AI Anchor Video</h1>
          <p>Real talking anchor · Indian English voice · 30–60 seconds · powered by D-ID</p>
        </div>
      </div>

      <div className="container studio-body">
        <div className="studio-layout">

          <div className="studio-input-panel">
            <h3 className="studio-label">Article or headline</h3>
            <div className="sample-articles">
              {SAMPLE_ARTICLES.map(a => (
                <button key={a} className="sample-chip" onClick={() => setArticleText(a)}>{a}</button>
              ))}
            </div>
            <textarea
              rows={6}
              value={articleText}
              onChange={e => setArticleText(e.target.value)}
              placeholder="Paste ET article text or headline here..."
              style={{ resize: 'vertical', marginBottom: 16 }}
            />

            <div className="studio-options-row">
              <div className="studio-option-group">
                <label className="studio-label">Video style</label>
                <div className="option-chips">
                  {STYLES.map(s => (
                    <button
                      key={s}
                      className={`option-chip ${style === s ? 'active' : ''}`}
                      onClick={() => setStyle(s)}
                    >{s}</button>
                  ))}
                </div>
              </div>
              <div className="studio-option-group">
                <label className="studio-label">Anchor voice</label>
                <select value={voice} onChange={e => setVoice(e.target.value)}>
                  {VOICES.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="studio-error">
                <strong>Error:</strong> {error}
              </div>
            )}

            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" /> {STAGES[stageIdx]?.label}...</>
                : '🎬 Generate Anchor Video →'}
            </button>

            {loading && (
              <div className="stage-tracker">
                {STAGES.map((s, i) => (
                  <div key={s.label} className={`stage-step ${i < stageIdx ? 'done' : i === stageIdx ? 'active' : 'pending'}`}>
                    <span className="stage-dot" />
                    <span className="stage-label">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {result && (
              <div className="script-toggle-section">
                <button
                  className="btn-outline"
                  style={{ width: '100%', marginTop: 12, fontSize: 13 }}
                  onClick={() => setShowScript(s => !s)}
                >
                  {showScript ? '▲ Hide Script' : '▼ View Generated Script'}
                </button>
                {showScript && (
                  <pre className="script-display">{result.script}</pre>
                )}
              </div>
            )}
          </div>

          <div className="studio-preview-panel">
            <h3 className="studio-label">Video Output</h3>

            {!result && !loading && (
              <div className="studio-placeholder">
                <div className="placeholder-screen">
                  <div className="placeholder-et-logo">ET</div>
                  <p>AI anchor video appears here</p>
                  <span>Real talking head · Indian English voice</span>
                  <span style={{ marginTop: 8, fontSize: 11, opacity: 0.5 }}>
                    Powered by D-ID · 20 free credits on signup
                  </span>
                </div>
              </div>
            )}

            {loading && (
              <div className="studio-placeholder">
                <div className="placeholder-screen generating">
                  <div className="gen-spinner" />
                  <p>{STAGES[stageIdx]?.label}</p>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                    D-ID anchor videos take ~60–90 seconds to render
                  </span>
                </div>
              </div>
            )}

            {result?.video_url && (
              <div className="video-output-wrap">
                <div className="video-et-header">
                  <span className="et-badge">ET Intelligence</span>
                  <span className="video-meta">{style} · {voice} · {result.duration}</span>
                </div>

                <video
                  src={result.video_url}
                  controls
                  autoPlay
                  className="anchor-video"
                  poster=""
                >
                  Your browser does not support video playback.
                </video>

                {result.stats && result.stats.length > 0 && (
                  <div className="video-stats-strip">
                    {result.stats.map((s, i) => (
                      <div key={i} className="video-stat-pill">
                        <span className="vsp-label">{s.label}</span>
                        <span className="vsp-value">{s.value}</span>
                        <span className={`vsp-change ${s.trend}`}>
                          {s.trend === 'up' ? '▲' : s.trend === 'down' ? '▼' : '●'} {s.change}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="video-download-bar">
                  <a
                    href={result.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ fontSize: 13, textDecoration: 'none', display: 'inline-block' }}
                  >
                    ⬇ Download Video
                  </a>
                  <button
                    className="btn-outline"
                    style={{ fontSize: 13 }}
                    onClick={() => navigator.clipboard.writeText(result.video_url)}
                  >
                    🔗 Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}