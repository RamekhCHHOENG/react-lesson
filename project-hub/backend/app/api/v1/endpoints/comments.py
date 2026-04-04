from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse, CommentUpdate
from app.services.activity_logger import log_activity
from app.services.notification_svc import create_notification
from app.models.task import Task

router = APIRouter()


def _serialize(c: Comment) -> dict:
    return CommentResponse(
        id=c.id, task_id=c.task_id, user_id=c.user_id,
        user_name=c.user.full_name if c.user else "",
        user_avatar=c.user.avatar_url if c.user else None,
        content=c.content, is_edited=c.is_edited,
        created_at=c.created_at.isoformat() if c.created_at else "",
        updated_at=c.updated_at.isoformat() if c.updated_at else "",
    ).model_dump()


@router.get("/tasks/{task_id}/comments", response_model=list[CommentResponse])
async def list_comments(task_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(
        select(Comment).options(selectinload(Comment.user))
        .where(Comment.task_id == task_id).order_by(Comment.created_at.asc())
    )
    return [_serialize(c) for c in result.scalars().all()]


@router.post("/tasks/{task_id}/comments", response_model=CommentResponse, status_code=201)
async def create_comment(
    task_id: str, data: CommentCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    comment = Comment(task_id=task_id, user_id=current_user.id, content=data.content)
    db.add(comment)
    await db.flush()
    await db.refresh(comment, attribute_names=["user"])

    # Log activity and notify task assignee
    task = await db.get(Task, task_id)
    if task:
        await log_activity(db, current_user, "commented", "task", task.id, task.issue_key,
                           project_id=task.project_id)
        if task.assignee:
            from sqlalchemy import select as sel
            assignee_result = await db.execute(sel(User).where(User.full_name == task.assignee))
            assignee_user = assignee_result.scalar_one_or_none()
            if assignee_user and assignee_user.id != current_user.id:
                await create_notification(db, assignee_user.id, "comment_added",
                                          f"{current_user.full_name} commented on {task.issue_key}",
                                          entity_type="task", entity_id=task.id)

    return _serialize(comment)


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: str, data: CommentUpdate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Comment).options(selectinload(Comment.user)).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Can only edit own comments")
    comment.content = data.content
    comment.is_edited = True
    await db.flush()
    await db.refresh(comment)
    return _serialize(comment)


@router.delete("/comments/{comment_id}", status_code=204)
async def delete_comment(comment_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Can only delete own comments")
    await db.delete(comment)
