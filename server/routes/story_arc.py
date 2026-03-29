from flask import Blueprint, jsonify, request
import traceback

from services.story_arc_service import generate_story_arc, get_story_candidates

story_arc_bp = Blueprint("story_arc", __name__)


@story_arc_bp.route("/candidates", methods=["GET"])
def candidates():
    try:
        limit = request.args.get("limit", 12)
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = 12

        items = get_story_candidates(limit=limit)
        return jsonify({"candidates": items, "total": len(items)}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "candidates": [], "total": 0}), 500


@story_arc_bp.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json(silent=True) or {}
        topic = data.get("topic", "")
        max_sources = data.get("max_sources", 10)

        payload = generate_story_arc(topic=topic, max_sources=max_sources)
        return jsonify(payload), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"story arc generation failed: {str(e)}"}), 500
