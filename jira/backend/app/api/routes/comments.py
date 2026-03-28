from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Activity, Comment, Notification, Task, User
from app.schemas.comment import CommentCreate, CommentUpdate


router = APIRouter(tags=["comments"])


def serialize_comment(comment: Comment) -> dict:
    return {
        "id": comment.id,
        "taskId": comment.task_id,
        "user": {
            "id": comment.user.id,
            "email": comment.user.email,
            "name": comment.user.full_name,
        },
        "content": comment.content,
        "createdAt": comment.created_at.isoformat(),
        "updatedAt": comment.updated_at.isoformat(),
    }


@router.get("/tasks/{task_id}/comments")
def list_comments(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    task = db.scalar(select(Task).where(Task.id == task_id))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    comments = db.scalars(
        select(Comment)
        .where(Comment.task_id == task_id)
        .order_by(Comment.created_at.asc())
    ).all()

    # Eagerly load user for each comment
    result = []
    for comment in comments:
        if comment.user is None:
            comment.user = db.get(User, comment.user_id)
        result.append(serialize_comment(comment))

    return {"data": result, "success": True}


@router.post("/tasks/{task_id}/comments", status_code=status.HTTP_201_CREATED)
def create_comment(
    task_id: str,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    task = db.scalar(select(Task).where(Task.id == task_id))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    comment = Comment(
        task_id=task_id,
        user_id=current_user.id,
        content=payload.content,
    )
    db.add(comment)
    db.flush()

    # Create activity log entry
    activity = Activity(
        project_id=task.project_id,
        task_id=task_id,
        user_id=current_user.id,
        action="commented",
        entity_type="comment",
        entity_id=comment.id,
        description=f"Commented on task '{task.title}'",
    )
    db.add(activity)

    # Notify task assignee if different from commenter
    if task.assignee and task.assignee != current_user.full_name:
        # Try to find assignee user by name
        assignee_user = db.scalar(
            select(User).where(User.full_name == task.assignee, User.is_active.is_(True))
        )
        if assignee_user is not None:
            notification = Notification(
                user_id=assignee_user.id,
                type="comment_added",
                title="New comment on your task",
                message=f"{current_user.full_name} commented on '{task.title}'",
                entity_type="comment",
                entity_id=comment.id,
                project_id=task.project_id,
                task_id=task_id,
            )
            db.add(notification)

    db.commit()
    db.refresh(comment)

    # Ensure user is loaded for serialization
    if comment.user is None:
        comment.user = db.get(User, comment.user_id)

    return {
        "data": serialize_comment(comment),
        "success": True,
        "message": "Comment created successfully",
    }


@router.put("/comments/{comment_id}")
def update_comment(
    comment_id: str,
    payload: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    comment = db.scalar(select(Comment).where(Comment.id == comment_id))
    if comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to edit this comment")

    comment.content = payload.content
    db.add(comment)
    db.commit()
    db.refresh(comment)

    if comment.user is None:
        comment.user = db.get(User, comment.user_id)

    return {
        "data": serialize_comment(comment),
        "success": True,
        "message": "Comment updated successfully",
    }


@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    comment = db.scalar(select(Comment).where(Comment.id == comment_id))
    if comment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to delete this comment")

    db.delete(comment)
    db.commit()

    return {
        "data": None,
        "success": True,
        "message": "Comment deleted successfully",
    }
