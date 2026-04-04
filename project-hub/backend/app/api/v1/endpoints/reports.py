from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.sprint import Sprint
from app.models.task import Task
from app.models.user import User
from app.schemas.report import BurndownDataPoint, CumulativeFlowDataPoint, VelocityDataPoint

router = APIRouter()


@router.get("/{project_id}/sprints/{sprint_id}/burndown", response_model=list[BurndownDataPoint])
async def burndown(
    project_id: str, sprint_id: str,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    sprint = await db.get(Sprint, sprint_id)
    if not sprint or not sprint.start_date:
        return []

    start = date.fromisoformat(sprint.start_date)
    end = date.fromisoformat(sprint.end_date) if sprint.end_date else start + timedelta(days=14)
    total_days = (end - start).days or 1

    result = await db.execute(
        select(Task).where(Task.sprint_id == sprint_id, Task.project_id == project_id)
    )
    tasks = result.scalars().all()
    total_points = sum(t.story_points or 1 for t in tasks)

    points = []
    for i in range(total_days + 1):
        current_date = start + timedelta(days=i)
        ideal = total_points * (1 - i / total_days)
        done_points = sum(
            (t.story_points or 1) for t in tasks
            if t.status == "done" and t.updated_at and t.updated_at.date() <= current_date
        )
        points.append(BurndownDataPoint(
            date=current_date.isoformat(),
            ideal=round(ideal, 1),
            actual=round(total_points - done_points, 1),
        ))
    return points


@router.get("/{project_id}/velocity", response_model=list[VelocityDataPoint])
async def velocity(project_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(
        select(Sprint).where(Sprint.project_id == project_id, Sprint.status == "completed")
        .order_by(Sprint.end_date.desc()).limit(10)
    )
    sprints = result.scalars().all()
    points = []
    for s in reversed(sprints):
        task_result = await db.execute(select(Task).where(Task.sprint_id == s.id))
        tasks = task_result.scalars().all()
        committed = sum(t.story_points or 1 for t in tasks)
        completed = sum((t.story_points or 1) for t in tasks if t.status == "done")
        points.append(VelocityDataPoint(sprint_name=s.name, completed_points=completed, committed_points=committed))
    return points


@router.get("/{project_id}/cumulative-flow", response_model=list[CumulativeFlowDataPoint])
async def cumulative_flow(project_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    # Generate last 30 days of data
    today = date.today()
    result = await db.execute(select(Task).where(Task.project_id == project_id))
    tasks = result.scalars().all()

    points = []
    for i in range(30):
        d = today - timedelta(days=29 - i)
        # Count tasks by status that existed by this date
        relevant = [t for t in tasks if t.created_at and t.created_at.date() <= d]
        todo = sum(1 for t in relevant if t.status == "todo")
        in_progress = sum(1 for t in relevant if t.status == "in-progress")
        review = sum(1 for t in relevant if t.status == "review")
        done = sum(1 for t in relevant if t.status == "done")
        points.append(CumulativeFlowDataPoint(
            date=d.isoformat(), todo=todo, in_progress=in_progress, review=review, done=done,
        ))
    return points
