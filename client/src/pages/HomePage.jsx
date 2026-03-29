import { useState } from 'react';
import FeedCard from '../components/FeedCard';
import usePersona from '../hooks/usePersona';
import './MyETPage.css';

const PERSONAS = [
  { id: 'investor', label: 'Mutual Fund Investor', icon: '📈', tags: ['Mutual Funds', 'Equity', 'Markets', 'SIP'] },
  { id: 'founder',  label: 'Startup Founder',       icon: '🚀', tags: ['Startups', 'Funding', 'VC', 'Tech'] },
  { id: 'student',  label: 'Finance Student',        icon: '🎓', tags: ['Explainers', 'Economy', 'Basics'] },
  { id: 'trader',   label: 'Active Trader',          icon: '💹', tags: ['F&O', 'Technical', 'Markets', 'IPO'] },
  { id: 'executive',label: 'Corporate Executive',    icon: '🏢', tags: ['Industry', 'Policy', 'Leadership'] },
];

export default function MyETPage() {
  const {
    persona, interests, feed, loading, error,
    selectPersona, addInterest, removeInterest, generateFeed,
  } = usePersona();

  const [inputTag, setInputTag] = useState('');

  const handleAddTag = () => {
    if (inputTag.trim()) {
      addInterest(inputTag.trim());
      setInputTag('');
    }
  };

  return (
    <div className="my-et-page">
      <div className="page-header">
        <div className="container">
          <span className="ai-badge" style={{ marginBottom: 10 }}>My ET — Personalized Newsroom</span>
          <h1>Your newsroom, built for you</h1>
          <p>Tell us who you are. We'll curate what matters.</p>
        </div>
      </div>

      <div className="container my-et-body">
        <div className="persona-section">
          <h3 className="my-et-section-label">Who are you?</h3>
          <div className="persona-grid">
            {PERSONAS.map(p => (
              <button
                key={p.id}
                className={`persona-card ${persona?.id === p.id ? 'active' : ''}`}
                onClick={() => selectPersona(p)}
              >
                <span className="persona-icon">{p.icon}</span>
                <span className="persona-label">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {persona && (
          <div className="interests-section">
            <h3 className="my-et-section-label">Your interests</h3>
            <div className="tags-row">
              {interests.map(tag => (
                <span key={tag} className="interest-tag">
                  {tag}
                  <button className="tag-remove" onClick={() => removeInterest(tag)}>×</button>
                </span>
              ))}
            </div>
            <div className="tag-input-row">
              <input
                value={inputTag}
                onChange={e => setInputTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                placeholder="Add custom topic (e.g. Electric Vehicles)..."
                style={{ maxWidth: 320 }}
              />
              <button className="btn-outline" onClick={handleAddTag}>+ Add</button>
            </div>
            {error && <p style={{ color: 'var(--et-red)', fontSize: 13, marginTop: 8 }}>{error}</p>}
            <button className="btn-primary" onClick={generateFeed} disabled={loading} style={{ marginTop: 16 }}>
              {loading ? <><span className="spinner" /> Personalizing...</> : 'Generate My Feed →'}
            </button>
          </div>
        )}

        {feed.length > 0 && (
          <div className="feed-section">
            <div className="feed-header">
              <hr className="section-divider" />
              <div className="feed-header-row">
                <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Your Personalized Feed</h2>
                <span className="ai-badge">AI curated</span>
              </div>
              <p className="feed-sub">Tailored for {persona?.label} · {feed?.length} stories</p>
            </div>
            <div className="feed-list">
              {feed.map((a, i) => (
                <FeedCard key={a.id || i} article={a} rank={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}