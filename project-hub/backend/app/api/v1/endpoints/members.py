from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.member import ProjectMember
from app.models.user import User
from app.schemas.member import AddMemberRequest, MemberResponse, UpdateMemberRoleRequest

router = APIRouter()


def _serialize(m: ProjectMember) -> dict:
    return MemberResponse(
        id=m.id, project_id=m.project_id, user_id=m.user_id,
        user_name=m.user.full_name if m.user else "",
        user_email=m.user.email if m.user else "",
        user_avatar=m.user.avatar_url if m.user else None,
        role=m.role,
        joined_at=m.joined_at.isoformat() if m.joined_at else "",
    ).model_dump()


@router.get("/{project_id}/members", response_model=list[MemberResponse])
async def list_members(project_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(
        select(ProjectMember).options(selectinload(ProjectMember.user))
        .where(ProjectMember.project_id == project_id)
    )
    return [_serialize(m) for m in result.scalars().all()]


@router.post("/{project_id}/members", response_model=MemberResponse, status_code=201)
async def add_member(
    project_id: str, data: AddMemberRequest,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    member = ProjectMember(project_id=project_id, user_id=data.user_id, role=data.role)
    db.add(member)
    await db.flush()
    await db.refresh(member, attribute_names=["user"])
    return _serialize(member)


@router.put("/{project_id}/members/{member_id}", response_model=MemberResponse)
async def update_member_role(
    project_id: str, member_id: str, data: UpdateMemberRoleRequest,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ProjectMember).options(selectinload(ProjectMember.user))
        .where(ProjectMember.id == member_id, ProjectMember.project_id == project_id)
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    member.role = data.role
    await db.flush()
    await db.refresh(member)
    return _serialize(member)


@router.delete("/{project_id}/members/{member_id}", status_code=204)
async def remove_member(project_id: str, member_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(
        select(ProjectMember).where(ProjectMember.id == member_id, ProjectMember.project_id == project_id)
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    await db.delete(member)
