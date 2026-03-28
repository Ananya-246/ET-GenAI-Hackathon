import { useState } from 'react';
import { generateTTS } from '../services/api';
import './ScriptPreview.css';

export default function ScriptPreview({ script, style, voice, stats }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleTTS = async () => {
    setTtsLoading(true);
    setTtsError(null);
    try {
      const res = await generateTTS(script, voice);
      setAudioUrl(res.data.audio_url);
    } catch {
      setTtsError('TTS failed. Check ElevenLabs API key.');
    } finally {
      setTtsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="script-preview">
      <div className="sp-player">
        <div className="sp-player-top">
          <span className="et-badge">LIVE</span>
          <span className="sp-player-label">{style} · ET Intelligence</span>
        </div>
        <div className="sp-stats-row">
          {stats && stats.map((s, i) => (
            <div key={i} className="sp-stat">
              <div className="sp-stat-label">{s.label}</div>
              <div className="sp-stat-value">{s.value}</div>
              <div className={`sp-stat-change ${s.trend}`}>{s.change}</div>
            </div>
          ))}
        </div>
        <div className="sp-ticker">
          <span className="et-badge" style={{ fontSize: 9 }}>ET</span>
          <span>Economic Times · {new Date().toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      <div className="sp-script-box">
        <div className="sp-script-header">
          <span className="ai-badge">Generated script</span>
          <span style={{ fontSize: 11, color: 'var(--et-muted)' }}>{style} · {voice}</span>
        </div>
        <pre className="sp-script-text">{script}</pre>
      </div>

      {ttsError && <p className="sp-error">{ttsError}</p>}

      {audioUrl && (
        <audio controls src={audioUrl} className="sp-audio" />
      )}

      <div className="sp-actions">
        <button className="btn-primary" onClick={handleTTS} disabled={ttsLoading}>
          {ttsLoading ? <><span className="spinner" /> Generating audio...</> : '🔊 Generate Audio'}
        </button>
        <button className="btn-outline" onClick={handleCopy}>
          {copied ? '✓ Copied' : '📋 Copy Script'}
        </button>
        <button className="btn-dark" onClick={() => {
          const blob = new Blob([script], { type: 'text/plain' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'et-video-script.txt';
          a.click();
        }}>⬇ Download</button>
      </div>
    </div>
  );
}