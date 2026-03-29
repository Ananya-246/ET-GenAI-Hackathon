import { useState } from 'react';
import usePersona from '../hooks/usePersona';
import './MyETPage.css';

const PERSONAS = [
  { id: 'investor',  label: 'Mutual Fund Investor', icon: '📈', tags: ['mutual funds','SIP','equity','NAV','ELSS','wealth'] },
  { id: 'founder',   label: 'Startup Founder',       icon: '🚀', tags: ['startups','VC','funding','unicorn','Series B','DPIIT'] },
  { id: 'student',   label: 'Finance Student',        icon: '🎓', tags: ['economy','GDP','RBI','budget','macro','fiscal policy'] },
  { id: 'trader',    label: 'Active Trader',          icon: '💹', tags: ['F&O','options','Nifty','Sensex','technical analysis','VIX'] },
  { id: 'executive', label: 'Corporate Executive',    icon: '🏢', tags: ['leadership','CXO','industry','capex','conglomerate','policy'] },
];

function getTagColor(weight) {
  const w = parseFloat(weight) || 0;
  if (w >= 5)   return '#e2231a';
  if (w >= 3)   return '#f97316';
  if (w >= 1.5) return '#eab308';
  return '#6b7280';
}

function safePercent(score) {
  const s = parseFloat(score) || 0;
  return Math.min(Math.round(s * 5), 99);
}

export default function MyETPage() {
  const {
    persona, feed, topTags, loading, error, hasVisits,
    selectPersona, onArticleClick,
  } = usePersona();

  const [expanded, setExpanded] = useState(null);

  const handleArticleClick = (article) => {
    if (!article) return;
    onArticleClick(article);
    setExpanded(prev => prev === article.id ? null : article.id);
  };

  const safeFeed    = Array.isArray(feed)    ? feed    : [];
  const safeTopTags = Array.isArray(topTags) ? topTags : [];

  return (
    <div className="my-et-page">
      <div className="page-header">
        <div className="container">
          <span className="ai-badge" style={{ marginBottom: 10 }}>My ET — Personalized Newsroom</span>
          <h1>Your newsroom, built for you</h1>
          <p>Click any article to train your feed. The more you read, the smarter it gets.</p>
        </div>
      </div>

      <div className="container my-et-body">

        <div className="persona-section">
          <h3 className="my-et-section-label">Start with a persona — or just browse</h3>
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

        {safeTopTags.length > 0 && (
          <div className="tag-profile-section">
            <h3 className="my-et-section-label">
              Your interest profile
              <span className="profile-live-dot" />
              <span style={{ fontWeight: 400, color: 'var(--et-muted)', fontSize: 11 }}>
                updates as you read
              </span>
            </h3>
            <div className="tag-profile-bar">
              {safeTopTags.map((item) => {
                const tag    = item?.tag    || '';
                const weight = item?.weight || 0;
                const color  = getTagColor(weight);
                const pct    = Math.min(100, ((parseFloat(weight) || 0) / 20) * 100);
                return (
                  <div key={tag} className="tag-weight-pill" style={{ borderColor: color }}>
                    <span className="tag-weight-name">{tag}</span>
                    <span className="tag-weight-bar-wrap">
                      <span
                        className="tag-weight-bar-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </span>
                    <span className="tag-weight-score" style={{ color }}>
                      {parseFloat(weight).toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fff0f0', border: '1px solid #fcc', borderLeft: '3px solid var(--et-red)',
            borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#b91c1c'
          }}>
            {error}
          </div>
        )}

        <div className="feed-section">
          <div className="feed-header-row">
            <div>
              <hr className="section-divider" />
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginTop: 6 }}>
                {hasVisits ? 'Your Personalized Feed' : 'Top Stories'}
              </h2>
              <p className="feed-sub">
                {hasVisits
                  ? `Ranked by your reading history · ${safeFeed.length} stories`
                  : 'Click any article to personalize your feed'}
              </p>
            </div>
            {loading && (
              <span className="spinner" style={{ borderTopColor: 'var(--et-red)', margin: '8px 0' }} />
            )}
          </div>

          {safeFeed.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--et-muted)', fontSize: 14 }}>
              {error ? 'Could not load articles.' : 'No articles found. Try selecting a persona above.'}
            </div>
          )}

          <div className="feed-list">
            {safeFeed.map((article, i) => {
              if (!article || !article.id) return null;

              const isExpanded    = expanded === article.id;
              const score         = parseFloat(article.score) || 0;
              const matchedTags   = Array.isArray(article.matched_tags) ? article.matched_tags : [];
              const allTags       = Array.isArray(article.tags)         ? article.tags         : [];
              const pct           = safePercent(score);

              return (
                <div
                  key={article.id}
                  className={`feed-item-card ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => handleArticleClick(article)}
                >
                  <div className="feed-item-main">
                    <div className="feed-rank-num">{i + 1}</div>
                    <div className="feed-item-body">
                      <div className="feed-item-top">
                        <span className="tag">{article.category || 'General'}</span>
                        {score > 0 && (
                          <span className="relevance-pill">{pct}% match</span>
                        )}
                        <span className="article-time">{article.time || 'Recently'}</span>
                      </div>

                      <p className="feed-item-title">{article.title || 'Untitled'}</p>

                      {matchedTags.length > 0 && (
                        <div className="matched-tags-row">
                          {matchedTags.slice(0, 5).map(t => (
                            <span key={t} className="matched-tag">#{t}</span>
                          ))}
                        </div>
                      )}

                      {isExpanded && (
                        <div className="feed-item-expanded">
                          {article.summary && (
                            <p className="feed-item-summary">{article.summary}</p>
                          )}
                          {allTags.length > 0 && (
                            <div className="all-tags-row">
                              {allTags.map(t => (
                                <span key={t} className="all-tag">#{t}</span>
                              ))}
                            </div>
                          )}
                          <p className="reading-hint">✓ Reading tracked — your feed is updating</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}