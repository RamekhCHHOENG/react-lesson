from pydantic import BaseModel


class SprintCreate(BaseModel):
    name: str
    goal: str = ""
    start_date: str | None = None
    end_date: str | None = None
    status: str = "planning"


class SprintUpdate(BaseModel):
    name: str | None = None
    goal: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    status: str | None = None


class SprintTaskSummary(BaseModel):
    id: str
    issue_key: str
    title: str
    status: str
    priority: str
    assignee: str | None = None
    story_points: float | None = None

    model_config = {"from_attributes": True}


class SprintResponse(BaseModel):
    id: str
    project_id: str
    name: str
    goal: str
    status: str
    start_date: str | None = None
    end_date: str | None = None
    tasks: list[SprintTaskSummary] = []
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
