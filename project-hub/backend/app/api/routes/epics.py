from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Epic, Task, User
from app.schemas.epic import EpicCreate, EpicUpdate, LinkTaskRequest

router = APIRouter(tags=["epics"])


def _serialize(db: Session, e: Epic) -> dict:
    tasks = db.scalars(select(Task).where(Task.epic_id == e.id)).all()
    task_ids = [t.id for t in tasks]
    tasks_done = sum(1 for t in tasks if t.status == "done")
    return {
        "id": e.id,
        "project_id": e.project_id,
        "name": e.name,
        "description": e.description,
        "color": e.color,
        "status": e.status,
        "start_date": e.start_date,
        "target_date": e.target_date,
        "task_ids": task_ids,
        "tasks_total": len(tasks),
        "tasks_done": tasks_done,
        "created_at": e.created_at.isoformat() if e.created_at else "",
        "updated_at": e.updated_at.isoformat() if e.updated_at else "",
    }


@router.get("/epics")
def list_all_epics(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    epics = db.scalars(select(Epic).order_by(Epic.created_at.desc())).all()
    return {"data": [_serialize(db, e) for e in epics], "success": True}


@router.get("/projects/{project_id}/epics")
def list_epics(
    project_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    epics = db.scalars(
        select(Epic).where(Epic.project_id == project_id).order_by(Epic.created_at.desc())
    ).all()
    return {"data": [_serialize(db, e) for e in epics], "success": True}


@router.get("/projects/{project_id}/epics/{epic_id}")
def get_epic(
    project_id: str,
    epic_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    epic = db.scalar(select(Epic).where(Epic.id == epic_id, Epic.project_id == project_id))
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    return {"data": _serialize(db, epic), "success": True}


@router.post("/projects/{project_id}/epics", status_code=status.HTTP_201_CREATED)
def create_epic(
    project_id: str,
    data: EpicCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    epic = Epic(
        project_id=project_id,
        name=data.name,
        description=data.description,
        color=data.color,
        status=data.status,
        start_date=data.start_date,
        target_date=data.target_date,
    )
    db.add(epic)
    db.commit()
    db.refresh(epic)
    return {"data": _serialize(db, epic), "success": True}


@router.put("/projects/{project_id}/epics/{epic_id}")
def update_epic(
    project_id: str,
    epic_id: str,
    data: EpicUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    epic = db.scalar(select(Epic).where(Epic.id == epic_id, Epic.project_id == project_id))
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(epic, field, value)
    db.commit()
    db.refresh(epic)
    return {"data": _serialize(db, epic), "success": True}


@router.delete("/projects/{project_id}/epics/{epic_id}", status_code=status.HTTP_200_OK)
def delete_epic(
    project_id: str,
    epic_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    epic = db.scalar(select(Epic).where(Epic.id == epic_id, Epic.project_id == project_id))
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    # Unlink tasks first
    linked = db.scalars(select(Task).where(Task.epic_id == epic_id)).all()
    for t in linked:
        t.epic_id = None
    db.delete(epic)
    db.commit()
    return {"success": True, "message": "Epic deleted"}


@router.post("/projects/{project_id}/epics/{epic_id}/tasks", status_code=status.HTTP_200_OK)
def link_task_to_epic(
    project_id: str,
    epic_id: str,
    data: LinkTaskRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    task = db.get(Task, data.task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.epic_id = epic_id
    db.commit()
    return {"success": True, "detail": "Task linked"}


@router.delete("/projects/{project_id}/epics/{epic_id}/tasks/{task_id}", status_code=status.HTTP_200_OK)
def unlink_task_from_epic(
    project_id: str,
    epic_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.epic_id = None
    db.commit()
    return {"success": True, "detail": "Task unlinked"}
