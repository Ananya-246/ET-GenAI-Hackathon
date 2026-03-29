# ET GenAI Hackathon - Main Feature Implementation Document

## 1. Executive Summary

ET GenAI is a full-stack AI newsroom platform that transforms business news consumption from static reading into an interactive, personalized, multilingual, and media-rich intelligence experience.

The solution implements five core product pillars:

1. My ET - Personalized Newsroom
2. News Navigator - Interactive Intelligence Briefings
3. Story Arc Tracker - Narrative Intelligence Engine
4. Vernacular Business News Engine
5. AI News Video Studio

The platform is implemented with a React frontend, Flask backend, Groq LLM orchestration, and dual database support (SQLite for local, Supabase PostgreSQL for production).

## 2. Business Problem and Product Thesis

### 2.1 Problem in Traditional Business News

Traditional news products are one-size-fits-all and force users to:

- scan many articles to understand one topic
- manually interpret jargon-heavy market events
- consume in one language style
- switch tools for text, translation, and visual storytelling

### 2.2 Product Thesis

ET GenAI creates role-aware, context-aware, and format-aware news:

- role-aware: investor vs founder vs student gets different relevance
- context-aware: grounded AI synthesis from ET article corpus
- format-aware: text, Q&A, storyline maps, vernacular adaptation, and short-form video

## 3. System Architecture

### 3.1 Frontend Layer (React)

Primary pages:

- HomePage: AI suite entry + control center
- MyETPage: personalization feed + profile + modal detail
- NavigatorPage: briefing generation + grounded follow-up chat
- StoryArcPage: timeline, players, sentiment, predictions
- VernacularPage: translation and adaptation workflow
- VideoStudioPage: text-to-video workflow

Cross-cutting frontend modules:

- AuthContext: user session lifecycle, token persistence
- ProtectedRoute: route-level auth gating
- usePersona hook: MyET orchestration
- useAISettings hook: persistent cross-feature settings
- api service: centralized axios client + auth interceptor

### 3.2 Backend Layer (Flask)

API blueprints:

- /api/auth
- /api/my-et
- /api/navigator
- /api/story-arc
- /api/vernacular
- /api/video

Backend services:

- personalization.py
- navigator_service.py
- story_arc_service.py
- vernacular_service.py
- llm_service.py
- did_service.py
- tts_service.py

### 3.3 Data Layer

Dual-engine DB abstraction supports:

- local SQLite for development
- Supabase PostgreSQL for deployment

Core entities:

- users
- user_profile
- user_tag_weights
- user_article_history
- articles
- video_scripts

## 4. Feature-by-Feature Implementation and Business Logic Mapping

---

## 4.1 My ET - Personalized Newsroom

### 4.1.1 Business Goal

Deliver a fundamentally different feed per user persona and behavior. A mutual fund investor should surface portfolio-relevant updates, a startup founder should see funding and competitor shifts, and a student should see explainer-heavy content.

### 4.1.2 Endpoints and Flow

- GET /api/my-et/feed
- POST /api/my-et/visit
- POST /api/my-et/persona
- GET /api/my-et/profile
- GET /api/my-et/article/<id>

Flow:

1. User logs in and token identifies account.
2. User selects persona and tags are seeded.
3. On each article open, tags and history are updated.
4. Feed is re-ranked with updated affinity signals.

### 4.1.3 Ranking Logic

Personalization score combines multiple signals:

- tag affinity (strong preference multiplier)
- category affinity from read history
- freshness bonus (time decay)
- exploration bonus (avoid filter bubble)

Business translation:

- relevance for known interests
- discovery for adjacent opportunities
- recency for market-moving stories

### 4.1.4 Profile Intelligence

The engine computes:

- top tags by weight
- top categories by read frequency
- profile maturity level: Starter, Growing, Advanced

This helps users see explainable personalization and trust recommendation quality.

### 4.1.5 Robustness Choices

- ON CONFLICT upserts for idempotent profile updates
- cast-based user_id compatibility for legacy text/integer migrations
- defensive parsing of tags and fallback-safe scoring

---

## 4.2 News Navigator - Interactive Intelligence Briefings

### 4.2.1 Business Goal

Replace fragmented reading of many articles with one synthesized, explorable briefing users can interrogate through follow-up questions.

### 4.2.2 Endpoints and Flow

- POST /api/navigator/briefing
- POST /api/navigator/ask

Flow:

1. Topic input triggers retrieval of relevant ET articles.
2. Service builds contextual evidence bundle.
3. LLM generates structured briefing JSON.
4. Session stores source context and TTL.
5. Follow-up Q&A is answered only from that context.

### 4.2.3 Grounding Logic

The implementation enforces grounding by:

- selecting source-bound article context
- requiring JSON response schema
- validating citations against source IDs
- returning refusal when unsupported

Business value:

- speed: one briefing instead of many tabs
- trust: explicit source-backed responses
- depth: iterative question flow for decision readiness

### 4.2.4 Productization Choices

- preset topic chips for quick interaction
- adjustable source depth via AI settings
- suggested follow-up questions for guided exploration

---

## 4.3 Story Arc Tracker - Narrative Intelligence Engine

### 4.3.1 Business Goal

Transform isolated event updates into a full narrative model of an ongoing business story.

### 4.3.2 Endpoints and Flow

- GET /api/story-arc/candidates
- POST /api/story-arc/generate

Flow:

