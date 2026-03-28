from pydantic import BaseModel


class CommentCreate(BaseModel):
    content: str


class CommentUpdate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: str
    task_id: str
    user_id: str
    user_name: str
    user_avatar: str | None = None
    content: str
    is_edited: bool
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
