from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.activity import ActivityLog
from app.models.user import User
from app.schemas.activity import ActivityResponse

router = APIRouter()


def _serialize(a: ActivityLog) -> dict:
    return ActivityResponse(
        id=a.id, user_id=a.user_id, user_name=a.user_name,
        user_avatar=a.user_avatar, action=a.action,
        entity_type=a.entity_type, entity_id=a.entity_id,
        entity_title=a.entity_title, project_id=a.project_id,
        project_name=a.project_name, details=a.details,
        created_at=a.created_at.isoformat() if a.created_at else "",
    ).model_dump()


@router.get("", response_model=list[ActivityResponse])
async def list_activity(
    entity_type: str | None = Query(None),
    entity_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(100)
    if entity_type:
        query = query.where(ActivityLog.entity_type == entity_type)
    if entity_id:
        query = query.where(ActivityLog.entity_id == entity_id)
    result = await db.execute(query)
    return [_serialize(a) for a in result.scalars().all()]
