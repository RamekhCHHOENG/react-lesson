from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate, TaskInProject
from app.services.activity_logger import log_activity

router = APIRouter()


def _project_key(name: str) -> str:
    words = name.strip().split()
    if len(words) >= 2:
        return "".join(w[0] for w in words[:3]).upper()
    return name[:3].upper().replace(" ", "")


def _serialize_task(t: Task) -> dict:
    return TaskInProject(
        id=t.id, project_id=t.project_id, issue_key=t.issue_key,
        title=t.title, description=t.description, issue_type=t.issue_type,
        status=t.status, priority=t.priority, assignee=t.assignee,
        reporter=t.reporter, due_date=t.due_date, sprint_id=t.sprint_id,
        epic_id=t.epic_id, parent_id=t.parent_id, story_points=t.story_points,
        labels=[lb.name for lb in t.labels],
        created_at=t.created_at.isoformat() if t.created_at else "",
        updated_at=t.updated_at.isoformat() if t.updated_at else "",
    ).model_dump()


def _serialize_project(p: Project) -> dict:
    return ProjectResponse(
        id=p.id, name=p.name, key=p.key, description=p.description,
        status=p.status, priority=p.priority, owner_id=p.owner_id,
        start_date=p.start_date, end_date=p.end_date, tags=p.tags or [],
        tasks=[_serialize_task(t) for t in (p.tasks or [])],
        created_at=p.created_at.isoformat() if p.created_at else "",
        updated_at=p.updated_at.isoformat() if p.updated_at else "",
    ).model_dump()


@router.get("", response_model=list[ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks).selectinload(Task.labels)).order_by(Project.created_at.desc())
    )
    return [_serialize_project(p) for p in result.scalars().all()]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks).selectinload(Task.labels)).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _serialize_project(project)


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    key = _project_key(data.name)
    # ensure unique key
    base_key = key
    counter = 1
    while True:
        existing = await db.execute(select(Project).where(Project.key == key))
        if not existing.scalar_one_or_none():
            break
        key = f"{base_key}{counter}"
        counter += 1

    project = Project(
        name=data.name, key=key, description=data.description,
        status=data.status, priority=data.priority, owner_id=current_user.id,
        start_date=data.start_date, end_date=data.end_date, tags=data.tags or [],
    )
    db.add(project)
    await db.flush()
    await db.refresh(project, attribute_names=["tasks"])
    await log_activity(db, current_user, "created", "project", project.id, project.name)
    return _serialize_project(project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str, data: ProjectUpdate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Project).options(selectinload(Project.tasks).selectinload(Task.labels)).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    await db.flush()
    await db.refresh(project)
    await log_activity(db, current_user, "updated", "project", project.id, project.name)
    return _serialize_project(project)


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    name = project.name
    await db.delete(project)
    await log_activity(db, current_user, "deleted", "project", project_id, name)
