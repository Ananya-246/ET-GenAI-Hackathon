# ET GenAI Hackathon — AI-Powered News Intelligence Platform

A full-stack AI application that transforms how users engage with Economic Times business news through grounded AI briefings, culturally-adapted translations, personalized feeds, and intelligent narrative tracking.

## 🎯 Project Overview

ET GenAI is a hackathon project built on cutting-edge LLM technology and modern web frameworks to deliver five core AI-powered features:

1. **News Navigator** — Real-time grounded Q&A on ET articles with source verification
2. **Vernacular Engine** — Culturally-adapted translations for 4 Indian languages (Hindi, Tamil, Telugu, Bengali)
3. **MyET Personalization** — Adaptive feed ranking with multi-signal scoring and article detail modals
4. **Story Arc Tracker** — Interactive narrative visualization of ongoing business stories with timeline, players, sentiment, and predictions
5. **AI News Video Studio** — Automatically transforms ET articles or breaking news into broadcast-quality 60–120 second videos with AI narration, animated data visuals, and contextual overlays

---

## 🚀 Key Features

### 1. News Navigator
- **Grounded Briefings**: Synthesize ET articles into concise AI-generated briefings with strict source verification
- **Source-Bounded Q&A**: Ask follow-up questions with responses guaranteed to cite original sources
- **Fact Integrity**: Validates all claims against article database before responding
- **Tech Stack**: Flask backend, Groq LLM (llama-3.3-70b), React frontend with API integration

### 2. Vernacular Engine  
- **Multi-Language Support**: Hindi, Tamil, Telugu, Bengali
- **Cultural Adaptation**: Rewrites news with local context, not literal translation
- **Glossary & Explainers**: Breaks down business jargon for local audiences
- **Numeric Preservation**: Ensures facts/figures remain accurate across translations
- **Tech Stack**: Groq LLM with fact-checking, SQLite/Postgres backend, React UI with listen (TTS) buttons

### 3. MyET Personalization
- **Multi-Signal Ranking**: Combines tag affinity, category preference, content freshness, and exploration bonuses
- **Profile Progression**: Tracks user reading history → Starter → Growing → Advanced levels
- **Article Detail Modals**: Click any feed item to open full article with metadata
- **Recommendation Reasons**: Each article shows why it was ranked (e.g., "Matches your Top Tag: Technology")
- **Tech Stack**: Python scoring engine, React hooks (usePersona), modal component system

### 4. Story Arc Tracker
- **Narrative Synthesis**: Builds complete story arcs from related articles with timeline, key players, and sentiment
- **Interactive Timeline**: Click timeline steps to inspect coverage evolution
- **Player Influence Map**: Visualize key decision-makers with relationship arrows and influence scoring
- **Contrarian Views**: Surface opposing perspectives in ongoing stories
- **Watch-Next Predictions**: AI predicts upcoming story developments
- **Tech Stack**: Groq LLM narrative generation, React timeline/player visualization components

### 5. AI News Video Studio
- **Auto Video Generation**: Convert any ET article into a short 60-120 second news video automatically
- **AI Narration**: Generates voice-over script and synthesized narration for anchor-like delivery
- **Animated Data Visuals**: Adds motion graphics and visual storytelling for key business metrics
- **Contextual Overlays**: Injects key facts, highlights, and labels to improve watchability and comprehension
- **Tech Stack**: Flask video routes, script generation, TTS pipeline, media rendering services

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│            React Frontend (Client)                      │
│  Navigator | Vernacular | MyET | Story Arc | Video Pages│
└────────────────┬────────────────────────────────────────┘
                 │ Axios API Layer
                 │
┌────────────────▼────────────────────────────────────────┐
│  Flask Backend API (Python)                             │
│  ┌──────────────┬──────────────┬─────────────────────┐  │
│  │ Navigator    │ Vernacular   │ MyET │ Story Arc    │  │
│  │ Service      │ Service      │ Service  Service    │  │
│  │              │              │                     │  │
│  └──────────────┴──────────────┴─────────────────────┘  │
│                    ▼                                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Groq LLM (llama-3.3-70b) for AI Tasks          │    │
│  │  - Briefing synthesis                           │    │
│  │  - Cultural adaptation & translation            │    │
│  │  - Narrative arc generation                     │    │
│  │  - Video script + narration generation          │    │
│  └─────────────────────────────────────────────────┘    │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┴────────────-┐
    ▼                          ▼
┌─────────────┐        ┌─────────────────────┐
│  SQLite DB  │        │  Supabase Postgres  │
│  (Local)    │        │  (Production)       │
└─────────────┘        └─────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Axios, CSS3 |
| **Backend** | Flask (Python), Blueprints |
| **LLM** | Groq API (llama-3.3-70b-versatile) |
| **Database** | SQLite (local) + Supabase PostgreSQL (production) |
| **Environment** | Python 3.8+, Node.js 14+, pip/npm |

---

## 📁 Project Structure

