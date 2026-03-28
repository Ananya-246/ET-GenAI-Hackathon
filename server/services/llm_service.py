from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def get_personalized_feed(persona, interests):
    interests_str = ", ".join(interests)

    prompt = f"""You are ET Intelligence, the AI engine for The Economic Times of India.

A user has this profile:
- Persona: {persona}
- Interests: {interests_str}

Generate a personalized news feed of exactly 6 articles relevant to this user.
Return ONLY valid JSON with no extra text, markdown, or code blocks. Just raw JSON.

Format:
{{
  "articles": [
    {{
      "id": 1,
      "title": "article headline here",
      "category": "category name",
      "time": "Xh ago",
      "relevance_score": 0.95,
      "reason": "one short sentence why this matters to this user"
    }}
  ]
}}

Make articles realistic India-focused business news for 2026.
Keep titles concise and journalistic."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1500,
    )
    return response.choices[0].message.content


def generate_video_script(article_text, style, voice):
    voice_desc = {
        "Priya (Female, News)": "confident female news anchor",
        "Arjun (Male, Formal)": "formal male business journalist",
        "Deepa (Female, Conversational)": "warm conversational female presenter"
    }.get(voice, "professional news anchor")

    prompt = f"""You are a broadcast scriptwriter for The Economic Times, India's top business newspaper.

Write a {style} video script (60-90 seconds when read aloud) based on:
{article_text}

Narrator style: {voice_desc}

Return ONLY valid JSON with no extra text, markdown, or code blocks. Just raw JSON.

Format:
{{
  "script": "Full script text. Use [Scene: description] for visual directions on their own lines.",
  "duration_estimate": "75 seconds",
  "stats": [
    {{"label": "Key Metric", "value": "6.5%", "change": "Unchanged", "trend": "unchanged"}},
    {{"label": "GDP FY27", "value": "7.2%", "change": "Revised up", "trend": "up"}},
    {{"label": "MPC Vote", "value": "4-2", "change": "Pause", "trend": "unchanged"}}
  ],
  "word_count": 150
}}

Extract real numbers from the article for stats. Trend must be: up, down, or unchanged."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6,
        max_tokens=1500,
    )
    return response.choices[0].message.content