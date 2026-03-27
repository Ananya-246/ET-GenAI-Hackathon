import { useState } from "react";
import ArticleCard from "../components/ArticleCard";
import "./MyETPage.css";

const PERSONAS = [
  { id: "investor", label: "Mutual Fund Investor", icon: "📈", tags: ["Mutual Funds", "Equity", "Markets", "SIP"] },
  { id: "founder", label: "Startup Founder", icon: "🚀", tags: ["Startups", "Funding", "VC", "Tech"] },
  { id: "student", label: "Finance Student", icon: "🎓", tags: ["Explainers", "Economy", "Basics"] },
  { id: "trader", label: "Active Trader", icon: "💹", tags: ["F&O", "Technical", "Markets", "IPO"] },
  { id: "executive", label: "Corporate Executive", icon: "🏢", tags: ["Industry", "Policy", "Leadership"] },
];

const FEED_ARTICLES = {
  investor: [
    { id: 1, title: "Top 5 large-cap mutual funds to watch in FY2027: Expert picks", category: "Mutual Funds", time: "1h ago" },
    { id: 2, title: "SIP flows hit record ₹21,000 crore in March — retail participation surges", category: "Markets", time: "2h ago" },
    { id: 3, title: "ELSS vs PPF: Which tax-saving instrument wins in 2026?", category: "Wealth", time: "3h ago" },
    { id: 4, title: "Nifty 50 PE ratio at 22x — is the market overvalued?", category: "Analysis", time: "4h ago" },
    { id: 5, title: "Debt mutual funds post 7.8% returns in Q4; better than FDs?", category: "MF", time: "5h ago" },
  ],
  founder: [
    { id: 1, title: "VC funding in India startups hits $2.1B in Q1 2026 — Fintech leads", category: "Startups", time: "1h ago" },
    { id: 2, title: "Sequoia backs Bengaluru B2B SaaS startup with $30M Series B", category: "Funding", time: "2h ago" },
    { id: 3, title: "DPIIT simplifies startup registration: one-day process live", category: "Policy", time: "3h ago" },
    { id: 4, title: "How Zepto's quick commerce playbook is reshaping retail logistics", category: "Tech", time: "4h ago" },
    { id: 5, title: "Angel tax abolished — what it means for early-stage founders", category: "Startups", time: "5h ago" },
  ],
  student: [
    { id: 1, title: "Explainer: What is a repo rate and why does it matter for your EMI?", category: "Economy 101", time: "1h ago" },
    { id: 2, title: "Understanding India's current account deficit in 5 simple charts", category: "Basics", time: "2h ago" },
    { id: 3, title: "What the Union Budget means for a college student", category: "Budget", time: "3h ago" },
    { id: 4, title: "How inflation erodes your savings — and what you can do about it", category: "Explainer", time: "4h ago" },
    { id: 5, title: "Decoding ESG investing: Why companies are going green", category: "Finance", time: "5h ago" },
  ],
  trader: [
    { id: 1, title: "Nifty Bank options chain shows strong put writing at 47,000 strike", category: "F&O", time: "30m ago" },
    { id: 2, title: "Technical view: Sensex forms double bottom — target 75,000?", category: "Technical", time: "1h ago" },
    { id: 3, title: "FII flows: Net buyers for third consecutive session, ₹4,200cr inflow", category: "Markets", time: "2h ago" },
    { id: 4, title: "3 upcoming IPOs to watch: GMP, subscription outlook & analysis", category: "IPO", time: "3h ago" },
    { id: 5, title: "India VIX falls to 13.2 — what it signals for Nifty direction", category: "Markets", time: "4h ago" },
  ],
  executive: [
    { id: 1, title: "India's PLI scheme attracts ₹1.2 lakh crore — 5 sectors transforming", category: "Policy", time: "1h ago" },
    { id: 2, title: "C-suite salaries rise 18% in FY26; CFOs and CTOs in highest demand", category: "Leadership", time: "2h ago" },
    { id: 3, title: "Boardroom diversity push: Sebi mandates 30% women directors by 2027", category: "Governance", time: "3h ago" },
    { id: 4, title: "Manufacturing vs services: India's GDP composition shifts post-COVID", category: "Economy", time: "4h ago" },
    { id: 5, title: "AI adoption in India Inc: 65% firms plan GenAI pilot by year-end", category: "Tech", time: "5h ago" },
  ],
};

export default function MyETPage() {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [customInterests, setCustomInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedReady, setFeedReady] = useState(false);
  const [inputTag, setInputTag] = useState("");

  const selectPersona = (p) => {
    setSelectedPersona(p);
    setCustomInterests(p.tags);
    setFeedReady(false);
  };

  const removeTag = (tag) => setCustomInterests(prev => prev.filter(t => t !== tag));

  const addTag = () => {
    if (inputTag.trim() && !customInterests.includes(inputTag.trim())) {
      setCustomInterests(prev => [...prev, inputTag.trim()]);
      setInputTag("");
    }
  };

  const generateFeed = () => {
    setLoading(true);
    setFeedReady(false);
    setTimeout(() => { setLoading(false); setFeedReady(true); }, 1800);
  };

  const articles = feedReady && selectedPersona ? FEED_ARTICLES[selectedPersona.id] || [] : [];

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
                className={`persona-card ${selectedPersona?.id === p.id ? "active" : ""}`}
                onClick={() => selectPersona(p)}
              >
                <span className="persona-icon">{p.icon}</span>
                <span className="persona-label">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedPersona && (
          <div className="interests-section">
            <h3 className="my-et-section-label">Your interests</h3>
            <div className="tags-row">
              {customInterests.map(tag => (
                <span key={tag} className="interest-tag">
                  {tag}
                  <button className="tag-remove" onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
            </div>
            <div className="tag-input-row">
              <input
                value={inputTag}
                onChange={e => setInputTag(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag()}
                placeholder="Add custom topic (e.g. Electric Vehicles)..."
                style={{ maxWidth: 320 }}
              />
              <button className="btn-outline" onClick={addTag}>+ Add</button>
            </div>
            <button className="btn-primary" onClick={generateFeed} disabled={loading} style={{ marginTop: 16 }}>
              {loading ? <><span className="spinner" /> Personalizing...</> : "Generate My Feed →"}
            </button>
          </div>
        )}

        {feedReady && (
          <div className="feed-section">
            <div className="feed-header">
              <hr className="section-divider" />
              <div className="feed-header-row">
                <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Your Personalized Feed</h2>
                <span className="ai-badge">AI curated</span>
              </div>
              <p className="feed-sub">Tailored for {selectedPersona.label} · Updated now</p>
            </div>
            <div className="feed-list">
              {articles.map((a, i) => (
                <div key={a.id} className="feed-item">
                  <span className="feed-rank">{i + 1}</span>
                  <ArticleCard article={a} variant="compact" badge={i === 0 ? "Top Pick" : null} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}