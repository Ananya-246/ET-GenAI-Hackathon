from flask import Blueprint, request, jsonify
import json
from services.llm_service import get_personalized_feed
from database.models import get_db

my_et_bp = Blueprint("my_et", __name__)


@my_et_bp.route("/feed", methods=["POST"])
def feed():
    data = request.get_json()
    persona = data.get("persona")
    interests = data.get("interests", [])

    if not persona:
        return jsonify({"error": "persona is required"}), 400

    try:
        raw = get_personalized_feed(persona, interests)
        cleaned = raw.strip().strip("```json").strip("```").strip()
        parsed = json.loads(cleaned)
        return jsonify(parsed), 200
    except json.JSONDecodeError:
        return jsonify({"error": "AI returned invalid JSON", "raw": raw}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@my_et_bp.route("/profile", methods=["POST"])
def save_profile():
    data = request.get_json()
    user_id = data.get("user_id", "guest")
    persona = data.get("persona")
    interests = data.get("interests", [])

    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO user_profile (user_id, persona, interests) VALUES (?, ?, ?)",
        (user_id, persona, json.dumps(interests))
    )
    conn.commit()
    conn.close()
    return jsonify({"status": "saved"}), 200


@my_et_bp.route("/profile/<user_id>", methods=["GET"])
def get_profile(user_id):
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM user_profile WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1",
        (user_id,)
    ).fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Profile not found"}), 404

    return jsonify({
        "user_id": row["user_id"],
        "persona": row["persona"],
        "interests": json.loads(row["interests"])
    }), 200