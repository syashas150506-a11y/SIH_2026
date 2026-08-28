import os
from dotenv import load_dotenv

load_dotenv()

raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./medikiosk.db")
# SQLAlchemy requires postgresql:// instead of postgres://
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

DATABASE_URL = raw_db_url

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# If no Gemini API key is set, MOCK_MODE will be enabled as a fallback.
MOCK_MODE = not bool(GEMINI_API_KEY.strip())

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

