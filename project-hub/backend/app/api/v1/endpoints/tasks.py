from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.label import Label
from app.models.project import Project
from app.models.task import Task, task_labels
from app.models.task_link import TaskLink
from app.models.user import User
from app.schemas.task import (
    BulkDeleteRequest, BulkUpdateRequest, CreateLinkRequest, CreateSubtaskRequest,
    LinkedIssueResponse, TaskCreate, TaskResponse, TaskSummary, TaskUpdate,
)
from app.services.activity_logger import log_activity
from app.services.notification_svc import create_notification

router = APIRouter()


def _serialize_task(t: Task) -> dict:
    return TaskResponse(
        id=t.id, project_id=t.project_id, issue_key=t.issue_key,
        title=t.title, description=t.description, issue_type=t.issue_type,
        status=t.status, priority=t.priority, assignee=t.assignee,
        reporter=t.reporter, due_date=t.due_date, sprint_id=t.sprint_id,
        epic_id=t.epic_id, parent_id=t.parent_id, story_points=t.story_points,
        labels=[lb.name for lb in (t.labels or [])],
        created_at=t.created_at.isoformat() if t.created_at else "",
        updated_at=t.updated_at.isoformat() if t.updated_at else "",
    ).model_dump()


async def _next_issue_key(db: AsyncSession, project: Project) -> str:
    project.task_seq = (project.task_seq or 0) + 1
    await db.flush()
    return f"{project.key}-{project.task_seq}"


