from pydantic import BaseModel


class SearchResult(BaseModel):
    type: str
    id: str
    title: str
    subtitle: str | None = None
    project_key: str | None = None
    issue_key: str | None = None
