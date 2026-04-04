"""Dashboard stats & overview endpoint — aggregates data across projects."""

from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.project import Project
from app.models.task import Task
from app.models.sprint import Sprint
from app.models.activity import ActivityLog
from app.models.user import User

router = APIRouter()


@router.get("/stats")
async def dashboard_stats(
    project_id: str | None = Query(None, description="Scope stats to a single project"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return aggregated dashboard statistics with trend data."""
    base = select(Task)
    if project_id:
        base = base.where(Task.project_id == project_id)

    result = await db.execute(base)
    tasks = result.scalars().all()

    total = len(tasks)
    by_status: dict[str, int] = {}
    by_priority: dict[str, int] = {}
    by_type: dict[str, int] = {}
    overdue = 0
    today_str = date.today().isoformat()

    for t in tasks:
        by_status[t.status] = by_status.get(t.status, 0) + 1
        by_priority[t.priority] = by_priority.get(t.priority, 0) + 1
        by_type[t.issue_type] = by_type.get(t.issue_type, 0) + 1
        if t.due_date and t.due_date < today_str and t.status != "done":
            overdue += 1

    done = by_status.get("done", 0)
    in_progress = by_status.get("in-progress", 0) + by_status.get("review", 0)
    completion_rate = round((done / total) * 100, 1) if total else 0

    # Tasks assigned to current user
    my_tasks = [t for t in tasks if t.assignee == current_user.full_name]
    my_open = sum(1 for t in my_tasks if t.status != "done")

    # Weekly trend — tasks completed per day in last 7 days
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    weekly_completed = []
    for i in range(7):
        d = (week_ago + timedelta(days=i + 1)).date()
        count = sum(
            1 for t in tasks
            if t.status == "done" and t.updated_at and t.updated_at.date() == d
        )
        weekly_completed.append({"date": d.isoformat(), "count": count})

    # Recent activity count
    act_result = await db.execute(
        select(func.count(ActivityLog.id)).where(
            ActivityLog.created_at >= week_ago
        )
    )
    recent_activity_count = act_result.scalar() or 0

    return {
        "total_tasks": total,
        "done": done,
        "in_progress": in_progress,
        "todo": by_status.get("todo", 0),
        "overdue": overdue,
        "completion_rate": completion_rate,
        "my_open_tasks": my_open,
        "by_status": by_status,
        "by_priority": by_priority,
        "by_type": by_type,
        "weekly_completed": weekly_completed,
        "recent_activity_count": recent_activity_count,
    }


@router.get("/my-tasks")
async def my_tasks(
    status: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Paginated list of tasks assigned to current user."""
    query = (
        select(Task)
        .where(Task.assignee == current_user.full_name)
        .order_by(Task.updated_at.desc())
    )
    if status:
        query = query.where(Task.status == status)

    # Total count
    count_result = await db.execute(
        select(func.count(Task.id)).where(Task.assignee == current_user.full_name)
    )
    total = count_result.scalar() or 0

    result = await db.execute(query.limit(limit).offset(offset))
    tasks = result.scalars().all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": [
            {
                "id": t.id,
                "issue_key": t.issue_key,
                "title": t.title,
                "status": t.status,
                "priority": t.priority,
                "issue_type": t.issue_type,
                "due_date": t.due_date,
                "project_id": t.project_id,
                "updated_at": t.updated_at.isoformat() if t.updated_at else "",
            }
            for t in tasks
        ],
    }


@router.get("/overdue")
async def overdue_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all overdue tasks (past due date, not done)."""
    today_str = date.today().isoformat()
    result = await db.execute(
        select(Task)
        .where(Task.due_date < today_str, Task.status != "done")
        .order_by(Task.due_date)
    )
    tasks = result.scalars().all()
    return [
        {
            "id": t.id,
            "issue_key": t.issue_key,
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "assignee": t.assignee,
            "due_date": t.due_date,
            "project_id": t.project_id,
        }
        for t in tasks
    ]
