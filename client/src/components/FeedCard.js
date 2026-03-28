import './FeedCard.css';

export default function FeedCard({ article, rank }) {
  const { title, category, time, relevance_score, reason } = article;

  return (
    <div className="feed-card">
      <div className="feed-card-rank">{rank}</div>
      <div className="feed-card-body">
        <div className="feed-card-top">
          <span className="tag">{category}</span>
          {relevance_score && (
            <span className="relevance-pill">
              {Math.round(relevance_score * 100)}% match
            </span>
          )}
        </div>
        <p className="feed-card-title">{title}</p>
        {reason && <p className="feed-card-reason">↳ {reason}</p>}
        <span className="article-time">{time}</span>
      </div>
    </div>
  );
}