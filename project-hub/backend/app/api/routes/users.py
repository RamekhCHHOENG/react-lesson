from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import User


router = APIRouter(tags=["users"])


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.full_name,
        "isActive": user.is_active,
        "createdAt": user.created_at.isoformat(),
    }


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    users = db.scalars(
        select(User)
        .where(User.is_active.is_(True))
        .order_by(User.full_name.asc())
    ).all()
    return {"data": [serialize_user(u) for u in users], "success": True}