```
ET-GenAI-Hackathon/
├── client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ArticleCard.jsx
│   │   │   ├── FeedCard.js
│   │   │   ├── Navbar.jsx
│   │   │   └── ScriptPreview.js
│   │   ├── pages/                   # Feature pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── NavigatorPage.jsx    # News Navigator
│   │   │   ├── VernacularPage.jsx   # Translation Engine
│   │   │   ├── MyETPage.jsx         # Personalization
│   │   │   └── StoryArcPage.jsx     # Narrative Tracker
│   │   ├── hooks/
│   │   │   └── usePersona.js        # MyET state management
│   │   ├── services/
│   │   │   └── api.js               # Backend API client
│   │   └── App.js                   # Main router
│   └── package.json
│
├── server/                          # Flask Backend
│   ├── app.py                       # Flask app + blueprints
│   ├── config.py                    # Configuration
│   ├── requirements.txt              # Python dependencies
│   ├── database/
│   │   ├── models.py                # DB connection & schema (dual SQLite/Postgres)
│   │   └── db.sqlite3               # Local SQLite database
│   ├── routes/                      # API endpoints
│   │   ├── my_et.py                 # Personalization endpoints
│   │   ├── video.py                 # Video studio endpoints
│   │   ├── navigator.py             # Navigator endpoints
│   │   ├── vernacular.py            # Translation endpoints
│   │   └── story_arc.py             # Story arc endpoints
│   ├── services/                    # Business logic
│   │   ├── navigator_service.py     # Grounded briefing logic
│   │   ├── vernacular_service.py    # Translation logic
│   │   ├── story_arc_service.py     # Narrative synthesis
│   │   ├── personalization.py       # Ranking & scoring
│   │   ├── llm_service.py           # Groq LLM client
│   │   ├── tts_service.py           # Text-to-speech
│   │   ├── embeddings.py            # Semantic search (optional)
│   │   └── did_service.py           # Avatar video synthesis
│   └── static/                      # Generated media
│       ├── audio/
│       └── videos/
│
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- Groq API key (free tier available at [console.groq.com](https://console.groq.com))
- (Optional) Supabase account for production database

### Installation

#### 1. Clone & Setup Backend
```bash
cd server
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

#### 2. Configure Environment Variables
Create `.env` file in `server/` directory:
```env
# Groq API
GROQ_API_KEY=your-groq-api-key-here

# Database (choose one)
# For local SQLite:
DATABASE_PATH=sqlite:///database/db.sqlite3

# For Supabase PostgreSQL:
DATABASE_PATH=postgresql://user:password@project.supabase.co:5432/postgres?sslmode=require

# Flask
FLASK_ENV=development
```

#### 3. Setup Frontend
```bash
cd client
npm install
```

### Running the Application

#### Terminal 1 - Backend Server
```bash
cd server
python -m venv venv
# Activate venv (see above)
python app.py
# Server runs on http://localhost:5000
```

#### Terminal 2 - Frontend Development
```bash
cd client
npm start
# App opens at http://localhost:3000
```

---

## 📡 API Endpoints Overview

### Navigator (Grounded Q&A)
```
POST /api/navigator/briefing
  Body: { text: string, source_ids?: number[] }
  Returns: { briefing, sources, citations }

POST /api/navigator/ask
  Body: { briefing_context, question, source_ids }
  Returns: { answer, grounded: boolean, citations }
```

### Vernacular (Translation)
```
GET /api/vernacular/articles?limit=10&language=hi
  Returns: List of articles with translated content

POST /api/vernacular/translate-text
  Body: { text, target_language, audience_level }
  Returns: { headline, simple_explanation, local_context, glossary }

POST /api/vernacular/translate-article
  Body: { article_id, target_language }
  Returns: Full translated article with metadata
```

### MyET (Personalization)
```
GET /api/my-et/feed?persona=technology
  Returns: Ranked articles with profile summary and recommendation reasons

POST /api/my-et/track-visit
  Body: { article_id, time_spent }
  Returns: Updated user profile

GET /api/my-et/article/<id>
  Returns: Full article detail with all metadata

POST /api/my-et/set-persona
  Body: { persona, tags: [] }
  Returns: Updated persona configuration
```

### Story Arc (Narrative)
```
GET /api/story-arc/candidates
  Returns: List of trending story topics (with article hints)

POST /api/story-arc/generate
  Body: { topic, num_articles }
  Returns: { timeline, players, sentiment_shifts, contrarian_views, watch_next }
```

---

## 🔑 Core Services

### LLM Service (`server/services/llm_service.py`)
- Handles all Groq API calls with structured JSON output
- Temperature control: 0.2 (consistency) to 0.7 (creativity)
- Error handling with fallback parsing

### Personalization Engine (`server/services/personalization.py`)
- Multi-signal ranking formula:
  - `tag_score × 1.35 + category_score × 0.9 + freshness_bonus + exploration_bonus`
