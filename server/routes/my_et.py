from flask import Blueprint, request, jsonify
import json
import traceback
from services.personalization import (
    track_article_visit,
    get_personalized_feed,
    get_user_tag_weights,
    get_user_profile_summary,
    get_article_detail,
)
from database.models import get_db

my_et_bp = Blueprint("my_et", __name__)


@my_et_bp.route("/feed", methods=["GET"])
def feed():
    try:
        user_id = request.args.get("user_id", "guest")
        limit   = int(request.args.get("limit", 10))

        articles = get_personalized_feed(user_id, limit)
        weights  = get_user_tag_weights(user_id)
        top_tags = sorted(weights.items(), key=lambda x: x[1], reverse=True)[:8]
        profile_summary = get_user_profile_summary(user_id)

        return jsonify({
            "articles": articles,
            "top_tags": [{"tag": t, "weight": round(float(w), 2)} for t, w in top_tags],
            "profile_summary": profile_summary,
            "total":    len(articles),
        }), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "articles": [], "top_tags": [], "total": 0}), 500


@my_et_bp.route("/visit", methods=["POST"])
def visit():
    try:
        data       = request.get_json(silent=True) or {}
        user_id    = data.get("user_id", "guest")
        article_id = data.get("article_id")

        if article_id is None:
            return jsonify({"error": "article_id required"}), 400

        track_article_visit(user_id, article_id)

        weights  = get_user_tag_weights(user_id)
        top_tags = sorted(weights.items(), key=lambda x: x[1], reverse=True)[:8]

        return jsonify({
            "status":   "tracked",
            "top_tags": [{"tag": t, "weight": round(float(w), 2)} for t, w in top_tags],
        }), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "status": "failed", "top_tags": []}), 500


@my_et_bp.route("/profile/<user_id>", methods=["GET"])
def get_profile(user_id):
    try:
        weights  = get_user_tag_weights(user_id)
        top_tags = sorted(weights.items(), key=lambda x: x[1], reverse=True)

        conn    = get_db()
        history = conn.execute(
            """SELECT a.title, a.category, h.visited_at
               FROM user_article_history h
               JOIN articles a ON a.id = h.article_id
               WHERE h.user_id = ?
               ORDER BY h.visited_at DESC LIMIT 10""",
            (user_id,)
        ).fetchall()
        conn.close()

        return jsonify({
            "user_id":  user_id,
            "top_tags": [{"tag": t, "weight": round(float(w), 2)} for t, w in top_tags],
            "history":  [
                {
                    "title":      r["title"] or "",
                    "category":   r["category"] or "",
                    "visited_at": r["visited_at"] or "",
                }
                for r in history
            ],
        }), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "top_tags": [], "history": []}), 500


@my_et_bp.route("/persona", methods=["POST"])
def set_persona():
    try:
        data    = request.get_json(silent=True) or {}
        user_id = data.get("user_id", "guest")
        persona = data.get("persona", "")
        tags    = data.get("tags", [])

        if not isinstance(tags, list):
            tags = []

        conn = get_db()
        conn.execute(
            """
            INSERT INTO user_profile (user_id, persona)
            VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                persona = EXCLUDED.persona
            """,
            (user_id, persona)
        )
        for tag in tags:
            if not tag or not isinstance(tag, str):
                continue
            conn.execute("""
                INSERT INTO user_tag_weights (user_id, tag, weight)
                VALUES (?, ?, 2.0)
                ON CONFLICT(user_id, tag) DO UPDATE SET
                    weight = CASE
                        WHEN user_tag_weights.weight >= 2.0 THEN user_tag_weights.weight
                        ELSE 2.0
                    END
            """, (user_id, tag.strip()))
        conn.commit()
        conn.close()

        return jsonify({"status": "saved"}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@my_et_bp.route("/article/<int:article_id>", methods=["GET"])
def article_detail(article_id):
    try:
        article = get_article_detail(article_id)
        if not article:
            return jsonify({"error": "article not found"}), 404
        return jsonify({"article": article}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500