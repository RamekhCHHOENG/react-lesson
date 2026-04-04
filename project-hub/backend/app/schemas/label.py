from pydantic import BaseModel


class LabelCreate(BaseModel):
    name: str
    color: str = "#6b7280"
    description: str | None = None


class LabelUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    description: str | None = None


class LabelResponse(BaseModel):
    id: str
    name: str
    color: str
    description: str | None = None

    model_config = {"from_attributes": True}
