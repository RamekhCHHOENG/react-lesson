import json
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings

_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    app_name: str = "Project Hub API"
    api_v1_prefix: str = "/api"
    DATABASE_URL: str = "sqlite+aiosqlite:///./jira.db"
    SECRET_KEY: str = "change-me-to-a-real-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    FIRST_SUPERUSER_EMAIL: str = "admin@projecthub.com"
    FIRST_SUPERUSER_NAME: str = "Admin"
    FIRST_SUPERUSER_PASSWORD: str = "admin123"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> list[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                pass
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

    model_config = {"env_file": str(_ENV_FILE), "extra": "ignore"}


settings = Settings()
