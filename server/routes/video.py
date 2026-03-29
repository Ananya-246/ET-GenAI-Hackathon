from flask import Blueprint, request, jsonify, send_from_directory
import json, os, hashlib, traceback
from services.llm_service import generate_video_script
from services.did_service import create_anchor_video
from database.models import get_db

video_bp = Blueprint("video", __name__)


@video_bp.route("/generate", methods=["POST"])
def generate():
    data         = request.get_json()
    article_text = data.get("article_text", "")
    style        = data.get("style", "Breaking News")
    voice        = data.get("voice", "Priya (Female, News)")

    if not article_text.strip():
        return jsonify({"error": "article_text is required"}), 400

    try:
        raw     = generate_video_script(article_text, style, voice)
        cleaned = raw.strip().strip("```json").strip("```").strip()
        parsed  = json.loads(cleaned)
    except json.JSONDecodeError:
        return jsonify({"error": "LLM returned invalid JSON", "raw": raw}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Script generation failed: {str(e)}"}), 500

    script = parsed.get("script", article_text)
    stats  = parsed.get("stats", [])

    video_url, err = create_anchor_video(script, voice)
    if err:
        traceback.print_exc()
        return jsonify({"error": f"Video generation failed: {err}"}), 500

    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO video_scripts (article_text, style, voice, script) VALUES (?, ?, ?, ?)",
            (article_text, style, voice, script)
        )
        conn.commit()
        conn.close()
    except Exception:
        pass

    return jsonify({
        "script":    script,
        "stats":     stats,
        "video_url": video_url,
        "duration":  parsed.get("duration_estimate", "60 seconds"),
    }), 200


@video_bp.route("/static/audio/<filename>")
def serve_audio(filename):
    return send_from_directory("static/audio", filename)