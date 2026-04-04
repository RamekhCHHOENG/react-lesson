from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Activity, Project, ProjectMember, User
from app.schemas.member import MemberCreate, MemberUpdate


router = APIRouter(tags=["members"])


def serialize_member(member: ProjectMember) -> dict:
    return {
        "id": member.id,
        "projectId": member.project_id,
        "user": {
            "id": member.user.id,
            "email": member.user.email,
            "name": member.user.full_name,
        },
        "role": member.role,
        "createdAt": member.joined_at.isoformat(),
    }


@router.get("/projects/{project_id}/members")
def list_members(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    project = db.scalar(select(Project).where(Project.id == project_id))
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    members = db.scalars(
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id)
        .order_by(ProjectMember.created_at.asc())
    ).all()

    result = []
    for member in members:
        if member.user is None:
            member.user = db.get(User, member.user_id)
        result.append(serialize_member(member))

    return {"data": result, "success": True}


@router.post("/projects/{project_id}/members", status_code=status.HTTP_201_CREATED)
def add_member(
    project_id: str,
    payload: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    project = db.scalar(select(Project).where(Project.id == project_id))
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    user = db.scalar(select(User).where(User.id == payload.user_id, User.is_active.is_(True)))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing = db.scalar(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == payload.user_id,
        )
    )
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User is already a member of this project")

    member = ProjectMember(
        project_id=project_id,
        user_id=payload.user_id,
        role=payload.role,
    )
    db.add(member)
    db.flush()

    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        action="added_member",
        entity_type="member",
        entity_id=member.id,
        description=f"Added {user.full_name} as {payload.role} to project",
    )
    db.add(activity)
    db.commit()
    db.refresh(member)

    if member.user is None:
        member.user = db.get(User, member.user_id)

    return {
        "data": serialize_member(member),
        "success": True,
        "message": "Member added successfully",
    }


@router.put("/projects/{project_id}/members/{member_id}")
def update_member(
    project_id: str,
    member_id: str,
    payload: MemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    project = db.scalar(select(Project).where(Project.id == project_id))
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    member = db.scalar(
        select(ProjectMember).where(
            ProjectMember.id == member_id,
            ProjectMember.project_id == project_id,
        )
    )
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    old_role = member.role
    member.role = payload.role
    db.add(member)

    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        action="updated_member",
        entity_type="member",
        entity_id=member.id,
        field_name="role",
        old_value=old_role,
        new_value=payload.role,
        description=f"Updated member role from '{old_role}' to '{payload.role}'",
    )
    db.add(activity)
    db.commit()
    db.refresh(member)

    if member.user is None:
        member.user = db.get(User, member.user_id)

    return {
        "data": serialize_member(member),
        "success": True,
        "message": "Member role updated successfully",
    }


@router.delete("/projects/{project_id}/members/{member_id}")
def remove_member(
    project_id: str,
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    project = db.scalar(select(Project).where(Project.id == project_id))
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    member = db.scalar(
        select(ProjectMember).where(
            ProjectMember.id == member_id,
            ProjectMember.project_id == project_id,
        )
    )
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    if member.user is None:
        member.user = db.get(User, member.user_id)
    member_name = member.user.full_name if member.user else "Unknown"

    db.delete(member)

    activity = Activity(
        project_id=project_id,
        user_id=current_user.id,
        action="removed_member",
        entity_type="member",
        entity_id=member_id,
        description=f"Removed {member_name} from project",
    )
    db.add(activity)
    db.commit()

    return {
        "data": None,
        "success": True,
        "message": "Member removed successfully",
    }
