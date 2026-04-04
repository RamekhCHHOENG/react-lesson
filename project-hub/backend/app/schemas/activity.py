from pydantic import BaseModel
from typing import Any


class ActivityResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_avatar: str | None = None
    action: str
    entity_type: str
    entity_id: str
    entity_title: str
    project_id: str | None = None
    project_name: str | None = None
    details: dict[str, Any] | None = None
    created_at: str

    model_config = {"from_attributes": True}
