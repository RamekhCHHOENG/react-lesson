from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func as sa_func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Notification, User


router = APIRouter(prefix="/notifications", tags=["notifications"])


def serialize_notification(notification: Notification) -> dict:
    return {
        "id": notification.id,
        "userId": notification.user_id,
        "type": notification.type,
        "title": notification.title,
        "message": notification.message,
        "isRead": notification.is_read,
        "entityType": notification.entity_type,
        "entityId": notification.entity_id,
        "projectId": notification.project_id,
        "taskId": notification.task_id,
        "createdAt": notification.created_at.isoformat(),
    }


@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    notifications = db.scalars(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    ).all()
    return {"data": [serialize_notification(n) for n in notifications], "success": True}


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    count = db.scalar(
        select(sa_func.count(Notification.id)).where(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
    ) or 0

    return {"data": {"count": count}, "success": True}


@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    notifications = db.scalars(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
    ).all()

    for notification in notifications:
        notification.is_read = True
        db.add(notification)

    db.commit()

    return {
        "data": None,
        "success": True,
        "message": "All notifications marked as read",
    }


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    notification = db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.is_read = True
    db.add(notification)
    db.commit()
    db.refresh(notification)

    return {
        "data": serialize_notification(notification),
        "success": True,
        "message": "Notification marked as read",
    }
