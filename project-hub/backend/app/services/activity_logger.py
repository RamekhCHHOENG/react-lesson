from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity import ActivityLog
from app.models.user import User


async def log_activity(
    db: AsyncSession,
    user: User,
    action: str,
    entity_type: str,
    entity_id: str,
    entity_title: str,
    project_id: str | None = None,
    project_name: str | None = None,
    details: dict | None = None,
):
    entry = ActivityLog(
        user_id=user.id,
        user_name=user.full_name,
        user_avatar=user.avatar_url,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_title=entity_title,
        project_id=project_id,
        project_name=project_name,
        details=details,
    )
    db.add(entry)
    await db.flush()
