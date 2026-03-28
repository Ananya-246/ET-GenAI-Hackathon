import { useState } from 'react';
import ScriptPreview from '../components/ScriptPreview';
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

export default function VideoStudioPage() {
  const [articleText, setArticleText] = useState('');
  const [voice, setVoice] = useState(VOICES[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!articleText.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await generateVideoScript(articleText, style, voice);
      setResult(res.data);
    } catch {
      setError('Script generation failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
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
              style={{ resize: 'vertical', marginBottom: 16 }}
            />
            <div className="studio-options-row">
              <div className="studio-option-group">
                <label className="studio-label">Video style</label>
                <div className="option-chips">
                  {STYLES.map(s => (
                    <button key={s} className={`option-chip ${style === s ? 'active' : ''}`} onClick={() => setStyle(s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="studio-option-group">
                <label className="studio-label">Narrator voice</label>
                <select value={voice} onChange={e => setVoice(e.target.value)}>
                  {VOICES.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
            {error && <p style={{ color: 'var(--et-red)', fontSize: 13, marginTop: 8 }}>{error}</p>}
            <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleGenerate} disabled={loading}>
              {loading
                ? <><span className="spinner" /> Generating script...</>
                : '🎬 Generate Video Script →'}
            </button>
          </div>

          <div className="studio-preview-panel">
            <h3 className="studio-label">Preview</h3>
            {!result && !loading && (
              <div className="studio-placeholder">
                <div className="placeholder-screen">
                  <div className="placeholder-et-logo">ET</div>
                  <p>Your AI video script will appear here</p>
                  <span>60–90 second broadcast-quality output</span>
                </div>
              </div>
            )}
            {loading && (
              <div className="studio-placeholder">
                <div className="placeholder-screen generating">
                  <div className="gen-spinner" />
                  <p>Claude is writing your script...</p>
                  <div className="gen-steps">
                    {['Analyzing article', 'Writing narration', 'Extracting data points', 'Finalizing script'].map(s => (
                      <div key={s} className="gen-step">
                        <span className="gen-step-dot active" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {result && (
              <ScriptPreview
                script={result.script}
                style={style}
                voice={voice}
                stats={result.stats}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}