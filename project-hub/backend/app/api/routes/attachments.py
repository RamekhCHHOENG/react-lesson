import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Attachment, Task, User

router = APIRouter(tags=["attachments"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {
    "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml",
    "application/pdf",
    "text/plain", "text/csv", "text/markdown",
    "application/json",
    "application/zip", "application/gzip",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}


def serialize_attachment(att: Attachment) -> dict:
    return {
        "id": att.id,
        "taskId": att.task_id,
        "filename": att.filename,
        "originalName": att.original_name,
        "contentType": att.content_type,
        "size": att.size,
        "createdAt": att.created_at.isoformat(),
        "user": {
            "id": att.user.id,
            "email": att.user.email,
            "name": att.user.full_name,
        } if att.user else None,
    }


@router.get("/tasks/{task_id}/attachments")
def list_attachments(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    task = db.scalar(select(Task).where(Task.id == task_id))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    attachments = db.scalars(
        select(Attachment)
        .where(Attachment.task_id == task_id)
        .order_by(Attachment.created_at.desc())
    ).all()

    for att in attachments:
        if att.user is None and att.user_id:
            att.user = db.get(User, att.user_id)

    return {"data": [serialize_attachment(a) for a in attachments], "success": True}


@router.post("/tasks/{task_id}/attachments", status_code=status.HTTP_201_CREATED)
def upload_attachment(
    task_id: str,
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    task = db.scalar(select(Task).where(Task.id == task_id))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if file.content_type and file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{file.content_type}' is not allowed",
        )

    contents = file.file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10 MB limit",
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(file.filename or "file")[1]
    stored_name = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, stored_name)

    with open(filepath, "wb") as f:
        f.write(contents)

    attachment = Attachment(
        task_id=task_id,
        user_id=current_user.id,
        filename=stored_name,
        original_name=file.filename or "unnamed",
        content_type=file.content_type or "application/octet-stream",
        size=len(contents),
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    attachment.user = current_user

    return {"data": serialize_attachment(attachment), "success": True}


@router.delete("/tasks/{task_id}/attachments/{attachment_id}", status_code=status.HTTP_200_OK)
def delete_attachment(
    task_id: str,
    attachment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    attachment = db.scalar(
        select(Attachment).where(
            Attachment.id == attachment_id,
            Attachment.task_id == task_id,
        )
    )
    if attachment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")

    filepath = os.path.join(UPLOAD_DIR, attachment.filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    db.delete(attachment)
    db.commit()

    return {"success": True, "message": "Attachment deleted"}
