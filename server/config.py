import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DID_API_KEY = os.getenv("DID_API_KEY", "")
DATABASE_PATH = os.getenv("DATABASE_PATH", "database/db.sqlite3")
CLAUDE_MODEL = "claude-sonnet-4-20250514"