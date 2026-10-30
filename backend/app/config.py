import os
from pydantic import BaseModel

def get_allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "")
    if raw.strip():
        return [o.strip() for o in raw.split(",") if o.strip()]
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

class Settings(BaseModel):
    APP_NAME: str = "NyayaAI Forensic Identification System"
    APP_VERSION: str = "1.0.0"
    SECRET_KEY: str = os.getenv("NYAYA_SECRET_KEY", "nyaya-forensic-ai-super-secret-key-2026-safe")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for investigator sessions
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./forensic_nyaya.db")
    ALLOWED_ORIGINS: list[str] = get_allowed_origins()

settings = Settings()

