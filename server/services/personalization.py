import json
from database.models import get_db

DECAY = 0.92


def track_article_visit(user_id, article_id):
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT tags FROM articles WHERE id = ?", (int(article_id),)
        ).fetchone()

        if not row:
            return

        raw_tags = row["tags"]
        if not raw_tags:
            return

        try:
            tags = json.loads(raw_tags)
        except (json.JSONDecodeError, TypeError):
            tags = []

        if not tags:
            return

        conn.execute(
            "INSERT OR IGNORE INTO user_profile (user_id) VALUES (?)", (user_id,)
        )

        for tag in tags:
            if not tag or not isinstance(tag, str):
                continue
            conn.execute("""
                INSERT INTO user_tag_weights (user_id, tag, weight, updated_at)
                VALUES (?, ?, 1.0, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, tag) DO UPDATE SET
                    weight = MIN(weight * ? + 1.0, 20.0),
                    updated_at = CURRENT_TIMESTAMP
            """, (user_id, tag.strip(), DECAY))

        conn.execute(
            "INSERT INTO user_article_history (user_id, article_id) VALUES (?, ?)",
            (user_id, int(article_id))
        )

        conn.commit()
    except Exception as e:
        print(f"[track_article_visit] error: {e}")
    finally:
        conn.close()


def get_user_tag_weights(user_id):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT tag, weight FROM user_tag_weights WHERE user_id = ? ORDER BY weight DESC",
            (user_id,)
        ).fetchall()
        return {r["tag"]: float(r["weight"]) for r in rows if r["tag"]}
    except Exception as e:
        print(f"[get_user_tag_weights] error: {e}")
        return {}
    finally:
        conn.close()


def get_personalized_feed(user_id, limit=10):
    conn = get_db()
    try:
        weights = get_user_tag_weights(user_id)

        visited = set()
        for r in conn.execute(
            "SELECT article_id FROM user_article_history WHERE user_id = ?", (user_id,)
        ).fetchall():
            try:
                visited.add(int(r["article_id"]))
            except (TypeError, ValueError):
                pass

        articles = conn.execute(
            "SELECT id, title, category, summary, source, tags, published_at FROM articles"
        ).fetchall()

        scored = []
        for a in articles:
            try:
                article_id = int(a["id"])
            except (TypeError, ValueError):
                continue

            if article_id in visited:
                continue

            raw_tags = a["tags"]
            try:
                tags = json.loads(raw_tags) if raw_tags else []
            except (json.JSONDecodeError, TypeError):
                tags = []

            tags = [t for t in tags if t and isinstance(t, str)]

            score = sum(weights.get(tag, 0) for tag in tags)
            matched = [t for t in tags if t in weights]

            scored.append({
                "id":           article_id,
                "title":        a["title"] or "",
                "category":     a["category"] or "General",
                "summary":      a["summary"] or "",
                "source":       a["source"] or "ET Bureau",
                "tags":         tags,
                "score":        round(score, 3),
                "matched_tags": matched,
                "time":         _relative_time(a["published_at"]),
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:limit]

    except Exception as e:
        print(f"[get_personalized_feed] error: {e}")
        return []
    finally:
        conn.close()


def decay_all_weights(user_id):
    conn = get_db()
    try:
        conn.execute(
            "UPDATE user_tag_weights SET weight = weight * ? WHERE user_id = ?",
            (DECAY, user_id)
        )
        conn.execute(
            "DELETE FROM user_tag_weights WHERE user_id = ? AND weight < 0.1",
            (user_id,)
        )
        conn.commit()
    except Exception as e:
        print(f"[decay_all_weights] error: {e}")
    finally:
        conn.close()


def _relative_time(ts):
    if not ts:
        return "Recently"
    from datetime import datetime
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S"):
        try:
            dt   = datetime.strptime(str(ts), fmt)
            diff = (datetime.now() - dt).total_seconds()
            if diff < 3600:
                return f"{int(diff / 60)}m ago"
            if diff < 86400:
                return f"{int(diff / 3600)}h ago"
            return f"{int(diff / 86400)}d ago"
        except ValueError:
            continue
    return "Recently"