1. Candidate topics generated from recent ET corpus.
2. User picks topic and max source breadth.
3. Service retrieves and scores relevant coverage.
4. LLM synthesizes multi-block arc JSON.
5. UI renders timeline, players, sentiment, contrarian views, predictions.

### 4.3.3 Structured Narrative Blocks

Output includes:

- timeline phases and source references
- key players and influence scores
- player relationships
- sentiment shifts with confidence
- contrarian scenarios
- watch-next probabilistic signals

Business value:

- decision intelligence over headline tracking
- forward-looking view, not just retrospective news
- clearer strategic situational awareness

### 4.3.4 Reliability Controls

- bounded confidence/probability normalization
- source ID cleaning against valid article set
- fallback handling for incomplete model outputs

---

## 4.4 Vernacular Business News Engine

### 4.4.1 Business Goal

Enable real-time, context-aware business news consumption in major Indian languages with cultural adaptation instead of literal translation.

### 4.4.2 Endpoints and Flow

- GET /api/vernacular/articles
- POST /api/vernacular/translate
- POST /api/vernacular/translate-article

Supported languages:

- Hindi
- Tamil
- Telugu
- Bengali

Flow:

1. User selects language and audience lens.
2. Source text or article is submitted.
3. LLM generates localized headline, adapted body, explainer, glossary, local context notes.
4. Fact integrity checker verifies numeric consistency.
5. If mismatch is detected, strict low-temperature retry runs.

### 4.4.3 Business Logic and Trust Layer

- numbers and entities must remain intact
- adaptation notes explain localization choices
- business glossary reduces jargon barrier
- audience lens customizes communication style

Business value:

- expands market reach beyond English-only users
- improves comprehension for retail and first-time users
- preserves financial accuracy while improving accessibility

---

## 4.5 AI News Video Studio

### 4.5.1 Business Goal

Automatically transform ET articles into broadcast-quality short videos (60-120 seconds) to match modern consumption behavior and increase engagement.

### 4.5.2 Endpoints and Flow

- POST /api/video/generate

Flow:

1. User submits article text plus style and voice.
2. LLM generates structured script JSON with scene directions.
3. Stats block extracts key metrics for visual overlays.
4. Anchor video pipeline synthesizes voice and renders video.
5. Output URL and metadata are returned to the client.

### 4.5.3 Content-to-Video Mapping

Generated package includes:

- narration-ready script
- duration estimate
- metric cards (label, value, trend)
- final video URL

Business value:

- faster content repurposing for social and mobile
- editorial scaling without full manual production
- richer engagement through visual storytelling

### 4.5.4 Engineering Choices

- strict JSON parse and validation from LLM
- failure-safe handling for malformed model outputs
- script persistence for audit and iteration

---

## 5. Authentication, Session Management, and Account Data Binding

### 5.1 Implemented Auth Model

- registration and login endpoints
- password hashing with bcrypt
- JWT-based stateless sessions
- protected route enforcement in frontend/backend

### 5.2 Why It Matters for Business Logic

All personalization and behavior tracking are account-scoped, enabling:

- persistent user learning across sessions
- cross-device identity continuity
- measurable recommendation performance per user

## 6. Cross-Feature Settings Layer

A persistent AI Settings hook enables product-level tuning:

- My ET feed depth
- Navigator source depth
- Story Arc source breadth
- Vernacular article window
- default vernacular audience lens

Business impact:

- personalized experience control
- better demo flexibility for judges/stakeholders
- clearer product maturity signal

## 7. Approach Taken (Implementation Strategy)

### 7.1 Development Approach

1. Deliver end-to-end vertical slices for each feature.
2. Stabilize schema and data contracts.
3. Add auth/session and Supabase compatibility.
4. Improve trust with grounding and fact checks.
5. Add UX controls and settings for product completeness.

### 7.2 Key Technical Approaches

- structured JSON prompting for all LLM-heavy workflows
- explicit guardrails for grounding and fact integrity
- deterministic post-processing and schema cleaning
- progressive enhancement from static MVP to account-based system

### 7.3 Tradeoffs Accepted

- in-memory briefing session store (fast for demo, replaceable by Redis later)
- cast-based compatibility patch for mixed user_id column types
- single-model orchestration for speed of hackathon delivery

## 8. Evidence of Working System

Implemented indicators:

- API blueprints registered for all features in Flask app
- frontend pages connected through authenticated route structure
- persisted user interactions reflected in personalized ranking
- generated outputs for briefings, story arcs, translations, and videos
- Supabase production path supported through DB abstraction layer

Operational checks available:

- /health endpoint
- authenticated feed retrieval and tracking
- feature-specific API calls from React service layer

## 9. Future-Ready Enhancements

1. Move briefing sessions from memory to Redis for horizontal scaling.
2. Add row-level security policies in Supabase for stricter tenancy.
3. Introduce analytics dashboard for feature-level KPI tracking.
4. Add multilingual voice clones for vernacular video narration.
5. Add A/B experimentation for feed ranking formulas.

## 10. Conclusion

ET GenAI is implemented as a coherent product system, not isolated demos.

Each feature is mapped to a clear business outcome:

- My ET: personalized relevance and retention
- Navigator: synthesis speed and grounded clarity
- Story Arc: strategic narrative intelligence
- Vernacular: accessibility and market expansion
- Video Studio: distribution and engagement scale

The project demonstrates both technical depth and product thinking suitable for a hackathon-winning submission.