@router.get("/{project_id}/tasks", response_model=list[TaskResponse])
async def list_tasks(
    project_id: str,
    status: str | None = Query(None, description="Filter by status"),
    priority: str | None = Query(None, description="Filter by priority"),
    assignee: str | None = Query(None, description="Filter by assignee name"),
    issue_type: str | None = Query(None, description="Filter by issue type"),
    sprint_id: str | None = Query(None, description="Filter by sprint"),
    epic_id: str | None = Query(None, description="Filter by epic"),
    search: str | None = Query(None, description="Search title/key"),
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = (
        select(Task).options(selectinload(Task.labels))
        .where(Task.project_id == project_id)
    )
    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
    if assignee:
        query = query.where(Task.assignee == assignee)
    if issue_type:
        query = query.where(Task.issue_type == issue_type)
    if sprint_id:
        query = query.where(Task.sprint_id == sprint_id)
    if epic_id:
        query = query.where(Task.epic_id == epic_id)
    if search:
        pattern = f"%{search}%"
        query = query.where(Task.title.ilike(pattern) | Task.issue_key.ilike(pattern))

    query = query.order_by(Task.position, Task.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return [_serialize_task(t) for t in result.scalars().all()]


@router.post("/{project_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    project_id: str, data: TaskCreate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    issue_key = await _next_issue_key(db, project)
    task = Task(
        project_id=project_id, issue_key=issue_key,
        title=data.title, description=data.description,
        issue_type=data.issue_type, status=data.status, priority=data.priority,
        assignee=data.assignee, reporter=data.reporter or current_user.full_name,
        due_date=data.due_date, sprint_id=data.sprint_id, epic_id=data.epic_id,
        parent_id=data.parent_id, story_points=data.story_points,
    )
    db.add(task)
    await db.flush()

    # attach labels by name
    if data.labels:
        for label_name in data.labels:
            result = await db.execute(select(Label).where(Label.name == label_name))
            label = result.scalar_one_or_none()
            if label:
                task.labels.append(label)
        await db.flush()

    await db.refresh(task, attribute_names=["labels"])
    await log_activity(db, current_user, "created", "task", task.id, task.issue_key,
                       project_id=project_id, project_name=project.name)
    if data.assignee:
        assignee_result = await db.execute(select(User).where(User.full_name == data.assignee))
        assignee_user = assignee_result.scalar_one_or_none()
        if assignee_user and assignee_user.id != current_user.id:
            await create_notification(db, assignee_user.id, "task_assigned",
                                      f"{current_user.full_name} assigned {task.issue_key} to you",
                                      entity_type="task", entity_id=task.id)
    return _serialize_task(task)


@router.put("/{project_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    project_id: str, task_id: str, data: TaskUpdate,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).options(selectinload(Task.labels))
        .where(Task.id == task_id, Task.project_id == project_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = data.model_dump(exclude_unset=True)
    labels_data = update_data.pop("labels", None)

    # Track changes for activity logging
    changed_fields = {}
    for field, value in update_data.items():
        old = getattr(task, field, None)
        if old != value:
            changed_fields[field] = {"old_value": str(old) if old else None, "new_value": str(value) if value else None}
        setattr(task, field, value)

    if labels_data is not None:
        task.labels.clear()
        for label_name in labels_data:
            result = await db.execute(select(Label).where(Label.name == label_name))
            label = result.scalar_one_or_none()
            if label:
                task.labels.append(label)

    await db.flush()
    await db.refresh(task, attribute_names=["labels"])

    if changed_fields:
        details = {"changes": changed_fields}
        if "status" in changed_fields:
            details["field"] = "status"
            details["old_value"] = changed_fields["status"]["old_value"]
            details["new_value"] = changed_fields["status"]["new_value"]
        action = "status_changed" if "status" in changed_fields else "updated"
        project = await db.get(Project, project_id)
        await log_activity(db, current_user, action, "task", task.id, task.issue_key,
                           project_id=project_id, project_name=project.name if project else None,
                           details=details)
    return _serialize_task(task)


@router.delete("/{project_id}/tasks/{task_id}", status_code=204)
async def delete_task(
    project_id: str, task_id: str,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.project_id == project_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    issue_key = task.issue_key
    project = await db.get(Project, project_id)
    await db.delete(task)
    await log_activity(db, current_user, "deleted", "task", task_id, issue_key,
                       project_id=project_id, project_name=project.name if project else None)


# ── Subtasks ──────────────────────────────────────────────────────────────

@router.get("/{project_id}/tasks/{task_id}/subtasks", response_model=list[TaskSummary])
async def get_subtasks(
    project_id: str, task_id: str,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.parent_id == task_id, Task.project_id == project_id)
    )
    return [
        TaskSummary(id=t.id, issue_key=t.issue_key, title=t.title, status=t.status, priority=t.priority, assignee=t.assignee)
        for t in result.scalars().all()
    ]


@router.post("/{project_id}/tasks/{parent_id}/subtasks", response_model=TaskResponse, status_code=201)
async def create_subtask(
    project_id: str, parent_id: str, data: CreateSubtaskRequest,
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user),
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    issue_key = await _next_issue_key(db, project)
    task = Task(
        project_id=project_id, issue_key=issue_key,
        title=data.title, issue_type="subtask", parent_id=parent_id,
        assignee=data.assignee, reporter=current_user.full_name,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task, attribute_names=["labels"])
    return _serialize_task(task)


# ── Links ──────────────────────────────────────────────────────────────────

@router.get("/{project_id}/tasks/{task_id}/links", response_model=list[LinkedIssueResponse])
async def get_links(
    project_id: str, task_id: str,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(TaskLink).options(selectinload(TaskLink.target_task))
        .where(TaskLink.source_task_id == task_id)
    )
    links = result.scalars().all()
    out = []
    for link in links:
        t = link.target_task
        if t:
            out.append(LinkedIssueResponse(
                id=link.id, link_type=link.link_type,
                task=TaskSummary(id=t.id, issue_key=t.issue_key, title=t.title, status=t.status, priority=t.priority, assignee=t.assignee),
            ))
    return out


@router.post("/{project_id}/tasks/{task_id}/links", response_model=LinkedIssueResponse, status_code=201)
async def create_link(
    project_id: str, task_id: str, data: CreateLinkRequest,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    link = TaskLink(source_task_id=task_id, target_task_id=data.target_task_id, link_type=data.link_type)
    db.add(link)
    await db.flush()
    await db.refresh(link, attribute_names=["target_task"])
    t = link.target_task
    return LinkedIssueResponse(
        id=link.id, link_type=link.link_type,
        task=TaskSummary(id=t.id, issue_key=t.issue_key, title=t.title, status=t.status, priority=t.priority, assignee=t.assignee),
    )


@router.delete("/{project_id}/tasks/{task_id}/links/{link_id}", status_code=204)
async def delete_link(
    project_id: str, task_id: str, link_id: str,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    result = await db.execute(select(TaskLink).where(TaskLink.id == link_id))
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    await db.delete(link)


# ── Bulk Operations ──────────────────────────────────────────────────────

@router.post("/{project_id}/tasks/bulk-update", status_code=200)
async def bulk_update(
    project_id: str, data: BulkUpdateRequest,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.project_id == project_id, Task.id.in_(data.task_ids))
    )
    tasks = result.scalars().all()
    for task in tasks:
        if data.status is not None:
            task.status = data.status
        if data.priority is not None:
            task.priority = data.priority
        if data.assignee is not None:
            task.assignee = data.assignee
    await db.flush()
    return {"updated": len(tasks)}


@router.post("/{project_id}/tasks/bulk-delete", status_code=200)
async def bulk_delete(
    project_id: str, data: BulkDeleteRequest,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.project_id == project_id, Task.id.in_(data.task_ids))
    )
    tasks = result.scalars().all()
    for task in tasks:
        await db.delete(task)
    return {"deleted": len(tasks)}