- User profile progression (Starter → Growing → Advanced)
- Visit tracking and weight decay

### Database Layer (`server/database/models.py`)
- **Dual-engine support**: Automatically detects SQLite vs PostgreSQL
- SQL placeholder auto-conversion: `?` → `%s`
- Schema initialization with dialect-specific statements
- Connection pooling for production

---

## 🗄️ Database Schema

### Core Tables
- **articles**: ET business news articles (source_id, headline, content, published_date)
- **users**: User profiles (persona, total_reads, created_at)
- **user_tags**: User tag preferences with weights (tag_name, weight)
- **user_visits**: Article reading history (user_id, article_id, time_spent)
- **translations**: Cached translations (article_id, language, translated_content)

---

## 📊 Key Algorithms

### Ranking Algorithm (MyET)
```
relevance_score = 
  (tag_affinity × 1.35) +           # Heavy weight on user tags
  (category_score × 0.9) +          # Category preference
  (1.0 / days_old) +                # Freshness bonus (inverse of age)
  (exploration_bonus)               # Encourage new categories
  
capped to [0.0, 0.99]
```

### Fact Integrity Checking (Navigator & Vernacular)
1. Extract entities/numbers from LLM response
2. Verify against source articles in database
3. If mismatch detected, retry LLM at lower temperature (0.1)
4. Reject unverifiable claims before returning

### Story Arc Synthesis (Story Arc Tracker)
1. Search for articles related to topic keyword
2. Cluster by timeline and entities
3. Rank by influence score (citations + engagement)
4. Generate narrative arc with Groq (temp 0.2 for consistency)
5. Extract timeline events, key players, sentiment, predictions

---

## 🧪 Testing & Validation

### Manual Testing
```bash
# Test Navigator
curl -X POST http://localhost:5000/api/navigator/briefing \
  -H "Content-Type: application/json" \
  -d '{"text": "Apple launches new product..."}'

# Test Vernacular translation
curl -X POST http://localhost:5000/api/vernacular/translate-text \
  -H "Content-Type: application/json" \
  -d '{"text": "Stock market hit record high", "target_language": "hi"}'

# Test MyET feed
curl http://localhost:5000/api/my-et/feed?persona=technology

# Test Story Arc
curl -X POST http://localhost:5000/api/story-arc/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI regulations", "num_articles": 10}'
```

---

## 🩹 Troubleshooting

### Issue: `ModuleNotFoundError: No module named 'psycopg2'`
**Solution**: Install PostgreSQL driver for Supabase support
```bash
pip install psycopg2-binary
```

### Issue: Database connection fails
**Solution**: Check `.env` file for correct `DATABASE_PATH`:
- SQLite: `sqlite:///database/db.sqlite3` (relative path from server/)
- Postgres: `postgresql://user:password@host:5432/db?sslmode=require`

### Issue: GROQ API rate limit exceeded
**Solution**: Add delay between requests or upgrade Groq plan
```python
import time
time.sleep(1)  # Wait 1 second between API calls
```

### Issue: Frontend can't connect to backend
**Solution**: Ensure Flask is running and test CORS:
```bash
# Check if Flask is accessible
curl http://localhost:5000/
# Should return: "Welcome to MyET Backend"
```

---

## 📈 Performance & Scalability

### Optimization Tips
- **Caching**: Translations and story arcs are cached to reduce LLM calls
- **Pagination**: Feed returns 10 articles by default; use `limit` param to adjust
- **Batch Processing**: MyET aggregates reads into hourly weight decay cycles
- **Lazy Loading**: Frontend loads article details only on modal open

### Production Deployment
1. Switch `DATABASE_PATH` to Supabase PostgreSQL
2. Set `FLASK_ENV=production` and disable debug mode
3. Use production-grade WSGI server (Gunicorn, uWSGI)
4. Deploy frontend build (`npm run build`) to CDN
5. Configure environment variables on hosting platform

---

## 🤝 Contributing

### Code Structure
- **Routes** (`server/routes/`) — HTTP API endpoints
- **Services** (`server/services/`) — Business logic & LLM integration
- **Database** (`server/database/`) — Schema & connection management
- **Components** (`client/src/components/`) — Reusable React components
- **Pages** (`client/src/pages/`) — Feature page components

### Adding a New Feature
1. Create service logic in `server/services/`
2. Register routes in `server/routes/`
3. Add API client methods to `client/src/services/api.js`
4. Create React page component in `client/src/pages/`
5. Add navigation link in `client/src/components/Navbar.jsx`

---

## 📝 License

This project was built for the ET GenAI Hackathon. All rights reserved.

---

## 📧 Support

For issues or questions, refer to:
- **Frontend Issues**: Check `client/README.md`
- **Backend Issues**: Check Python stack trace in terminal
- **Database Issues**: Verify `DATABASE_PATH` in `.env`
- **API Issues**: Test endpoints with curl before debugging frontend

---

**Last Updated**: March 2026 | **Status**: Production Ready