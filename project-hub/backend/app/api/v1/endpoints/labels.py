from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.label import Label
from app.models.user import User
from app.schemas.label import LabelCreate, LabelResponse, LabelUpdate

router = APIRouter()


@router.get("", response_model=list[LabelResponse])
async def list_labels(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Label).order_by(Label.name))
    return [LabelResponse.model_validate(lb) for lb in result.scalars().all()]


@router.post("", response_model=LabelResponse, status_code=201)
async def create_label(data: LabelCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    label = Label(name=data.name, color=data.color, description=data.description)
    db.add(label)
    await db.flush()
    await db.refresh(label)
    return LabelResponse.model_validate(label)


@router.put("/{label_id}", response_model=LabelResponse)
async def update_label(label_id: str, data: LabelUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Label).where(Label.id == label_id))
    label = result.scalar_one_or_none()
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(label, field, value)
    await db.flush()
    await db.refresh(label)
    return LabelResponse.model_validate(label)


@router.delete("/{label_id}", status_code=204)
async def delete_label(label_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Label).where(Label.id == label_id))
    label = result.scalar_one_or_none()
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    await db.delete(label)
