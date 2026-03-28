from __future__ import annotations

import re

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Project, Task, User


def slugify_project_key(name: str) -> str:
    parts = [re.sub(r"[^A-Z0-9]", "", part.upper()) for part in name.split() if part.strip()]
    letters = "".join(part[:1] for part in parts if part)
    if len(letters) >= 2:
        return letters[:10]

    compact = re.sub(r"[^A-Z0-9]", "", name.upper())
    return (compact[:6] or "PRJ")


def ensure_unique_project_key(db: Session, candidate: str, current_project_id: str | None = None) -> str:
    base = candidate[:10] or "PRJ"
    key = base
    suffix = 1
    while True:
        stmt = select(Project).where(Project.key == key)
        if current_project_id:
            stmt = stmt.where(Project.id != current_project_id)
        exists = db.scalar(stmt)
        if exists is None:
            return key
        suffix += 1
        key = f"{base[: max(1, 10 - len(str(suffix)))]}{suffix}"


def next_issue_key(db: Session, project: Project) -> str:
    existing = db.scalars(
        select(Task.issue_key).where(Task.project_id == project.id, Task.issue_key.is_not(None))
    ).all()
    pattern = re.compile(rf"^{re.escape(project.key)}-(\d+)$")
    max_number = 0
    for issue_key in existing:
        if not issue_key:
            continue
        match = pattern.match(issue_key)
        if match:
            max_number = max(max_number, int(match.group(1)))
    return f"{project.key}-{max_number + 1}"


def ensure_jira_metadata(db: Session) -> None:
    owner = db.scalar(select(User).where(User.is_superuser.is_(True)).limit(1))
    projects = db.scalars(
        select(Project)
        .options(selectinload(Project.tasks))
        .order_by(Project.created_at.asc())
    ).unique().all()

    has_changes = False
    for project in projects:
        if not project.key:
            project.key = ensure_unique_project_key(db, slugify_project_key(project.name), project.id)
            has_changes = True

        ordered_tasks = sorted(project.tasks, key=lambda item: (item.created_at, item.id))
        counter = 1
        seen_issue_keys: set[str] = set()
        for task in ordered_tasks:
            if not task.issue_key or task.issue_key in seen_issue_keys:
                task.issue_key = f"{project.key}-{counter}"
                has_changes = True
            seen_issue_keys.add(task.issue_key)
            counter += 1

            if not task.issue_type:
                task.issue_type = "task"
                has_changes = True
            if not task.priority:
                task.priority = project.priority or "medium"
                has_changes = True
            if not task.reporter:
                task.reporter = owner.full_name if owner else "System"
                has_changes = True

    if has_changes:
        db.commit()
