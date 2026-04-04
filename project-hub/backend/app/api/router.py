from fastapi import APIRouter

from app.api.routes.activities import router as activities_router
from app.api.routes.attachments import router as attachments_router
from app.api.routes.auth import router as auth_router
from app.api.routes.comments import router as comments_router
from app.api.routes.epics import router as epics_router
from app.api.routes.health import router as health_router
from app.api.routes.members import router as members_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.projects import router as projects_router
from app.api.routes.search import router as search_router
from app.api.routes.sprints import router as sprints_router
from app.api.routes.storage import router as storage_router
from app.api.routes.users import router as users_router


api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(projects_router)
api_router.include_router(search_router)
api_router.include_router(storage_router)
api_router.include_router(sprints_router)
api_router.include_router(comments_router)
api_router.include_router(activities_router)
api_router.include_router(members_router)
api_router.include_router(notifications_router)
api_router.include_router(users_router)
api_router.include_router(attachments_router)
api_router.include_router(epics_router)
