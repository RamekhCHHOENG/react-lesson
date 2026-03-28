import redis

from app.core.config import settings

try:
    redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception:
    redis_client = None


def ping_redis() -> bool:
    if redis_client is None:
        return False
    try:
        return bool(redis_client.ping())
    except (redis.RedisError, Exception):
        return False
