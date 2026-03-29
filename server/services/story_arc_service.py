import json
import re

from database.models import get_db
from services.llm_service import client, MODEL


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


def _tokenize(text):
    return [t for t in re.split(r"[^a-z0-9]+", (text or "").lower()) if len(t) > 2]


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
        if tok in article.get("title", "").lower():
            score += 2
        if tok in " ".join(article.get("tags", [])).lower():
            score += 2
    return score


def _read_articles():
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT id, title, category, summary, source, tags, published_at FROM articles ORDER BY id DESC"
        ).fetchall()
    finally:
        conn.close()

    items = []
    for r in rows:
        tags = []
        try:
            tags = json.loads(r["tags"]) if r["tags"] else []
        except (json.JSONDecodeError, TypeError):
            tags = []

        items.append({
            "id": int(r["id"]),
            "title": r["title"] or "",
            "category": r["category"] or "General",
            "summary": r["summary"] or "",
            "source": r["source"] or "ET Bureau",
            "tags": [t for t in tags if isinstance(t, str) and t.strip()],
            "published_at": r["published_at"] or "",
        })

    return items


def _select_story_articles(topic, max_sources=10):
    articles = _read_articles()
    if not articles:
        return []

    topic_tokens = _tokenize(topic)
    if not topic_tokens:
        return articles[:max_sources]

    scored = []
    for a in articles:
        s = _score_article(topic_tokens, a)
        if s > 0:
            scored.append((s, a))

    if not scored:
        return articles[:max_sources]

    scored.sort(key=lambda x: (x[0], x[1]["id"]), reverse=True)
    return [a for _, a in scored[:max_sources]]


def _build_context(topic, articles):
    chunks = []
    for a in articles:
        chunks.append(
            f"Article {a['id']}\n"
            f"Title: {a['title']}\n"
            f"Category: {a['category']}\n"
            f"Source: {a['source']}\n"
            f"Summary: {a['summary']}\n"
            f"Tags: {', '.join(a.get('tags', []))}\n"
            f"Published At: {a['published_at']}\n"
        )

    return f"Topic: {topic}\n\n" + "\n".join(chunks)


def get_story_candidates(limit=12):
    articles = _read_articles()[: max(6, min(int(limit), 24))]
    candidates = []
    seen = set()
    for a in articles:
        label = a["title"]
        if label in seen:
            continue
        seen.add(label)
        candidates.append({
            "topic_hint": label,
            "article_id": a["id"],
            "category": a["category"],
        })
    return candidates


def generate_story_arc(topic, max_sources=10):
    if not (topic or "").strip():
        raise ValueError("topic is required")

    max_sources = max(6, min(int(max_sources), 16))
    articles = _select_story_articles(topic.strip(), max_sources=max_sources)
    if not articles:
        raise ValueError("No article context found")

    context = _build_context(topic, articles)

    prompt = f"""You are ET Story Arc Tracker.
Build a complete visual narrative from the provided ET article context only.
Do not add outside facts.
If evidence is incomplete, mark confidence lower and state uncertainty.
Return only valid JSON.

JSON format:
{{
  "story_title": "...",
  "narrative_overview": "5-8 sentence synthesis",
  "timeline": [
    {{
      "phase": "Trigger|Escalation|Policy Response|Market Reaction|Current State",
      "headline": "...",
      "description": "...",
      "date_hint": "...",
      "source_ids": [1, 2],
      "sentiment": "positive|neutral|negative"
    }}
  ],
  "key_players": [
    {{
      "name": "...",
      "role": "...",
      "stance": "...",
      "influence_score": 78,
      "source_ids": [1]
    }}
  ],
  "player_relationships": [
    {{"from": "...", "to": "...", "relation": "supports|opposes|depends_on|regulates"}}
  ],
  "sentiment_shifts": [
    {{
      "stage": "...",
      "sentiment": "positive|neutral|negative",
      "driver": "...",
      "confidence": 0.73
    }}
  ],
  "contrarian_views": [
    {{
      "viewpoint": "...",
      "who_benefits": "...",
      "risk_if_wrong": "...",
      "source_ids": [2, 5]
    }}
  ],
  "watch_next": [
    {{
      "signal": "...",
      "why_it_matters": "...",
      "probability": 0.62,
      "timeframe": "next 1-2 quarters"
    }}
  ]
}}

Context:
{context}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=2600,
    )

    parsed = _extract_json(response.choices[0].message.content)

    valid_ids = {a["id"] for a in articles}

    def clean_ids(values):
        cleaned = []
        for v in values or []:
            try:
                x = int(v)
            except (TypeError, ValueError):
                continue
            if x in valid_ids and x not in cleaned:
                cleaned.append(x)
        return cleaned

    timeline = []
    for t in parsed.get("timeline") or []:
        timeline.append({
            "phase": t.get("phase") or "Current State",
            "headline": t.get("headline") or "",
            "description": t.get("description") or "",
            "date_hint": t.get("date_hint") or "",
            "source_ids": clean_ids(t.get("source_ids")),
            "sentiment": t.get("sentiment") or "neutral",
        })

    key_players = []
    for p in parsed.get("key_players") or []:
        influence_score = p.get("influence_score", 50)
        try:
            influence_score = int(influence_score)
        except (TypeError, ValueError):
            influence_score = 50
        influence_score = max(1, min(influence_score, 100))

        key_players.append({
            "name": p.get("name") or "Unknown",
            "role": p.get("role") or "",
            "stance": p.get("stance") or "",
            "influence_score": influence_score,
            "source_ids": clean_ids(p.get("source_ids")),
        })

    sentiment_shifts = []
    for s in parsed.get("sentiment_shifts") or []:
        confidence = s.get("confidence", 0.5)
        try:
            confidence = float(confidence)
        except (TypeError, ValueError):
            confidence = 0.5
        confidence = max(0.0, min(confidence, 1.0))

        sentiment_shifts.append({
            "stage": s.get("stage") or "Current State",
            "sentiment": s.get("sentiment") or "neutral",
            "driver": s.get("driver") or "",
            "confidence": round(confidence, 2),
        })

    contrarian_views = []
    for c in parsed.get("contrarian_views") or []:
        contrarian_views.append({
            "viewpoint": c.get("viewpoint") or "",
            "who_benefits": c.get("who_benefits") or "",
            "risk_if_wrong": c.get("risk_if_wrong") or "",
            "source_ids": clean_ids(c.get("source_ids")),
        })

    watch_next = []
    for w in parsed.get("watch_next") or []:
        probability = w.get("probability", 0.5)
        try:
            probability = float(probability)
        except (TypeError, ValueError):
            probability = 0.5
        probability = max(0.0, min(probability, 1.0))

        watch_next.append({
            "signal": w.get("signal") or "",
            "why_it_matters": w.get("why_it_matters") or "",
            "probability": round(probability, 2),
            "timeframe": w.get("timeframe") or "next quarter",
        })

    return {
        "story_title": parsed.get("story_title") or topic,
        "narrative_overview": parsed.get("narrative_overview") or "",
        "timeline": timeline,
        "key_players": key_players,
        "player_relationships": parsed.get("player_relationships") or [],
        "sentiment_shifts": sentiment_shifts,
        "contrarian_views": contrarian_views,
        "watch_next": watch_next,
        "source_articles": [
            {
                "id": a["id"],
                "title": a["title"],
                "category": a["category"],
                "summary": a["summary"],
                "source": a["source"],
                "published_at": a["published_at"],
            }
            for a in articles
        ],
    }
