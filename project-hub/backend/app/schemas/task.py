from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    issue_type: str = "task"
    status: str = "todo"
    priority: str = "medium"
    assignee: str | None = None
    reporter: str | None = None
    due_date: str | None = None
    sprint_id: str | None = None
    epic_id: str | None = None
    parent_id: str | None = None
    story_points: float | None = None
    labels: list[str] = []


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    issue_type: str | None = None
    status: str | None = None
    priority: str | None = None
    assignee: str | None = None
    reporter: str | None = None
    due_date: str | None = None
    sprint_id: str | None = None
    epic_id: str | None = None
    parent_id: str | None = None
    story_points: float | None = None
    labels: list[str] | None = None


class TaskResponse(BaseModel):
    id: str
    project_id: str
    issue_key: str
    title: str
    description: str
    issue_type: str
    status: str
    priority: str
    assignee: str | None = None
    reporter: str | None = None
    due_date: str | None = None
    sprint_id: str | None = None
    epic_id: str | None = None
    parent_id: str | None = None
    story_points: float | None = None
    labels: list[str] = []
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class TaskSummary(BaseModel):
    id: str
    issue_key: str
    title: str
    status: str
    priority: str
    assignee: str | None = None

    model_config = {"from_attributes": True}


class LinkedIssueResponse(BaseModel):
    id: str
    link_type: str
    task: TaskSummary

    model_config = {"from_attributes": True}


class CreateSubtaskRequest(BaseModel):
    title: str
    assignee: str | None = None


class CreateLinkRequest(BaseModel):
    target_task_id: str
    link_type: str


class BulkUpdateRequest(BaseModel):
    task_ids: list[str]
    status: str | None = None
    priority: str | None = None
    assignee: str | None = None


class BulkDeleteRequest(BaseModel):
    task_ids: list[str]
