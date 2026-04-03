from fastapi import APIRouter

from app.api.v1.endpoints import (
    activity,
    auth,
    comments,
    dashboard,
    epics,
    history,
    labels,
    members,
    notifications,
    projects,
    reports,
    search,
    sprints,
    tasks,
    ws,
)

api_router = APIRouter()

# Auth
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Projects (nested resources share prefix)
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(tasks.router, prefix="/projects", tags=["tasks"])
api_router.include_router(sprints.router, prefix="/projects", tags=["sprints"])
api_router.include_router(epics.router, prefix="/projects", tags=["epics"])
api_router.include_router(members.router, prefix="/projects", tags=["members"])
api_router.include_router(reports.router, prefix="/projects", tags=["reports"])

# Top-level resources
api_router.include_router(comments.router, tags=["comments"])
api_router.include_router(labels.router, prefix="/labels", tags=["labels"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(activity.router, prefix="/activity", tags=["activity"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(history.router, tags=["history"])

# WebSocket
api_router.include_router(ws.router, tags=["websocket"])
