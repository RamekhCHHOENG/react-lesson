from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Activity, Notification, Project, Task, User
from app.services.jira import ensure_unique_project_key, next_issue_key, slugify_project_key
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    TaskCreate,
    TaskUpdate,
    serialize_project,
    serialize_task,
)


router = APIRouter(tags=["projects"])


def get_project_or_404(db: Session, project_id: str) -> Project:
    project = db.scalar(
        select(Project)
        .where(Project.id == project_id)
        .options(selectinload(Project.tasks))
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("/projects")
def list_projects(db: Session = Depends(get_db)) -> dict:
    projects = db.scalars(
        select(Project)
        .options(selectinload(Project.tasks))
        .order_by(Project.updated_at.desc())
    ).unique().all()
    return {"data": [serialize_project(project) for project in projects], "success": True}


@router.get("/projects/{project_id}")
def get_project(project_id: str, db: Session = Depends(get_db)) -> dict:
    project = get_project_or_404(db, project_id)
    return {"data": serialize_project(project), "success": True}


@router.post("/projects", status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    project_key = ensure_unique_project_key(
        db,
        slugify_project_key(payload.key or payload.name),
    )
    project = Project(
        key=project_key,
        name=payload.name,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        start_date=payload.start_date,
        end_date=payload.end_date,
        tags=payload.tags,
        owner_id=current_user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    project = get_project_or_404(db, project.id)
    return {
        "data": serialize_project(project),
        "success": True,
        "message": "Project created successfully",
    }


@router.put("/projects/{project_id}")
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    project = get_project_or_404(db, project_id)
    updates = payload.model_dump(exclude_unset=True)

    if "key" in updates and updates["key"]:
        project.key = ensure_unique_project_key(db, slugify_project_key(updates["key"]), project.id)
    if "name" in updates:
        project.name = updates["name"]
    if "description" in updates:
        project.description = updates["description"]
    if "status" in updates:
        project.status = updates["status"]
    if "priority" in updates:
        project.priority = updates["priority"]
    if "start_date" in updates:
        project.start_date = updates["start_date"]
    if "end_date" in updates:
        project.end_date = updates["end_date"]
    if "tags" in updates:
        project.tags = updates["tags"]

    db.add(project)
    db.commit()
    db.refresh(project)
    project = get_project_or_404(db, project.id)

    return {
        "data": serialize_project(project),
        "success": True,
        "message": "Project updated successfully",
    }


@router.delete("/projects/{project_id}")
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    project = get_project_or_404(db, project_id)
    db.delete(project)
    db.commit()
    return {
        "data": None,
        "success": True,
        "message": "Project deleted successfully",
    }


@router.post("/projects/{project_id}/tasks", status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: str,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    project = get_project_or_404(db, project_id)
    task = Task(
        project_id=project.id,
        issue_key=next_issue_key(db, project),
        issue_type=payload.issue_type,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        reporter=payload.reporter or current_user.full_name,
        assignee=payload.assignee,
        due_date=payload.due_date,
        sprint_id=payload.sprint_id or None,
        story_points=payload.story_points,
    )
    db.add(task)
    db.flush()

    # Create activity log for task creation
    activity = Activity(
        project_id=project.id,
        task_id=task.id,
        user_id=current_user.id,
        action="created",
        entity_type="task",
        entity_id=task.id,
        description=f"Created task '{task.title}'",
    )
    db.add(activity)

    # Notify assignee if set and different from creator
    if task.assignee and task.assignee != current_user.full_name:
        assignee_user = db.scalar(
            select(User).where(User.full_name == task.assignee, User.is_active.is_(True))
        )
        if assignee_user is not None:
            notification = Notification(
                user_id=assignee_user.id,
                type="task_assigned",
                title="You have been assigned a task",
                message=f"{current_user.full_name} assigned you to '{task.title}'",
                entity_type="task",
                entity_id=task.id,
                project_id=project.id,
                task_id=task.id,
            )
            db.add(notification)

    db.commit()
    db.refresh(task)
    return {
        "data": serialize_task(task),
        "success": True,
        "message": "Task created successfully",
    }


@router.put("/projects/{project_id}/tasks/{task_id}")
def update_task(
    project_id: str,
    task_id: str,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    get_project_or_404(db, project_id)
    task = db.scalar(select(Task).where(Task.id == task_id, Task.project_id == project_id))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    updates = payload.model_dump(exclude_unset=True)

    # Track changes for activity log
    changes: list[tuple[str, str | None, str | None]] = []

    if "issue_type" in updates:
        old_val = task.issue_type
        task.issue_type = updates["issue_type"]
        if old_val != updates["issue_type"]:
            changes.append(("issueType", old_val, updates["issue_type"]))
    if "title" in updates:
        old_val = task.title
        task.title = updates["title"]
        if old_val != updates["title"]:
            changes.append(("title", old_val, updates["title"]))
    if "description" in updates:
        old_val = task.description
        task.description = updates["description"]
    if "status" in updates:
        old_val = task.status
        task.status = updates["status"]
        if old_val != updates["status"]:
            changes.append(("status", old_val, updates["status"]))
    if "priority" in updates:
        old_val = task.priority
        task.priority = updates["priority"]
        if old_val != updates["priority"]:
            changes.append(("priority", old_val, updates["priority"]))
    if "reporter" in updates:
        old_val = task.reporter
        task.reporter = updates["reporter"]
    if "assignee" in updates:
        old_val = task.assignee
        task.assignee = updates["assignee"]
        if old_val != updates["assignee"]:
            changes.append(("assignee", old_val, updates["assignee"]))
    if "due_date" in updates:
        old_val = task.due_date
        task.due_date = updates["due_date"]
        new_val = updates["due_date"]
        if old_val != new_val:
            changes.append(("dueDate", old_val, new_val))
    if "sprint_id" in updates:
        old_val = task.sprint_id
        task.sprint_id = updates["sprint_id"] or None
        if old_val != task.sprint_id:
            changes.append(("sprintId", old_val, task.sprint_id))
    if "story_points" in updates:
        old_val = str(task.story_points) if task.story_points is not None else None
        task.story_points = updates["story_points"]
        new_val = str(updates["story_points"]) if updates["story_points"] is not None else None
        if old_val != new_val:
            changes.append(("storyPoints", old_val, new_val))

    db.add(task)

    # Create activity entries for each tracked change
    if changes:
        for field_name, old_value, new_value in changes:
            activity = Activity(
                project_id=project_id,
                task_id=task_id,
                user_id=current_user.id,
                action="updated",
                entity_type="task",
                entity_id=task_id,
                field_name=field_name,
                old_value=old_value,
                new_value=new_value,
                description=f"Updated {field_name} on task '{task.title}'",
            )
            db.add(activity)
    else:
        # Generic update activity if no specific field changes tracked
        activity = Activity(
            project_id=project_id,
            task_id=task_id,
            user_id=current_user.id,
            action="updated",
            entity_type="task",
            entity_id=task_id,
            description=f"Updated task '{task.title}'",
        )
        db.add(activity)

    # Notify new assignee if assignee changed
    if "assignee" in updates and updates["assignee"] and updates["assignee"] != current_user.full_name:
        assignee_user = db.scalar(
            select(User).where(User.full_name == updates["assignee"], User.is_active.is_(True))
        )
        if assignee_user is not None:
            notification = Notification(
                user_id=assignee_user.id,
                type="task_assigned",
                title="You have been assigned a task",
                message=f"{current_user.full_name} assigned you to '{task.title}'",
                entity_type="task",
                entity_id=task_id,
                project_id=project_id,
                task_id=task_id,
            )
            db.add(notification)

    db.commit()
    db.refresh(task)

    return {
        "data": serialize_task(task),
        "success": True,
        "message": "Task updated successfully",
    }


@router.delete("/projects/{project_id}/tasks/{task_id}")
def delete_task(
    project_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    get_project_or_404(db, project_id)
    task = db.scalar(select(Task).where(Task.id == task_id, Task.project_id == project_id))
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    task_title = task.title

    db.delete(task)

    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        action="deleted",
        entity_type="task",
        entity_id=task_id,
        description=f"Deleted task '{task_title}'",
    )
    db.add(activity)

    db.commit()
    return {
        "data": None,
        "success": True,
        "message": "Task deleted successfully",
    }
