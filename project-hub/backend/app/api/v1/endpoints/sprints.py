from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.sprint import Sprint
from app.models.user import User
from app.schemas.sprint import SprintCreate, SprintResponse, SprintTaskSummary, SprintUpdate
from app.services.activity_logger import log_activity

router = APIRouter()


def _serialize(s: Sprint) -> dict:
    return SprintResponse(
        id=s.id, project_id=s.project_id, name=s.name, goal=s.goal,
        status=s.status, start_date=s.start_date, end_date=s.end_date,
        tasks=[SprintTaskSummary(
            id=t.id, issue_key=t.issue_key, title=t.title,
            status=t.status, priority=t.priority,
            assignee=t.assignee, story_points=t.story_points,
        ) for t in (s.tasks or [])],
        created_at=s.created_at.isoformat() if s.created_at else "",
        updated_at=s.updated_at.isoformat() if s.updated_at else "",
    ).model_dump()


@router.get("/{project_id}/sprints", response_model=list[SprintResponse])
async def list_sprints(project_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(
        select(Sprint).options(selectinload(Sprint.tasks))
        .where(Sprint.project_id == project_id).order_by(Sprint.created_at.desc())
    )
    return [_serialize(s) for s in result.scalars().all()]


@router.post("/{project_id}/sprints", response_model=SprintResponse, status_code=201)
async def create_sprint(
    project_id: str, data: SprintCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    sprint = Sprint(project_id=project_id, name=data.name, goal=data.goal, start_date=data.start_date, end_date=data.end_date)
    db.add(sprint)
    await db.flush()
    await db.refresh(sprint)
    await log_activity(db, current_user, "created", "sprint", sprint.id, sprint.name, project_id=project_id)
    return _serialize(sprint)


@router.put("/{project_id}/sprints/{sprint_id}", response_model=SprintResponse)
async def update_sprint(
    project_id: str, sprint_id: str, data: SprintUpdate,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Sprint).options(selectinload(Sprint.tasks))
        .where(Sprint.id == sprint_id, Sprint.project_id == project_id)
    )
    sprint = result.scalar_one_or_none()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sprint, field, value)
    await db.flush()
    await db.refresh(sprint)
    return _serialize(sprint)


@router.delete("/{project_id}/sprints/{sprint_id}", status_code=204)
async def delete_sprint(project_id: str, sprint_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Sprint).where(Sprint.id == sprint_id, Sprint.project_id == project_id))
    sprint = result.scalar_one_or_none()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    await db.delete(sprint)


@router.post("/{project_id}/sprints/{sprint_id}/start", response_model=SprintResponse)
async def start_sprint(project_id: str, sprint_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Sprint).options(selectinload(Sprint.tasks))
        .where(Sprint.id == sprint_id, Sprint.project_id == project_id)
    )
    sprint = result.scalar_one_or_none()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    sprint.status = "active"
    if not sprint.start_date:
        sprint.start_date = date.today().isoformat()
    await db.flush()
    await db.refresh(sprint)
    await log_activity(db, current_user, "status_changed", "sprint", sprint.id, sprint.name,
                       project_id=project_id,
                       details={"field": "status", "old_value": "planning", "new_value": "active"})
    return _serialize(sprint)


@router.post("/{project_id}/sprints/{sprint_id}/complete", response_model=SprintResponse)
async def complete_sprint(project_id: str, sprint_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Sprint).options(selectinload(Sprint.tasks))
        .where(Sprint.id == sprint_id, Sprint.project_id == project_id)
    )
    sprint = result.scalar_one_or_none()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    sprint.status = "completed"
    if not sprint.end_date:
        sprint.end_date = date.today().isoformat()
    await db.flush()
    await db.refresh(sprint)
    await log_activity(db, current_user, "status_changed", "sprint", sprint.id, sprint.name,
                       project_id=project_id,
                       details={"field": "status", "old_value": "active", "new_value": "completed"})
    return _serialize(sprint)
