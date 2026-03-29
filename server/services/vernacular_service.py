import json
import re

from database.models import get_db
from services.llm_service import client, MODEL

LANGUAGE_MAP = {
    "hi": {"name": "Hindi", "locale": "India", "script": "Devanagari"},
    "ta": {"name": "Tamil", "locale": "Tamil Nadu", "script": "Tamil"},
    "te": {"name": "Telugu", "locale": "Andhra Pradesh and Telangana", "script": "Telugu"},
    "bn": {"name": "Bengali", "locale": "West Bengal", "script": "Bengali"},
}


def _extract_json(raw_text):
    text = (raw_text or "").strip()
    if not text:
        raise ValueError("Empty model response")

    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text).strip()
        text = re.sub(r"```$", "", text).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found")
    return json.loads(text[start:end + 1])


def _extract_numbers_and_percents(text):
    return set(re.findall(r"\b\d+(?:\.\d+)?%?\b", text or ""))


def _validate_facts(source_text, translated_text):
    source_numbers = _extract_numbers_and_percents(source_text)
    target_numbers = _extract_numbers_and_percents(translated_text)
    if not source_numbers:
        return True
    return source_numbers.issubset(target_numbers)


def _fetch_article(article_id):
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, title, category, summary, source, tags, published_at FROM articles WHERE id = ?",
            (int(article_id),),
        ).fetchone()
    finally:
        conn.close()

    if not row:
        return None

    tags = []
    try:
        tags = json.loads(row["tags"]) if row["tags"] else []
    except (json.JSONDecodeError, TypeError):
        tags = []

    return {
        "id": int(row["id"]),
        "title": row["title"] or "",
        "category": row["category"] or "General",
        "summary": row["summary"] or "",
        "source": row["source"] or "ET Bureau",
        "tags": [t for t in tags if isinstance(t, str) and t.strip()],
        "published_at": row["published_at"] or "",
    }


def _build_prompt(source_text, language_code, audience_hint="business readers", article_meta=None):
    lang = LANGUAGE_MAP.get(language_code)
    if not lang:
        raise ValueError("Unsupported language")

    article_meta_block = ""
    if article_meta:
        article_meta_block = (
            f"Article title: {article_meta.get('title', '')}\n"
            f"Category: {article_meta.get('category', '')}\n"
            f"Tags: {', '.join(article_meta.get('tags', []))}\n"
            f"Source: {article_meta.get('source', '')}\n"
        )

    return f"""You are ET Vernacular Business News Engine.
Task: Translate and culturally adapt English business news for {lang['name']} readers in {lang['locale']}.
Target script: {lang['script']}.
Audience hint: {audience_hint}.

Constraints:
1) Do not invent new facts, events, names, or numbers.
2) Preserve all numeric values, percentages, and key entities from source.
3) This is not literal translation: rewrite naturally for local readers.
4) Add practical local-context explanation using familiar financial realities.
5) Keep it concise, clear, newsroom grade.
6) If source lacks detail, state uncertainty rather than guessing.
7) Output only valid JSON.

Return JSON in this exact structure:
{{
  "language_code": "{language_code}",
  "language_name": "{lang['name']}",
  "headline_local": "localized headline",
  "translated_text": "full adapted translation",
  "simple_explainer": "2-3 line everyday explanation",
  "local_context": ["point 1", "point 2", "point 3"],
  "business_glossary": [
    {{"term_en": "repo rate", "term_local": "...", "meaning": "..."}},
    {{"term_en": "inflation", "term_local": "...", "meaning": "..."}}
  ],
  "adaptation_notes": ["note 1", "note 2"],
  "fact_integrity": "preserved"
}}

{article_meta_block}
Source text:
{source_text}
"""


def translate_news(source_text, language_code, audience_hint="business readers", article_meta=None):
    if not (source_text or "").strip():
        raise ValueError("source_text is required")

    if language_code not in LANGUAGE_MAP:
        raise ValueError("Unsupported language")

    prompt = _build_prompt(source_text, language_code, audience_hint=audience_hint, article_meta=article_meta)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=2200,
    )

    parsed = _extract_json(response.choices[0].message.content)

    translated_text = parsed.get("translated_text", "")
    if not _validate_facts(source_text, translated_text):
        strict_prompt = prompt + "\nRe-check facts and preserve every number exactly from source."
        retry = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": strict_prompt}],
            temperature=0.1,
            max_tokens=2200,
        )
        parsed = _extract_json(retry.choices[0].message.content)

    return {
        "language_code": parsed.get("language_code") or language_code,
        "language_name": parsed.get("language_name") or LANGUAGE_MAP[language_code]["name"],
        "headline_local": parsed.get("headline_local") or "",
        "translated_text": parsed.get("translated_text") or "",
        "simple_explainer": parsed.get("simple_explainer") or "",
        "local_context": parsed.get("local_context") or [],
        "business_glossary": parsed.get("business_glossary") or [],
        "adaptation_notes": parsed.get("adaptation_notes") or [],
        "fact_integrity": parsed.get("fact_integrity") or "checked",
    }


def translate_article(article_id, language_code, audience_hint="business readers"):
    article = _fetch_article(article_id)
    if not article:
        raise ValueError("article not found")

    source_text = f"{article['title']}. {article['summary']}"
    result = translate_news(
        source_text=source_text,
        language_code=language_code,
        audience_hint=audience_hint,
        article_meta=article,
    )

    return {
        "article": article,
        "translation": result,
    }


def get_recent_articles(limit=12):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT id, title, category, summary, source, published_at FROM articles ORDER BY id DESC LIMIT ?",
            (int(limit),),
        ).fetchall()
    finally:
        conn.close()

    return [
        {
            "id": int(r["id"]),
            "title": r["title"] or "",
            "category": r["category"] or "General",
            "summary": r["summary"] or "",
            "source": r["source"] or "ET Bureau",
            "published_at": r["published_at"] or "",
        }
        for r in rows
    ]
