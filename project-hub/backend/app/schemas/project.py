from __future__ import annotations

import json

from pydantic import BaseModel

from app.schemas.task import TaskCreate, TaskUpdate  # noqa: F401  re-export


class ProjectCreate(BaseModel):
    name: str
    key: str | None = None
    description: str = ""
    status: str = "planning"
    priority: str = "medium"
    start_date: str | None = None
    end_date: str | None = None
    tags: list[str] = []


class ProjectUpdate(BaseModel):
    name: str | None = None
    key: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    tags: list[str] | None = None


class TaskInProject(BaseModel):
    id: str
    project_id: str
    issue_key: str
    title: str
    description: str
    issue_type: str
    status: str
    priority: str
    assignee: str | None = None
    reporter: str | None = None
    due_date: str | None = None
    sprint_id: str | None = None
    epic_id: str | None = None
    parent_id: str | None = None
    story_points: float | None = None
    labels: list[str] = []
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class ProjectResponse(BaseModel):
    id: str
    name: str
    key: str
    description: str
    status: str
    priority: str
    owner_id: str
    start_date: str | None = None
    end_date: str | None = None
    tags: list[str] = []
    tasks: list[TaskInProject] = []
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


def serialize_task(task) -> dict:
    """Convert a Task SQLAlchemy model to a JSON-serializable dict."""
    label_names: list[str] = []
    if hasattr(task, "labels") and task.labels:
        try:
            label_names = [getattr(l, "name", str(l)) for l in task.labels]
        except Exception:
            label_names = []
    return {
        "id": task.id,
        "project_id": task.project_id,
        "issue_key": task.issue_key or "",
        "title": task.title,
        "description": task.description or "",
        "issue_type": task.issue_type or "task",
        "status": task.status or "todo",
        "priority": task.priority or "medium",
        "assignee": task.assignee or "",
        "reporter": task.reporter or "",
        "due_date": str(task.due_date) if task.due_date else None,
        "sprint_id": task.sprint_id,
        "epic_id": task.epic_id,
        "parent_id": task.parent_id,
        "story_points": task.story_points,
        "labels": label_names,
        "created_at": task.created_at.isoformat() if task.created_at else "",
        "updated_at": task.updated_at.isoformat() if task.updated_at else "",
    }


def serialize_project(project) -> dict:
    """Convert a Project SQLAlchemy model to a JSON-serializable dict."""
    tasks = []
    if hasattr(project, "tasks") and project.tasks:
        tasks = [serialize_task(t) for t in project.tasks]
    return {
        "id": project.id,
        "name": project.name,
        "key": project.key or "",
        "description": project.description or "",
        "status": project.status or "planning",
        "priority": project.priority or "medium",
        "owner_id": project.owner_id,
        "start_date": str(project.start_date) if project.start_date else None,
        "end_date": str(project.end_date) if project.end_date else None,
        "tags": project.tags or [],
        "task_seq": project.task_seq,
        "tasks": tasks,
        "created_at": project.created_at.isoformat() if project.created_at else "",
        "updated_at": project.updated_at.isoformat() if project.updated_at else "",
    }


def dump_projects(projects) -> str:
    """Serialize a list of Project models to a JSON string."""
    data = [serialize_project(p) for p in projects]
    return json.dumps(data, indent=2, default=str)
