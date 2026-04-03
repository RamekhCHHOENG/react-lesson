"""Task history / changelog endpoint — shows audit trail of task changes."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.activity import ActivityLog
from app.models.user import User

router = APIRouter()


@router.get("/tasks/{task_id}/history")
async def task_history(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Full changelog for a single task — every field change, comment, status transition."""
    result = await db.execute(
        select(ActivityLog)
        .where(ActivityLog.entity_id == task_id, ActivityLog.entity_type == "task")
        .order_by(ActivityLog.created_at.desc())
    )
    entries = result.scalars().all()

    return [
        {
            "id": e.id,
            "action": e.action,
            "field_name": e.field_name,
            "old_value": e.old_value,
            "new_value": e.new_value,
            "description": e.description,
            "user_id": e.user_id,
            "user_name": e.user_name or (e.user.full_name if e.user else None),
            "user_avatar": e.user_avatar or (e.user.avatar_url if e.user else None),
            "details": e.details,
            "created_at": e.created_at.isoformat() if e.created_at else "",
        }
        for e in entries
    ]
