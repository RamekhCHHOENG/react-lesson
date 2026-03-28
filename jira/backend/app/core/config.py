from pathlib import Path

from pydantic_settings import BaseSettings

_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./jira.db"
    SECRET_KEY: str = "change-me-to-a-real-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    REDIS_URL: str = "redis://localhost:6379/0"

    app_name: str = "Jira Clone API"
    api_v1_prefix: str = "/api"

    FIRST_SUPERUSER_EMAIL: str = "admin@projecthub.com"
    FIRST_SUPERUSER_NAME: str = "Admin User"
    FIRST_SUPERUSER_PASSWORD: str = "admin123"

    model_config = {"env_file": str(_ENV_FILE), "extra": "ignore"}


settings = Settings()
