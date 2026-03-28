from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Project, Task


router = APIRouter(tags=["search"])


@router.get("/search")
def search_projects(q: str = Query(default=""), db: Session = Depends(get_db)) -> dict:
    query = q.strip()
    if not query:
        return {"data": [], "success": True}

    pattern = f"%{query}%"
    results: list[dict] = []

    projects = db.scalars(
        select(Project).where(
            or_(
                Project.key.ilike(pattern),
                Project.name.ilike(pattern),
                Project.description.ilike(pattern),
            )
        )
    ).all()
    for project in projects:
        results.append(
            {
                "type": "project",
                "id": project.id,
                "projectId": project.id,
                "projectName": project.name,
                "title": f"{project.key or 'PRJ'} · {project.name}",
                "description": project.description,
                "status": project.status,
            }
        )

    tasks = db.scalars(
        select(Task)
        .join(Project, Project.id == Task.project_id)
        .where(
            or_(
                Task.issue_key.ilike(pattern),
                Task.title.ilike(pattern),
                Task.description.ilike(pattern),
                Task.reporter.ilike(pattern),
                Task.assignee.ilike(pattern),
            )
        )
    ).all()
    for task in tasks[:20]:
        project = db.get(Project, task.project_id)
        if project is None:
            continue
        results.append(
            {
                "type": "task",
                "id": task.id,
                "projectId": project.id,
                "projectName": project.name,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "issueKey": task.issue_key,
            }
        )

    return {"data": results[:20], "success": True}
