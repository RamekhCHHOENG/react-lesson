from pydantic import BaseModel


class EpicCreate(BaseModel):
    name: str
    description: str = ""
    color: str = "#3b82f6"
    status: str = "todo"
    start_date: str | None = None
    target_date: str | None = None


class EpicUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    color: str | None = None
    status: str | None = None
    start_date: str | None = None
    target_date: str | None = None


class EpicResponse(BaseModel):
    id: str
    project_id: str
    name: str
    description: str
    color: str
    status: str
    start_date: str | None = None
    target_date: str | None = None
    task_ids: list[str] = []
    tasks_total: int = 0
    tasks_done: int = 0
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class LinkTaskRequest(BaseModel):
    task_id: str
