import { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import './HomePage.css';

const TICKER_ITEMS = [
  'Sensex 72,845 ▲ 0.43%', 'Nifty 22,104 ▲ 0.38%', 'USD/INR 83.42', 'Gold ₹62,450/10g',
  'Brent Crude $82.3/bbl', 'Bitcoin ₹58.2L', 'RBI Repo Rate 6.5%', 'India GDP 8.4%',
];

const MOCK_ARTICLES = [
  { id: 1, title: 'RBI holds repo rate steady at 6.5%, signals cautious stance amid global uncertainty', category: 'Economy', time: '2h ago', source: 'ET Bureau', summary: 'The monetary policy committee voted 4-2 to keep rates unchanged, with governor Das emphasizing domestic growth momentum.' },
  { id: 2, title: 'Reliance Industries posts ₹19,488 crore net profit, retail and Jio segments lead growth', category: 'Industry', time: '3h ago', source: 'ET Bureau' },
  { id: 3, title: 'Sebi tightens F&O rules: weekly expiry contracts to be limited, lot sizes hiked', category: 'Markets', time: '4h ago', source: 'ET Bureau' },
  { id: 4, title: 'IT sector outlook: TCS, Infosys brace for sluggish Q1 as BFSI clients defer spends', category: 'Tech', time: '5h ago', source: 'ET Bureau' },
  { id: 5, title: 'EV startups face funding winter as global VCs tighten due diligence norms', category: 'Startups', time: '6h ago', source: 'ET Bureau' },
  { id: 6, title: 'Union Budget 2026: Infrastructure capex likely to touch ₹11.1 lakh crore', category: 'Economy', time: '7h ago', source: 'ET Bureau' },
  { id: 7, title: 'Adani Group secures ₹1.2 lakh crore order book; renewables at forefront', category: 'Industry', time: '8h ago', source: 'ET Bureau' },
  { id: 8, title: 'SBI Card Q4 results: Net profit rises 11% to ₹662 crore on higher spends', category: 'Finance', time: '9h ago', source: 'ET Bureau' },
];

const AI_FEATURES = [
  { key: 'my-et',      icon: '🧠', title: 'My ET',          desc: 'Personalized newsroom curated for your interests.',          color: '#0f3460' },
  { key: 'navigator',  icon: '🔍', title: 'News Navigator',  desc: 'Ask questions across all ET coverage. One briefing.',        color: '#16213e' },
  { key: 'story-arc',  icon: '📈', title: 'Story Arc Tracker', desc: 'Interactive timeline, key players, sentiment, predictions.', color: '#1b4332' },
  { key: 'video',      icon: '🎬', title: 'AI Video Studio', desc: 'Any article → broadcast-quality 60-second anchor video.',    color: '#1a1a2e' },
  { key: 'vernacular', icon: '🌐', title: 'Vernacular',      desc: 'Business news in Hindi, Tamil, Telugu & Bengali.',           color: '#0d1b2a' },
];

export default function HomePage({ setActivePage }) {
  useEffect(() => {
    const interval = setInterval(() => {}, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      <div className="ticker-bar">
        <div className="container ticker-inner">
          <span className="ticker-label">LIVE</span>
          <div className="ticker-track">
            {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, i) => (
              <span key={i} className="ticker-item">{item}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="ai-plugin-banner">
        <div className="container">
          <div className="plugin-banner-header">
            <span className="ai-badge">New — ET Intelligence Suite</span>
            <p className="plugin-banner-sub">AI-powered features built directly into your ET experience</p>
          </div>
          <div className="plugin-cards-grid">
            {AI_FEATURES.map(f => (
              <button
                key={f.key}
                className="plugin-card"
                style={{ background: f.color }}
                onClick={() => setActivePage && setActivePage(f.key)}
              >
                <span className="plugin-icon">{f.icon}</span>
                <div>
                  <div className="plugin-card-title">{f.title}</div>
                  <div className="plugin-card-desc">{f.desc}</div>
                </div>
                <span className="plugin-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container home-grid-wrapper">
        <div className="home-main-grid">
          <div className="home-primary">
            <div className="section-header">
              <hr className="section-divider" />
              <h2 className="section-title">Top Stories</h2>
            </div>
            <ArticleCard article={MOCK_ARTICLES[0]} variant="hero" />
            <div className="compact-list">
              {MOCK_ARTICLES.slice(1, 5).map(a => (
                <ArticleCard key={a.id} article={a} variant="compact" />
              ))}
            </div>
          </div>

          <div className="home-sidebar">
            <div className="section-header">
              <hr className="section-divider" />
              <h2 className="section-title">Markets</h2>
            </div>
            <div className="market-widget">
              {[
                { name: 'Sensex',     val: '72,845', change: '+305 (0.42%)', up: true },
                { name: 'Nifty 50',   val: '22,104', change: '+82 (0.37%)',  up: true },
                { name: 'Nifty Bank', val: '47,312', change: '-120 (0.25%)', up: false },
                { name: 'USD/INR',    val: '83.42',  change: '+0.12',        up: false },
              ].map(m => (
                <div key={m.name} className="market-row">
                  <span className="market-name">{m.name}</span>
                  <div className="market-vals">
                    <span className="market-val">{m.val}</span>
                    <span className={`market-change ${m.up ? 'up' : 'down'}`}>{m.change}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-header" style={{ marginTop: 24 }}>
              <hr className="section-divider" />
              <h2 className="section-title">More News</h2>
            </div>
            {MOCK_ARTICLES.slice(5).map(a => (
              <ArticleCard key={a.id} article={a} variant="compact" />
            ))}

            <div className="sidebar-ai-card">
              <span className="ai-badge">AI Briefing</span>
              <p className="sidebar-ai-text">Get a 60-second AI briefing on today's top business stories</p>
              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: 10 }}
                onClick={() => setActivePage && setActivePage('navigator')}
              >
                Open News Navigator →
              </button>
            </div>
          </div>
        </div>

        <div className="home-bottom-grid">
          <div className="section-header">
            <hr className="section-divider" />
            <h2 className="section-title">Trending</h2>
          </div>
          <div className="bottom-cards-grid">
            {MOCK_ARTICLES.slice(0, 4).map(a => (
              <ArticleCard key={a.id} article={a} variant="default" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}