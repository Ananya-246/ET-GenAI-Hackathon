import "./ArticleCard.css";

export default function ArticleCard({ article, variant = "default", badge }) {
  const { title, category, time, image, summary, source } = article;

  if (variant === "hero") {
    return (
      <div className="article-card hero-card">
        {image && <div className="hero-img" style={{ backgroundImage: `url(${image})` }} />}
        <div className="hero-body">
          {badge && <span className="ai-badge" style={{ marginBottom: 8, display: "inline-flex" }}>{badge}</span>}
          <span className="tag">{category}</span>
          <h2 className="hero-title">{title}</h2>
          {summary && <p className="hero-summary">{summary}</p>}
          <div className="article-meta">
            <span>{source || "ET Bureau"}</span>
            <span>·</span>
            <span>{time}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="article-card compact-card">
        <div className="compact-body">
          {badge && <span className="ai-badge" style={{ marginBottom: 6, fontSize: 9 }}>{badge}</span>}
          <span className="tag" style={{ fontSize: 10 }}>{category}</span>
          <p className="compact-title">{title}</p>
          <span className="article-time">{time}</span>
        </div>
        {image && <div className="compact-img" style={{ backgroundImage: `url(${image})` }} />}
      </div>
    );
  }

  return (
    <div className="article-card default-card">
      {image && <div className="default-img" style={{ backgroundImage: `url(${image})` }} />}
      <div className="default-body">
        {badge && <span className="ai-badge" style={{ marginBottom: 6, fontSize: 9 }}>{badge}</span>}
        <span className="tag" style={{ fontSize: 10 }}>{category}</span>
        <p className="default-title">{title}</p>
        <div className="article-meta">
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}