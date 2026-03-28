from gtts import gTTS
import os
import hashlib


def generate_audio(script_text, voice):
    os.makedirs("static/audio", exist_ok=True)

    lang_map = {
        "Priya (Female, News)": "en",
        "Arjun (Male, Formal)": "en",
        "Deepa (Female, Conversational)": "en",
    }
    lang = lang_map.get(voice, "en")

    file_hash = hashlib.md5(script_text.encode()).hexdigest()[:10]
    filename = f"static/audio/script_{file_hash}.mp3"

    if os.path.exists(filename):
        return filename, None

    try:
        tts = gTTS(text=script_text, lang=lang, slow=False)
        tts.save(filename)
        return filename, None
    except Exception as e:
        return None, str(e)