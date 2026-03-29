from flask import Blueprint, jsonify, request
import traceback

from services.vernacular_service import get_recent_articles, translate_article, translate_news

vernacular_bp = Blueprint("vernacular", __name__)


@vernacular_bp.route("/articles", methods=["GET"])
def recent_articles():
    try:
        limit = request.args.get("limit", 12)
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = 12

        limit = max(4, min(limit, 30))
        payload = get_recent_articles(limit=limit)
        return jsonify({"articles": payload, "total": len(payload)}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "articles": [], "total": 0}), 500


@vernacular_bp.route("/translate", methods=["POST"])
def translate_text():
    try:
        data = request.get_json(silent=True) or {}
        source_text = data.get("source_text", "")
        language_code = data.get("language_code", "hi")
        audience_hint = data.get("audience_hint", "business readers")

        payload = translate_news(
            source_text=source_text,
            language_code=language_code,
            audience_hint=audience_hint,
        )
        return jsonify(payload), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"translation failed: {str(e)}"}), 500


@vernacular_bp.route("/translate-article", methods=["POST"])
def translate_from_article():
    try:
        data = request.get_json(silent=True) or {}
        article_id = data.get("article_id")
        language_code = data.get("language_code", "hi")
        audience_hint = data.get("audience_hint", "business readers")

        if article_id is None:
            return jsonify({"error": "article_id is required"}), 400

        payload = translate_article(
            article_id=article_id,
            language_code=language_code,
            audience_hint=audience_hint,
        )
        return jsonify(payload), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"article translation failed: {str(e)}"}), 500
