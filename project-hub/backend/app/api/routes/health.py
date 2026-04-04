from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.redis_client import ping_redis


router = APIRouter(tags=["health"])


@router.get("/health/live")
def liveness() -> dict:
    return {"status": "ok", "service": "api"}


@router.get("/health/ready")
def readiness(db: Session = Depends(get_db)) -> dict:
    db.execute(text("SELECT 1"))
    return {
        "status": "ok",
        "database": "ok",
        "redis": "ok" if ping_redis() else "unavailable",
    }
