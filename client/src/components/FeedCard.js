import './FeedCard.css';

export default function FeedCard({ article, rank }) {
  if (!article) return null;

  const title           = article.title           || 'Untitled';
  const category        = article.category        || 'General';
  const time            = article.time            || 'Recently';
  const relevance_score = article.relevance_score || 0;
  const reason          = article.reason          || '';

  return (
    <div className="feed-card">
      <div className="feed-card-rank">{rank}</div>
      <div className="feed-card-body">
        <div className="feed-card-top">
          <span className="tag">{category}</span>
          {relevance_score > 0 && (
            <span className="relevance-pill">
              {Math.min(Math.round(relevance_score * 100), 99)}% match
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