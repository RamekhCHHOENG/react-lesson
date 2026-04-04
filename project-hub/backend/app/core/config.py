import json
from functools import cached_property
from pathlib import Path

from pydantic_settings import BaseSettings

_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    app_name: str = "Project Hub API"
    api_v1_prefix: str = "/api"
    DATABASE_URL: str = "sqlite+aiosqlite:///./jira.db"
    SECRET_KEY: str = "change-me-to-a-real-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'
    FIRST_SUPERUSER_EMAIL: str = "admin@projecthub.com"
    FIRST_SUPERUSER_NAME: str = "Admin"
    FIRST_SUPERUSER_PASSWORD: str = "admin123"

    @cached_property
    def cors_origins_list(self) -> list[str]:
        try:
            parsed = json.loads(self.CORS_ORIGINS)
            if isinstance(parsed, list):
                return parsed
        except (json.JSONDecodeError, TypeError):
            pass
        return [s.strip() for s in self.CORS_ORIGINS.split(",") if s.strip()]

    model_config = {"env_file": str(_ENV_FILE), "extra": "ignore"}


settings = Settings()
