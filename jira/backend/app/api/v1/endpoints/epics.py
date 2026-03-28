from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.epic import Epic
from app.models.task import Task
from app.models.user import User
from app.schemas.epic import EpicCreate, EpicResponse, EpicUpdate, LinkTaskRequest

router = APIRouter()


async def _serialize(db: AsyncSession, e: Epic) -> dict:
    # Get linked tasks via epic_id FK
    result = await db.execute(select(Task).where(Task.epic_id == e.id))
    tasks = result.scalars().all()
    task_ids = [t.id for t in tasks]
    tasks_done = sum(1 for t in tasks if t.status == "done")
    return EpicResponse(
        id=e.id, project_id=e.project_id, name=e.name, description=e.description,
        color=e.color, status=e.status, start_date=e.start_date, target_date=e.target_date,
        task_ids=task_ids, tasks_total=len(tasks), tasks_done=tasks_done,
        created_at=e.created_at.isoformat() if e.created_at else "",
        updated_at=e.updated_at.isoformat() if e.updated_at else "",
    ).model_dump()


@router.get("/epics", response_model=list[EpicResponse])
async def list_all_epics(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Epic).order_by(Epic.created_at.desc()))
    return [await _serialize(db, e) for e in result.scalars().all()]


@router.get("/{project_id}/epics", response_model=list[EpicResponse])
async def list_epics(project_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Epic).where(Epic.project_id == project_id).order_by(Epic.created_at.desc()))
    return [await _serialize(db, e) for e in result.scalars().all()]


@router.get("/{project_id}/epics/{epic_id}", response_model=EpicResponse)
async def get_epic(project_id: str, epic_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Epic).where(Epic.id == epic_id, Epic.project_id == project_id))
    epic = result.scalar_one_or_none()
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    return await _serialize(db, epic)


@router.post("/{project_id}/epics", response_model=EpicResponse, status_code=201)
async def create_epic(
    project_id: str, data: EpicCreate,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    epic = Epic(
        project_id=project_id, name=data.name, description=data.description,
        color=data.color, status=data.status, start_date=data.start_date, target_date=data.target_date,
    )
    db.add(epic)
    await db.flush()
    await db.refresh(epic)
    return await _serialize(db, epic)


@router.put("/{project_id}/epics/{epic_id}", response_model=EpicResponse)
async def update_epic(
    project_id: str, epic_id: str, data: EpicUpdate,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    result = await db.execute(select(Epic).where(Epic.id == epic_id, Epic.project_id == project_id))
    epic = result.scalar_one_or_none()
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(epic, field, value)
    await db.flush()
    await db.refresh(epic)
    return await _serialize(db, epic)


@router.delete("/{project_id}/epics/{epic_id}", status_code=204)
async def delete_epic(project_id: str, epic_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Epic).where(Epic.id == epic_id, Epic.project_id == project_id))
    epic = result.scalar_one_or_none()
    if not epic:
        raise HTTPException(status_code=404, detail="Epic not found")
    # Unlink tasks first
    linked = await db.execute(select(Task).where(Task.epic_id == epic_id))
    for t in linked.scalars().all():
        t.epic_id = None
    await db.delete(epic)


@router.post("/{project_id}/epics/{epic_id}/tasks", status_code=200)
async def link_task_to_epic(
    project_id: str, epic_id: str, data: LinkTaskRequest,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    task = await db.get(Task, data.task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.epic_id = epic_id
    await db.flush()
    return {"detail": "Task linked"}


@router.delete("/{project_id}/epics/{epic_id}/tasks/{task_id}", status_code=204)
async def unlink_task_from_epic(
    project_id: str, epic_id: str, task_id: str,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.epic_id = None
    await db.flush()
