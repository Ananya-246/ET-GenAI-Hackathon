from flask import Blueprint, jsonify, request
import traceback

from services.navigator_service import create_briefing, answer_briefing_question

navigator_bp = Blueprint("navigator", __name__)


@navigator_bp.route("/briefing", methods=["POST"])
def briefing():
    try:
        data = request.get_json(silent=True) or {}
        topic = data.get("topic", "")
        user_id = data.get("user_id", "guest")
        max_sources = data.get("max_sources", 8)

        try:
            max_sources = int(max_sources)
        except (TypeError, ValueError):
            max_sources = 8

        max_sources = max(3, min(max_sources, 12))

        payload = create_briefing(topic=topic, user_id=user_id, max_sources=max_sources)
        return jsonify(payload), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"briefing generation failed: {str(e)}"}), 500


@navigator_bp.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.get_json(silent=True) or {}
        briefing_id = data.get("briefing_id", "")
        question = data.get("question", "")

        payload = answer_briefing_question(briefing_id=briefing_id, question=question)
        return jsonify(payload), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"question answering failed: {str(e)}"}), 500
