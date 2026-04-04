from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Activity, Project, Task, User


router = APIRouter(tags=["activities"])


def serialize_activity(activity: Activity) -> dict:
    user_data = None
    if activity.user is not None:
        user_data = {
            "id": activity.user.id,
            "email": activity.user.email,
            "name": activity.user.full_name,
        }
    return {
        "id": activity.id,
        "projectId": activity.project_id,
        "taskId": activity.task_id,
        "user": user_data,
        "action": activity.action,
        "entityType": activity.entity_type,
        "entityId": activity.entity_id,
        "fieldName": activity.field_name,
        "oldValue": activity.old_value,
        "newValue": activity.new_value,
        "description": activity.description,
        "createdAt": activity.created_at.isoformat(),
    }


@router.get("/activities")
def list_activities(
    project_id: str | None = Query(default=None),
    task_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    stmt = select(Activity).order_by(Activity.created_at.desc()).limit(50)
    if project_id:
        stmt = stmt.where(Activity.project_id == project_id)
    if task_id:
        stmt = stmt.where(Activity.task_id == task_id)

    activities = db.scalars(stmt).all()

    # Ensure user is loaded for each activity
    result = []
    for act in activities:
        if act.user_id and act.user is None:
            act.user = db.get(User, act.user_id)
        result.append(serialize_activity(act))

    return {"data": result, "success": True}


@router.get("/projects/{project_id}/activities")
def list_project_activities(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    project = db.scalar(select(Project).where(Project.id == project_id))
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    activities = db.scalars(
        select(Activity)
        .where(Activity.project_id == project_id)
        .order_by(Activity.created_at.desc())
        .limit(50)
    ).all()

    result = []
    for act in activities:
        if act.user_id and act.user is None:
            act.user = db.get(User, act.user_id)
        result.append(serialize_activity(act))

    return {"data": result, "success": True}


@router.get("/tasks/{task_id}/activities")
def list_task_activities(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    task = db.scalar(select(Task).where(Task.id == task_id))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    activities = db.scalars(
        select(Activity)
        .where(Activity.task_id == task_id)
        .order_by(Activity.created_at.desc())
        .limit(50)
    ).all()

    result = []
    for act in activities:
        if act.user_id and act.user is None:
            act.user = db.get(User, act.user_id)
        result.append(serialize_activity(act))

    return {"data": result, "success": True}
