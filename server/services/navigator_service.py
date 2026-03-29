import json
import re
import uuid
from datetime import datetime, timedelta

from database.models import get_db
from services.llm_service import client, MODEL
SESSION_TTL_MINUTES = 120
_briefing_sessions = {}


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


def _relative_time(ts):
    if not ts:
        return "Recently"

    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S"):
        try:
            dt = datetime.strptime(str(ts), fmt)
            diff = (datetime.now() - dt).total_seconds()
            if diff < 3600:
                return f"{max(int(diff / 60), 1)}m ago"
            if diff < 86400:
                return f"{int(diff / 3600)}h ago"
            return f"{int(diff / 86400)}d ago"
        except ValueError:
            continue
    return "Recently"


def _tokenize(text):
    return [t for t in re.split(r"[^a-z0-9]+", (text or "").lower()) if len(t) > 2]


def _article_to_record(row):
    raw_tags = row["tags"] if "tags" in row.keys() else "[]"
    try:
        tags = json.loads(raw_tags) if raw_tags else []
    except (json.JSONDecodeError, TypeError):
        tags = []

    tags = [t for t in tags if isinstance(t, str) and t.strip()]

    return {
        "id": int(row["id"]),
        "title": row["title"] or "",
        "category": row["category"] or "General",
        "summary": row["summary"] or "",
        "source": row["source"] or "ET Bureau",
        "tags": tags,
        "published_at": row["published_at"] or "",
        "time": _relative_time(row["published_at"]),
    }


def _score_article(topic_tokens, article):
    haystack = " ".join([
        article.get("title", ""),
        article.get("summary", ""),
        article.get("category", ""),
        " ".join(article.get("tags", [])),
    ]).lower()

    score = 0
    for tok in topic_tokens:
        if tok in haystack:
            score += 3
        if tok in (article.get("title", "").lower()):
            score += 2
        if tok in " ".join(article.get("tags", [])).lower():
            score += 2
    return score


def _select_articles_for_topic(topic, limit=8):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT id, title, category, summary, source, tags, published_at FROM articles"
        ).fetchall()
    finally:
        conn.close()

    articles = [_article_to_record(row) for row in rows]
    if not articles:
        return []

    topic_tokens = _tokenize(topic)
    if not topic_tokens:
        articles.sort(key=lambda a: a["id"], reverse=True)
        return articles[:limit]

    scored = []
    for article in articles:
        score = _score_article(topic_tokens, article)
        if score > 0:
            scored.append((score, article))

    if not scored:
        articles.sort(key=lambda a: a["id"], reverse=True)
        return articles[:limit]

    scored.sort(key=lambda x: (x[0], x[1]["id"]), reverse=True)
    return [a for _, a in scored[:limit]]


def _build_context(articles):
    chunks = []
    for a in articles:
        chunks.append(
            f"Article {a['id']}\n"
            f"Title: {a['title']}\n"
            f"Category: {a['category']}\n"
            f"Source: {a['source']}\n"
            f"Summary: {a['summary']}\n"
            f"Tags: {', '.join(a.get('tags', []))}\n"
        )
    return "\n".join(chunks)


def create_briefing(topic, user_id="guest", max_sources=8):
    if not (topic or "").strip():
        raise ValueError("topic is required")

    articles = _select_articles_for_topic(topic.strip(), limit=max_sources)
    if not articles:
        raise ValueError("No articles found for this topic")

    context = _build_context(articles)
    prompt = f"""You are ET Intelligence creating a deep briefing.
Use ONLY the provided ET article context below.
Do not add external facts.
If evidence is weak or missing, state that uncertainty in the summary.
Return ONLY valid JSON.

JSON format:
{{
  "title": "...",
  "summary": "4-6 sentence synthesis only from context",
  "key_points": ["...", "...", "...", "...", "..."],
  "key_players": ["...", "...", "..."],
  "watch_next": ["...", "...", "..."],
  "suggested_questions": ["...", "...", "...", "..."]
}}

Topic: {topic}
User: {user_id}

Article context:
{context}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=1800,
    )

    parsed = _extract_json(response.choices[0].message.content)
    briefing_id = str(uuid.uuid4())
    _briefing_sessions[briefing_id] = {
        "created_at": datetime.now(),
        "topic": topic,
        "articles": articles,
        "context": context,
    }

    return {
        "briefing_id": briefing_id,
        "topic": topic,
        "title": parsed.get("title") or topic,
        "summary": parsed.get("summary") or "",
        "key_points": parsed.get("key_points") or [],
        "key_players": parsed.get("key_players") or [],
        "watch_next": parsed.get("watch_next") or [],
        "suggested_questions": parsed.get("suggested_questions") or [],
        "sources_count": len(articles),
        "sources": [
            {
                "id": a["id"],
                "title": a["title"],
                "category": a["category"],
                "summary": a["summary"],
                "source": a["source"],
                "time": a["time"],
            }
            for a in articles
        ],
    }


def _get_session(briefing_id):
    session = _briefing_sessions.get(briefing_id)
    if not session:
        return None

    if datetime.now() - session["created_at"] > timedelta(minutes=SESSION_TTL_MINUTES):
        _briefing_sessions.pop(briefing_id, None)
        return None

    return session


def _out_of_bounds_response(session, question):
    return {
        "question": question,
        "grounded": False,
        "answer": "I can only answer from the selected ET briefing sources. I could not find enough support for that question in these articles.",
        "citations": [],
        "available_source_ids": [a["id"] for a in session["articles"]],
    }


def answer_briefing_question(briefing_id, question):
    if not (question or "").strip():
        raise ValueError("question is required")

    session = _get_session(briefing_id)
    if not session:
        raise ValueError("briefing session not found or expired")

    valid_ids = {a["id"] for a in session["articles"]}

    prompt = f"""You are ET Intelligence Q&A for a generated briefing.
Answer ONLY using the article context below.
Do not use external world knowledge.
If the answer cannot be supported, set grounded=false and answer with one short refusal.
Always cite supporting article IDs.
Return ONLY valid JSON.

JSON format:
{{
  "grounded": true,
  "answer": "...",
  "citations": [12, 7]
}}

Article context:
{session['context']}

Question:
{question}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=1000,
    )

    parsed = _extract_json(response.choices[0].message.content)
    grounded = bool(parsed.get("grounded"))

    citations = parsed.get("citations") or []
    cleaned_citations = []
    for c in citations:
        try:
            cid = int(c)
        except (TypeError, ValueError):
            continue
        if cid in valid_ids and cid not in cleaned_citations:
            cleaned_citations.append(cid)

    answer = (parsed.get("answer") or "").strip()

    if (not grounded) or (not cleaned_citations) or (not answer):
        return _out_of_bounds_response(session, question)

    citation_sources = []
    by_id = {a["id"]: a for a in session["articles"]}
    for cid in cleaned_citations:
        a = by_id.get(cid)
        if not a:
            continue
        citation_sources.append({
            "id": a["id"],
            "title": a["title"],
            "source": a["source"],
            "category": a["category"],
        })

    return {
        "question": question,
        "grounded": True,
        "answer": answer,
        "citations": citation_sources,
        "available_source_ids": sorted(list(valid_ids)),
    }
