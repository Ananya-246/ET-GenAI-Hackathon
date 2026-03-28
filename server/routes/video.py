from flask import Blueprint, request, jsonify
import json
from services.llm_service import generate_video_script
from services.tts_service import generate_audio
from database.models import get_db

video_bp = Blueprint("video", __name__)


@video_bp.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    article_text = data.get("article_text", "")
    style = data.get("style", "Breaking News")
    voice = data.get("voice", "Priya (Female, News)")

    if not article_text.strip():
        return jsonify({"error": "article_text is required"}), 400

    try:
        raw = generate_video_script(article_text, style, voice)
        cleaned = raw.strip().strip("```json").strip("```").strip()
        parsed = json.loads(cleaned)

        conn = get_db()
        conn.execute(
            "INSERT INTO video_scripts (article_text, style, voice, script) VALUES (?, ?, ?, ?)",
            (article_text, style, voice, parsed.get("script", ""))
        )
        conn.commit()
        conn.close()

        return jsonify(parsed), 200
    except json.JSONDecodeError:
        return jsonify({"error": "AI returned invalid JSON", "raw": raw}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@video_bp.route("/tts", methods=["POST"])
def tts():
    data = request.get_json()
    script_text = data.get("script_text", "")
    voice = data.get("voice", "Priya (Female, News)")

    if not script_text.strip():
        return jsonify({"error": "script_text is required"}), 400

    audio_path, error = generate_audio(script_text, voice)

    if error:
        return jsonify({"error": error}), 500

    audio_url = f"http://localhost:5000/{audio_path}"
    return jsonify({"audio_url": audio_url}), 200