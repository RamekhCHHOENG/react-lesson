from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse, UnreadCountResponse

router = APIRouter()


def _serialize(n: Notification) -> dict:
    return NotificationResponse(
        id=n.id, user_id=n.user_id, type=n.type, title=n.title,
        message=n.message, is_read=n.is_read, entity_type=n.entity_type,
        entity_id=n.entity_id,
        created_at=n.created_at.isoformat() if n.created_at else "",
    ).model_dump()


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Notification).where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc()).limit(100)
    )
    return [_serialize(n) for n in result.scalars().all()]


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_read(notification_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == current_user.id)
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    await db.flush()
    await db.refresh(notif)
    return _serialize(notif)


@router.put("/read-all", status_code=200)
async def mark_all_read(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.flush()
    return {"detail": "All notifications marked as read"}


@router.get("/unread-count", response_model=UnreadCountResponse)
async def unread_count(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(func.count()).select_from(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
    )
    count = result.scalar() or 0
    return UnreadCountResponse(count=count)
