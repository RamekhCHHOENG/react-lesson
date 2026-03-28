from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Project, Task, User
from app.schemas.project import dump_projects, serialize_project
from app.services.seed import seed_demo_projects


router = APIRouter(prefix="/storage", tags=["storage"])


def load_projects(db: Session) -> list[Project]:
    return db.scalars(select(Project).options(selectinload(Project.tasks)).order_by(Project.updated_at.desc())).unique().all()


@router.get("/info")
def storage_info(db: Session = Depends(get_db)) -> dict:
    projects = load_projects(db)
    payload = [serialize_project(project) for project in projects]
    raw = dump_projects(projects)
    size_bytes = len(raw.encode("utf-8"))
    if size_bytes < 1024:
        size = f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        size = f"{size_bytes / 1024:.1f} KB"
    else:
        size = f"{size_bytes / (1024 * 1024):.1f} MB"

    task_count = sum(len(project["tasks"]) for project in payload)
    return {
        "data": {
            "size": size,
            "projectCount": len(payload),
            "taskCount": task_count,
        },
        "success": True,
    }


@router.delete("/clear")
def clear_storage(db: Session = Depends(get_db)) -> dict:
    db.execute(delete(Task))
    db.execute(delete(Project))
    db.commit()
    return {"data": None, "success": True, "message": "All data cleared"}


@router.post("/reseed")
def reseed_storage(db: Session = Depends(get_db)) -> dict:
    owner = db.scalar(select(User).where(User.is_superuser.is_(True)).limit(1))
    if owner is not None:
        seed_demo_projects(db, owner=owner, force=True)
    return {
        "data": None,
        "success": True,
        "message": "Database re-seeded with demo data",
    }


@router.get("/export")
def export_storage(db: Session = Depends(get_db)) -> dict:
    return {
        "data": dump_projects(load_projects(db)),
        "success": True,
    }
