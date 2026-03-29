import requests
import base64
import time
import os
from dotenv import load_dotenv

load_dotenv()

DID_API_KEY = os.getenv("DID_API_KEY")
DID_BASE    = "https://api.d-id.com"

PUBLIC_PRESENTERS = {
    "Priya (Female, News)":           "v2_public_Amber@0zSz8kflCN",
    "Arjun (Male, Formal)":           "v2_public_Adam@0GLJgELXjc",
    "Deepa (Female, Conversational)": "v2_public_Amber@0zSz8kflCN",
}

VOICE_MAP = {
    "Priya (Female, News)":           {"type": "microsoft", "voice_id": "en-IN-NeerjaNeural"},
    "Arjun (Male, Formal)":           {"type": "microsoft", "voice_id": "en-IN-PrabhatNeural"},
    "Deepa (Female, Conversational)": {"type": "microsoft", "voice_id": "en-IN-NeerjaNeural"},
}


def _auth_header():
    token = base64.b64encode(DID_API_KEY.encode()).decode()
    return {
        "Authorization": f"Basic {token}",
        "Content-Type":  "application/json",
        "accept":        "application/json",
    }


def _get_available_presenter(headers):
    resp = requests.get(f"{DID_BASE}/clips/presenters", headers=headers, timeout=10)
    if resp.status_code == 200:
        presenters = resp.json().get("presenters", [])
        if presenters:
            return presenters[0].get("presenter_id")
    return None


def create_anchor_video(script_text, voice="Priya (Female, News)"):
    import re
    clean_script = re.sub(r"\[.*?\]", "", script_text).strip()
    if len(clean_script) > 900:
        clean_script = clean_script[:900] + "."

    headers      = _auth_header()
    voice_cfg    = VOICE_MAP.get(voice, VOICE_MAP["Priya (Female, News)"])
    presenter_id = PUBLIC_PRESENTERS.get(voice, "v2_public_Amber@0zSz8kflCN")

    payload = {
        "presenter_id": presenter_id,
        "script": {
            "type":     "text",
            "input":    clean_script,
            "provider": voice_cfg,
        },
        "config": {"result_format": "mp4"},
    }

    resp = requests.post(
        f"{DID_BASE}/clips",
        json=payload,
        headers=headers,
        timeout=30,
    )

    if resp.status_code not in (200, 201):
        fallback_presenter = _get_available_presenter(headers)
        if fallback_presenter and fallback_presenter != presenter_id:
            payload["presenter_id"] = fallback_presenter
            resp = requests.post(
                f"{DID_BASE}/clips",
                json=payload,
                headers=headers,
                timeout=30,
            )

    if resp.status_code not in (200, 201):
        return None, f"D-ID clips failed: {resp.status_code} — {resp.text}"

    clip_id = resp.json().get("id")
    if not clip_id:
        return None, "D-ID returned no clip ID"

    for attempt in range(40):
        time.sleep(5)
        poll   = requests.get(f"{DID_BASE}/clips/{clip_id}", headers=headers, timeout=15)
        data   = poll.json()
        status = data.get("status")

        if status == "done":
            video_url = data.get("result_url")
            if video_url:
                return video_url, None
            return None, "D-ID done but no result_url"

        if status == "error":
            return None, f"D-ID clip error: {data.get('error', {})}"

    return None, "D-ID timed out after 3 minutes"