from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.search import SearchResult

router = APIRouter()


@router.get("", response_model=list[SearchResult])
async def search(
    q: str = Query("", min_length=1, max_length=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    results: list[SearchResult] = []
    pattern = f"%{q}%"

    # Search projects
    proj_result = await db.execute(
        select(Project).where(Project.name.ilike(pattern)).limit(5)
    )
    for p in proj_result.scalars().all():
        results.append(SearchResult(
            type="project", id=p.id, title=p.name,
            subtitle=p.description[:80] if p.description else None,
            project_key=p.key,
        ))

    # Search tasks
    task_result = await db.execute(
        select(Task).where(
            (Task.title.ilike(pattern)) | (Task.issue_key.ilike(pattern))
        ).limit(10)
    )
    for t in task_result.scalars().all():
        results.append(SearchResult(
            type="task", id=t.id, title=t.title,
            subtitle=t.status, issue_key=t.issue_key,
        ))

    return results
