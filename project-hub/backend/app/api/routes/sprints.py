import datetime as _dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Activity, Project, Sprint, Task, User
from app.schemas.sprint import SprintCreate, SprintUpdate


router = APIRouter(tags=["sprints"])


def get_project_or_404(db: Session, project_id: str) -> Project:
    project = db.scalar(select(Project).where(Project.id == project_id))
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def serialize_sprint(sprint: Sprint, include_tasks: bool = False) -> dict:
    data = {
        "id": sprint.id,
        "project_id": sprint.project_id,
        "name": sprint.name,
        "goal": sprint.goal,
        "start_date": sprint.start_date.isoformat() if sprint.start_date else None,
        "end_date": sprint.end_date.isoformat() if sprint.end_date else None,
        "status": sprint.status,
        "created_at": sprint.created_at.isoformat(),
        "updated_at": sprint.updated_at.isoformat(),
    }
    if include_tasks:
        data["tasks"] = [
            {
                "id": task.id,
                "issue_key": task.issue_key or "",
                "title": task.title,
                "status": task.status,
                "priority": task.priority or "medium",
                "assignee": task.assignee,
                "story_points": task.story_points,
            }
            for task in sprint.tasks
        ]
    return data


@router.get("/projects/{project_id}/sprints")
def list_sprints(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    get_project_or_404(db, project_id)
    sprints = db.scalars(
        select(Sprint)
        .where(Sprint.project_id == project_id)
        .order_by(Sprint.created_at.desc())
    ).all()
    return {"data": [serialize_sprint(s, include_tasks=True) for s in sprints], "success": True}


@router.post("/projects/{project_id}/sprints", status_code=status.HTTP_201_CREATED)
def create_sprint(
    project_id: str,
    payload: SprintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    get_project_or_404(db, project_id)
    sprint = Sprint(
        project_id=project_id,
        name=payload.name,
        goal=payload.goal,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status,
    )
    db.add(sprint)
    db.flush()

    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        action="created",
        entity_type="sprint",
        entity_id=sprint.id,
        description=f"Created sprint '{sprint.name}'",
    )
    db.add(activity)
    db.commit()
    db.refresh(sprint)

    return {
        "data": serialize_sprint(sprint),
        "success": True,
        "message": "Sprint created successfully",
    }


@router.get("/projects/{project_id}/sprints/{sprint_id}")
def get_sprint(
    project_id: str,
    sprint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    get_project_or_404(db, project_id)
    sprint = db.scalar(
        select(Sprint)
        .where(Sprint.id == sprint_id, Sprint.project_id == project_id)
        .options(selectinload(Sprint.tasks))
    )
    if sprint is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sprint not found")
    return {"data": serialize_sprint(sprint, include_tasks=True), "success": True}


@router.put("/projects/{project_id}/sprints/{sprint_id}")
def update_sprint(
    project_id: str,
    sprint_id: str,
    payload: SprintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    get_project_or_404(db, project_id)
    sprint = db.scalar(
        select(Sprint).where(Sprint.id == sprint_id, Sprint.project_id == project_id)
    )
    if sprint is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sprint not found")

    updates = payload.model_dump(exclude_unset=True)
    if "name" in updates:
        sprint.name = updates["name"]
    if "goal" in updates:
        sprint.goal = updates["goal"]
    if "start_date" in updates:
        sprint.start_date = updates["start_date"]
    if "end_date" in updates:
        sprint.end_date = updates["end_date"]
    if "status" in updates:
        sprint.status = updates["status"]

    db.add(sprint)

    activity = Activity(
        project_id=project_id,
        task_id=None,
        user_id=current_user.id,
        action="updated",
        entity_type="sprint",
        entity_id=sprint.id,
        description=f"Updated sprint '{sprint.name}'",
    )
    db.add(activity)
    db.commit()
    db.refresh(sprint)

    return {
        "data": serialize_sprint(sprint),
        "success": True,
        "message": "Sprint updated successfully",
    }


@router.delete("/projects/{project_id}/sprints/{sprint_id}")
def delete_sprint(
    project_id: str,
    sprint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    get_project_or_404(db, project_id)
    sprint = db.scalar(
        select(Sprint).where(Sprint.id == sprint_id, Sprint.project_id == project_id)
    )
    if sprint is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sprint not found")

    # Unassign tasks from this sprint
    tasks = db.scalars(
        select(Task).where(Task.sprint_id == sprint_id)
    ).all()
    for task in tasks:
        task.sprint_id = None
        db.add(task)

    sprint_name = sprint.name
    db.delete(sprint)

    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        action="deleted",
        entity_type="sprint",
        entity_id=sprint_id,
        description=f"Deleted sprint '{sprint_name}'",
    )
    db.add(activity)
    db.commit()

    return {
        "data": None,
        "success": True,
        "message": "Sprint deleted successfully",
    }


@router.post("/projects/{project_id}/sprints/{sprint_id}/start")
def start_sprint(
    project_id: str,
    sprint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    get_project_or_404(db, project_id)
    sprint = db.scalar(
        select(Sprint).where(Sprint.id == sprint_id, Sprint.project_id == project_id)
    )
    if sprint is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sprint not found")
    if sprint.status == "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sprint is already active")
    if sprint.status == "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sprint is already completed")

    old_status = sprint.status
    sprint.status = "active"
    if sprint.start_date is None:
        sprint.start_date = _dt.date.today()
    db.add(sprint)

    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        action="started",
        entity_type="sprint",
        entity_id=sprint.id,
        field_name="status",
        old_value=old_status,
        new_value="active",
        description=f"Started sprint '{sprint.name}'",
    )
    db.add(activity)
    db.commit()
    db.refresh(sprint)

    return {
        "data": serialize_sprint(sprint),
        "success": True,
        "message": "Sprint started successfully",
    }


@router.post("/projects/{project_id}/sprints/{sprint_id}/complete")
def complete_sprint(
    project_id: str,
    sprint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    get_project_or_404(db, project_id)
    sprint = db.scalar(
        select(Sprint).where(Sprint.id == sprint_id, Sprint.project_id == project_id)
    )
    if sprint is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sprint not found")
    if sprint.status == "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sprint is already completed")

    old_status = sprint.status
    sprint.status = "completed"
    if sprint.end_date is None:
        sprint.end_date = _dt.date.today()
    db.add(sprint)

    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        action="completed",
        entity_type="sprint",
        entity_id=sprint.id,
        field_name="status",
        old_value=old_status,
        new_value="completed",
        description=f"Completed sprint '{sprint.name}'",
    )
    db.add(activity)
    db.commit()
    db.refresh(sprint)

    return {
        "data": serialize_sprint(sprint),
        "success": True,
        "message": "Sprint completed successfully",
    }
