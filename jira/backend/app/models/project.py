import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255))
    key: Mapped[str] = mapped_column(String(10), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="planning")
    priority: Mapped[str] = mapped_column(String(50), default="medium")
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    start_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    end_date: Mapped[str | None] = mapped_column(String(10), nullable=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    task_seq: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    tasks = relationship("Task", back_populates="project", lazy="selectin", cascade="all, delete-orphan")
    sprints = relationship("Sprint", back_populates="project", lazy="selectin", cascade="all, delete-orphan")
    epics = relationship("Epic", back_populates="project", lazy="selectin", cascade="all, delete-orphan")
    members = relationship("ProjectMember", back_populates="project", lazy="selectin", cascade="all, delete-orphan")
