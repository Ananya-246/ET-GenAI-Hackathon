from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.my_et import my_et_bp
from routes.video import video_bp
from database.models import init_db
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

app.register_blueprint(my_et_bp, url_prefix="/api/my-et")
app.register_blueprint(video_bp, url_prefix="/api/video")

@app.route("/static/audio/<filename>")
def serve_audio(filename):
    return send_from_directory("static/audio", filename)

with app.app_context():
    init_db()
    os.makedirs("static/audio", exist_ok=True)

if __name__ == "__main__":
    app.run(debug=True, port=5000)