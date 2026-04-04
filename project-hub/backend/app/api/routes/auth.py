from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models import User
from app.schemas.auth import LoginRequest, UserRegister


router = APIRouter(prefix="/auth", tags=["auth"])


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "is_active": user.is_active,
        "is_superuser": getattr(user, 'is_superuser', False),
        "avatar_url": getattr(user, 'avatar_url', None),
        "created_at": str(user.created_at) if user.created_at else None,
        "updated_at": str(user.created_at) if user.created_at else None,
    }


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    user = db.scalar(select(User).where(User.email == payload.email, User.is_active.is_(True)))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user.id)
    return {
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": serialize_user(user),
        },
        "success": True,
        "message": "Login successful",
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)) -> dict:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": serialize_user(user),
        },
        "success": True,
        "message": "Registration successful",
    }


@router.get("/me")
def me(current_user: User = Depends(get_current_user)) -> dict:
    return {
        "data": serialize_user(current_user),
        "success": True,
    }
