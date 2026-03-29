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
        category_weights = _get_user_category_weights(conn, user_id)

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

            tag_score = sum(weights.get(tag, 0) for tag in tags)
            category = a["category"] or "General"
            category_score = category_weights.get(category, 0.0)
            freshness_bonus = _freshness_bonus(a["published_at"])
            exploration_bonus = 0.8 if tag_score == 0 else 0.0
            score = (tag_score * 1.35) + (category_score * 0.9) + freshness_bonus + exploration_bonus
            matched = [t for t in tags if t in weights]
            reason = _build_reason(matched, category, tag_score, category_score, freshness_bonus)

            scored.append({
                "id":           article_id,
                "title":        a["title"] or "",
                "category":     a["category"] or "General",
                "summary":      a["summary"] or "",
                "source":       a["source"] or "ET Bureau",
                "tags":         tags,
                "score":        round(score, 3),
                "relevance_score": round(_to_relevance(score), 3),
                "reason":       reason,
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


def _freshness_bonus(ts):
    if not ts:
        return 0.25
    from datetime import datetime
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S"):
        try:
            dt = datetime.strptime(str(ts), fmt)
            diff_hours = (datetime.now() - dt).total_seconds() / 3600
            if diff_hours < 12:
                return 1.0
            if diff_hours < 48:
                return 0.6
            if diff_hours < 96:
                return 0.3
            return 0.1
        except ValueError:
            continue
    return 0.2


def _to_relevance(score):
    s = max(float(score), 0.0)
    return min(0.99, s / (s + 8.0))


def _get_user_category_weights(conn, user_id):
    rows = conn.execute(
        """SELECT a.category, COUNT(*) as c
           FROM user_article_history h
           JOIN articles a ON a.id = h.article_id
           WHERE h.user_id = ?
           GROUP BY a.category""",
        (user_id,),
    ).fetchall()

    weights = {}
    total = 0
    for r in rows:
        c = int(r["c"] or 0)
        if c <= 0:
            continue
        total += c
        weights[r["category"] or "General"] = c

    if total <= 0:
        return {}

    return {k: round((v / total) * 6.0, 3) for k, v in weights.items()}


def _build_reason(matched_tags, category, tag_score, category_score, freshness_bonus):
    if matched_tags:
        lead = ", ".join(matched_tags[:2])
        return f"Aligned with your interest in {lead} and {category} coverage"
    if category_score > 0:
        return f"Recommended from your frequent reading in {category}"
    if freshness_bonus >= 0.6:
        return "Trending fresh update to broaden your business coverage"
    if tag_score <= 0:
        return "Discovery pick to expand your personalized signal"
    return "Matched to your reading behavior"


def get_user_profile_summary(user_id):
    conn = get_db()
    try:
        tag_weights = get_user_tag_weights(user_id)
        category_weights = _get_user_category_weights(conn, user_id)

        total_reads_row = conn.execute(
            "SELECT COUNT(*) as c FROM user_article_history WHERE user_id = ?",
            (user_id,),
        ).fetchone()
        total_reads = int(total_reads_row["c"] or 0)

        top_categories = sorted(category_weights.items(), key=lambda x: x[1], reverse=True)[:3]
        top_tags = sorted(tag_weights.items(), key=lambda x: x[1], reverse=True)[:5]

        profile_level = "Starter"
        if total_reads >= 12 and len(top_tags) >= 4:
            profile_level = "Advanced"
        elif total_reads >= 5 and len(top_tags) >= 2:
            profile_level = "Growing"

        return {
            "profile_level": profile_level,
            "total_reads": total_reads,
            "top_categories": [{"category": c, "weight": round(float(w), 2)} for c, w in top_categories],
            "top_tags": [{"tag": t, "weight": round(float(w), 2)} for t, w in top_tags],
        }
    except Exception as e:
        print(f"[get_user_profile_summary] error: {e}")
        return {
            "profile_level": "Starter",
            "total_reads": 0,
            "top_categories": [],
            "top_tags": [],
        }
    finally:
        conn.close()


def get_article_detail(article_id):
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, title, category, summary, source, tags, published_at FROM articles WHERE id = ?",
            (int(article_id),),
        ).fetchone()

        if not row:
            return None

        raw_tags = row["tags"]
        try:
            tags = json.loads(raw_tags) if raw_tags else []
        except (json.JSONDecodeError, TypeError):
            tags = []

        tags = [t for t in tags if t and isinstance(t, str)]

        return {
            "id": int(row["id"]),
            "title": row["title"] or "",
            "category": row["category"] or "General",
            "summary": row["summary"] or "",
            "source": row["source"] or "ET Bureau",
            "tags": tags,
            "time": _relative_time(row["published_at"]),
            "published_at": row["published_at"] or "",
        }
    except Exception as e:
        print(f"[get_article_detail] error: {e}")
        return None
    finally:
        conn.close()