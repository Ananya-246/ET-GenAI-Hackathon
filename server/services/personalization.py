import json
from database.models import get_db

DECAY = 0.92


def track_article_visit(user_id, article_id):
    conn = get_db()

    row = conn.execute(
        "SELECT tags FROM articles WHERE id = ?", (article_id,)
    ).fetchone()

    if not row:
        conn.close()
        return

    tags = json.loads(row["tags"])

    conn.execute(
        "INSERT OR IGNORE INTO user_profile (user_id) VALUES (?)", (user_id,)
    )

    for tag in tags:
        conn.execute("""
            INSERT INTO user_tag_weights (user_id, tag, weight, updated_at)
            VALUES (?, ?, 1.0, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, tag) DO UPDATE SET
                weight = MIN(weight * ? + 1.0, 20.0),
                updated_at = CURRENT_TIMESTAMP
        """, (user_id, tag, DECAY))

    conn.execute(
        "INSERT INTO user_article_history (user_id, article_id) VALUES (?, ?)",
        (user_id, article_id)
    )

    conn.commit()
    conn.close()


def get_user_tag_weights(user_id):
    conn = get_db()
    rows = conn.execute(
        "SELECT tag, weight FROM user_tag_weights WHERE user_id = ? ORDER BY weight DESC",
        (user_id,)
    ).fetchall()
    conn.close()
    return {r["tag"]: r["weight"] for r in rows}


def get_personalized_feed(user_id, limit=10):
    conn = get_db()

    weights = get_user_tag_weights(user_id)

    visited = set(
        r["article_id"] for r in conn.execute(
            "SELECT article_id FROM user_article_history WHERE user_id = ?", (user_id,)
        ).fetchall()
    )

    articles = conn.execute(
        "SELECT id, title, category, summary, source, tags, published_at FROM articles"
    ).fetchall()
    conn.close()

    scored = []
    for a in articles:
        if a["id"] in visited:
            continue
        tags = json.loads(a["tags"])
        score = sum(weights.get(tag, 0) for tag in tags)
        scored.append({
            "id": a["id"],
            "title": a["title"],
            "category": a["category"],
            "summary": a["summary"],
            "source": a["source"] or "ET Bureau",
            "tags": tags,
            "score": score,
            "matched_tags": [t for t in tags if t in weights],
            "time": _relative_time(a["published_at"]),
        })

    scored.sort(key=lambda x: x["score"], reverse=True)

    if not any(a["score"] > 0 for a in scored):
        return scored[:limit]

    return scored[:limit]


def decay_all_weights(user_id):
    conn = get_db()
    conn.execute(
        "UPDATE user_tag_weights SET weight = weight * ? WHERE user_id = ?",
        (DECAY, user_id)
    )
    conn.execute(
        "DELETE FROM user_tag_weights WHERE user_id = ? AND weight < 0.1",
        (user_id,)
    )
    conn.commit()
    conn.close()


def _relative_time(ts):
    if not ts:
        return "Recently"
    from datetime import datetime
    try:
        dt = datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
        diff = (datetime.now() - dt).total_seconds()
        if diff < 3600:
            return f"{int(diff/60)}m ago"
        if diff < 86400:
            return f"{int(diff/3600)}h ago"
        return f"{int(diff/86400)}d ago"
    except Exception:
        return "Recently"