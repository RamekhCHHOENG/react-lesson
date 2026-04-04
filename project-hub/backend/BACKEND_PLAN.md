# Jira Backend Plan

## Goal
Build a production-ready backend for the Jira-style frontend using:
- FastAPI
- PostgreSQL
- Redis
- SQLAlchemy 2.0
- Alembic
- JWT authentication
- Docker Compose
- Pytest
- Celery for background jobs

## Current Frontend Contract
The frontend already expects these REST endpoints:
- `GET /api/projects`
- `GET /api/projects/{id}`
- `POST /api/projects`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`
- `POST /api/projects/{project_id}/tasks`
- `PUT /api/projects/{project_id}/tasks/{task_id}`
- `DELETE /api/projects/{project_id}/tasks/{task_id}`
- `GET /api/search?q=`
- `GET /api/storage/info`
- `DELETE /api/storage/clear`
- `POST /api/storage/reseed`
- `GET /api/storage/export`

The frontend also still uses static session-based login. Replace that with real auth in phase 2.

## Recommended Backend Stack
- **API framework:** FastAPI
- **ASGI server:** Uvicorn in dev, Gunicorn + Uvicorn workers in production
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Database:** PostgreSQL 16
- **Cache / queue broker:** Redis 7
- **Background jobs:** Celery
- **Validation / settings:** Pydantic v2 + pydantic-settings
- **Auth:** JWT access + refresh tokens
- **Testing:** pytest + httpx + pytest-asyncio
- **Quality:** Ruff + Black + MyPy
- **Observability:** structlog or standard logging + health endpoints
- **Containerization:** Docker + docker-compose

## Suggested Folder Structure
```text
backend/
  app/
    api/
      v1/
        routes/
          auth.py
          projects.py
          tasks.py
          search.py
          admin.py
          health.py
    core/
      config.py
      security.py
      database.py
      redis.py
      logging.py
    models/
      user.py
      project.py
      task.py
      tag.py
      refresh_token.py
    schemas/
      auth.py
      common.py
      project.py
      task.py
      search.py
    services/
      auth_service.py
      project_service.py
      task_service.py
      search_service.py
      storage_service.py
    repositories/
      users.py
      projects.py
      tasks.py
    workers/
      celery_app.py
      jobs.py
    main.py
  tests/
  alembic/
  requirements.txt or pyproject.toml
  .env.example
  Dockerfile
```

## Data Model

### 1. users
- `id` UUID PK
- `email` unique
- `full_name`
- `password_hash`
- `is_active`
- `is_superuser`
- `created_at`
- `updated_at`

### 2. projects
- `id` UUID PK
- `name`
- `description`
- `status` enum: `planning`, `in-progress`, `on-hold`, `completed`, `cancelled`
- `priority` enum: `low`, `medium`, `high`, `urgent`
- `start_date`
- `end_date`
- `owner_id` FK users.id
- `created_at`
- `updated_at`

### 3. tasks
- `id` UUID PK
- `project_id` FK projects.id
- `title`
- `description`
- `status` text
- `assignee_id` FK users.id nullable
- `due_date`
- `position` integer
- `created_at`
- `updated_at`

### 4. tags
- `id` UUID PK
- `name` unique
- `color` nullable

### 5. project_tags
- `project_id` FK
- `tag_id` FK

### 6. refresh_tokens
- `id` UUID PK
- `user_id` FK users.id
- `token_hash`
- `expires_at`
- `revoked_at`
- `created_at`

## API Design

### Auth
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Projects
Match the current frontend contract exactly first.

Add optional query params later:
- `status`
- `priority`
- `search`
- `page`
- `page_size`
- `sort_by`
- `sort_order`

### Tasks
Keep nested task routes for frontend compatibility.
Later add:
- `PATCH /api/tasks/{id}/move`
- `PATCH /api/tasks/{id}`
- `GET /api/tasks/{id}`

### Search
- `GET /api/search?q=`
Search project name, description, tags, task title, and task description.
Use PostgreSQL full-text search later if needed.

### Admin / Storage utilities
Current mock endpoints can become admin-only tools:
- `GET /api/storage/info`
- `DELETE /api/storage/clear`
- `POST /api/storage/reseed`
- `GET /api/storage/export`

## Redis Usage
Use Redis for:
- caching project lists and dashboard summaries
- rate limiting login and sensitive endpoints
- Celery broker / result backend
- short-lived search cache
- session blacklist / token revocation cache if needed

## Background Jobs
Use Celery for:
- sending invite or notification emails
- async export generation
- activity log aggregation
- scheduled overdue-task reminders
- reseed or bulk import jobs if data grows

## Security Plan
- Hash passwords with `passlib` or `pwdlib`
- JWT access token: 15 to 30 min
- Refresh token rotation
- CORS for frontend host
- Request validation with Pydantic
- Role checks for admin-only storage endpoints
- Audit logs for login and destructive actions
- Rate limit auth endpoints with Redis

## Non-Functional Requirements
- health endpoints: `/health/live`, `/health/ready`
- OpenAPI docs enabled in dev
- structured error responses
- pagination on list endpoints
- DB indexes on project status, priority, task status, search fields
- 80%+ test coverage for service layer and API layer

## Docker Compose Plan
Services:
- `api` → FastAPI app
- `postgres` → PostgreSQL 16
- `redis` → Redis 7
- `worker` → Celery worker
- `flower` → optional Celery monitoring

## Environment Variables
- `APP_ENV`
- `APP_NAME`
- `API_V1_PREFIX=/api`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `REFRESH_TOKEN_EXPIRE_DAYS`
- `DATABASE_URL`
- `REDIS_URL`
- `CORS_ORIGINS`
- `FIRST_SUPERUSER_EMAIL`
- `FIRST_SUPERUSER_PASSWORD`

## Delivery Phases

### Phase 1 — Foundation
- initialize FastAPI app
- set up PostgreSQL, Redis, Alembic
- define models and schemas
- add health endpoint
- add Docker Compose
- add `.env.example`

### Phase 2 — Auth
- implement users table
- add login, refresh, logout, me
- replace static frontend login
- protect write endpoints

### Phase 3 — Core Jira Data
- implement projects CRUD
- implement tasks CRUD
- add tags support
- connect frontend from MSW to real API

### Phase 4 — Search + Admin Tools
- implement search endpoint
- implement storage info/export/reseed tools
- add admin authorization

### Phase 5 — Production Readiness
- add Redis caching
- add Celery jobs
- add tests, linting, CI
- add logging, metrics, backups

## Frontend Integration Notes
1. Keep route shapes identical to the current mock API first.
2. Remove MSW startup from `frontend/src/main.tsx` when backend is ready.
3. Keep `BASE_URL = "/api"` and use Vite proxy in development, or serve frontend behind a reverse proxy.
4. Replace static auth in `frontend/src/store/AuthContext.tsx` with token-based auth flows.

## First Implementation Milestone
Deliver this minimal usable backend first:
- auth login/me
- projects CRUD
- task CRUD
- PostgreSQL persistence
- Redis connection
- Docker Compose
- seed script
- Swagger docs
- pytest smoke tests

## Nice-to-Have After MVP
- comments
- attachments
- task activity history
- project members and permissions
- websocket notifications
- dashboards and analytics materialized views
