from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.auth import auth_bp
from routes.my_et import my_et_bp
from routes.video import video_bp
from routes.navigator import navigator_bp
from routes.vernacular import vernacular_bp
from routes.story_arc import story_arc_bp
from database.models import init_db
import os

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": ["https://bucolic-sfogliatella-4ee12c.netlify.app", "http://localhost:3000"]}})

# Register auth routes (public - no auth required)
app.register_blueprint(auth_bp, url_prefix="/api/auth")

# Register feature routes (auth required)
app.register_blueprint(my_et_bp, url_prefix="/api/my-et")
app.register_blueprint(video_bp, url_prefix="/api/video")
app.register_blueprint(navigator_bp, url_prefix="/api/navigator")
app.register_blueprint(vernacular_bp, url_prefix="/api/vernacular")
app.register_blueprint(story_arc_bp, url_prefix="/api/story-arc")


@app.route("/static/audio/<path:filename>")
def serve_audio(filename):
    return send_from_directory("static/audio", filename)


@app.route("/static/videos/<path:filename>")
def serve_video(filename):
    return send_from_directory("static/videos", filename)


@app.route("/health")
def health():
    return {"status": "ok"}, 200


with app.app_context():
    init_db()
    os.makedirs("static/audio", exist_ok=True)
    os.makedirs("static/videos", exist_ok=True)

if __name__ == "__main__":
    app.run(debug=True, port=5000)