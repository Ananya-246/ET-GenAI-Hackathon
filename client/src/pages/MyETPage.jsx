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

export default function MyETPage() {
  const {
    persona, feed, topTags, loading, error, hasVisits,
    selectPersona, onArticleClick,
  } = usePersona();

  const [expanded, setExpanded] = useState(null);

  const getTagColor = (weight) => {
    if (weight >= 5) return '#e2231a';
    if (weight >= 3) return '#f97316';
    if (weight >= 1.5) return '#eab308';
    return '#6b7280';
  };

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

        {topTags.length > 0 && (
          <div className="tag-profile-section">
            <h3 className="my-et-section-label">
              Your interest profile
              <span className="profile-live-dot" />
              <span style={{ fontWeight: 400, color: 'var(--et-muted)', fontSize: 11 }}>
                updates as you read
              </span>
            </h3>
            <div className="tag-profile-bar">
              {topTags.map(({ tag, weight }) => (
                <div key={tag} className="tag-weight-pill" style={{ borderColor: getTagColor(weight) }}>
                  <span className="tag-weight-name">{tag}</span>
                  <span className="tag-weight-bar-wrap">
                    <span
                      className="tag-weight-bar-fill"
                      style={{
                        width: `${Math.min(100, (weight / 20) * 100)}%`,
                        background: getTagColor(weight),
                      }}
                    />
                  </span>
                  <span className="tag-weight-score" style={{ color: getTagColor(weight) }}>
                    {weight.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p style={{ color: 'var(--et-red)', fontSize: 13 }}>{error}</p>}

        <div className="feed-section">
          <div className="feed-header-row">
            <div>
              <hr className="section-divider" />
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginTop: 6 }}>
                {hasVisits ? 'Your Personalized Feed' : 'Top Stories'}
              </h2>
              <p className="feed-sub">
                {hasVisits
                  ? `Ranked by your reading history · ${feed.length} stories`
                  : 'Click any article to personalize your feed'}
              </p>
            </div>
            {loading && <span className="spinner" style={{ borderTopColor: 'var(--et-red)', margin: '8px 0' }} />}
          </div>

          <div className="feed-list">
            {(feed || []).map((article, i) => (
              <div
                key={article.id}
                className={`feed-item-card ${expanded === article.id ? 'expanded' : ''}`}
                onClick={() => {
                  onArticleClick(article);
                  setExpanded(expanded === article.id ? null : article.id);
                }}
              >
                <div className="feed-item-main">
                  <div className="feed-rank-num">{i + 1}</div>
                  <div className="feed-item-body">
                    <div className="feed-item-top">
                      <span className="tag">{article.category}</span>
                      {article.score > 0 && (
                        <span className="relevance-pill">
                          {Math.round(Math.min(article.score * 5, 99))}% match
                        </span>
                      )}
                      <span className="article-time">{article.time}</span>
                    </div>
                    <p className="feed-item-title">{article.title}</p>

                    {article.matched_tags && article.matched_tags.length > 0 && (
                      <div className="matched-tags-row">
                        {article.matched_tags.slice(0, 5).map(t => (
                          <span key={t} className="matched-tag">#{t}</span>
                        ))}
                      </div>
                    )}

                    {expanded === article.id && (
                      <div className="feed-item-expanded">
                        <p className="feed-item-summary">{article.summary}</p>
                        <div className="all-tags-row">
                          {(article.tags || []).map(t => (
                            <span key={t} className="all-tag">#{t}</span>
                          ))}
                        </div>
                        <p className="reading-hint">✓ Reading tracked — your feed is updating</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}