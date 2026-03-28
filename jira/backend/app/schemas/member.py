from pydantic import BaseModel


class AddMemberRequest(BaseModel):
    user_id: str
    role: str = "member"


# Alias used by member routes
MemberCreate = AddMemberRequest


class UpdateMemberRoleRequest(BaseModel):
    role: str


# Alias used by member routes
MemberUpdate = UpdateMemberRoleRequest


class MemberResponse(BaseModel):
    id: str
    project_id: str
    user_id: str
    user_name: str
    user_email: str
    user_avatar: str | None = None
    role: str
    joined_at: str

    model_config = {"from_attributes": True}
