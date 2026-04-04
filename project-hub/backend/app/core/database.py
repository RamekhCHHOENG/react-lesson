from collections.abc import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.models import Base


_is_sqlite = settings.DATABASE_URL.startswith("sqlite")
_connect_args = {"check_same_thread": False} if _is_sqlite else {}

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    migrate_schema()


def migrate_schema() -> None:
    """Best-effort migration for legacy schemas. Errors are ignored on fresh databases."""
    try:
        _migrate_schema_impl()
    except Exception:
        pass


def _migrate_schema_impl() -> None:
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    is_sqlite = settings.DATABASE_URL.startswith("sqlite")

    with engine.begin() as connection:
        if "projects" in tables:
            project_columns = {column["name"] for column in inspector.get_columns("projects")}
            if "project_key" not in project_columns:
                connection.execute(text("ALTER TABLE projects ADD COLUMN project_key VARCHAR(20)"))
            if not is_sqlite:
                try:
                    connection.execute(text("ALTER TABLE projects ALTER COLUMN end_date DROP NOT NULL"))
                except Exception:
                    pass

        if "tasks" in tables:
            task_columns = {column["name"] for column in inspector.get_columns("tasks")}
            if "issue_key" not in task_columns:
                connection.execute(text("ALTER TABLE tasks ADD COLUMN issue_key VARCHAR(32)"))
            if "issue_type" not in task_columns:
                connection.execute(text("ALTER TABLE tasks ADD COLUMN issue_type VARCHAR(50)"))
            if "priority" not in task_columns:
                connection.execute(text("ALTER TABLE tasks ADD COLUMN priority VARCHAR(50)"))
            if "reporter" not in task_columns:
                connection.execute(text("ALTER TABLE tasks ADD COLUMN reporter VARCHAR(255)"))
            if "sprint_id" not in task_columns:
                connection.execute(text("ALTER TABLE tasks ADD COLUMN sprint_id VARCHAR(36)"))
            if "story_points" not in task_columns:
                connection.execute(text("ALTER TABLE tasks ADD COLUMN story_points INTEGER"))
            if "labels" not in task_columns:
                connection.execute(text("ALTER TABLE tasks ADD COLUMN labels JSON DEFAULT '[]'"))

        # Sprints table migration
        if "sprints" in tables:
            sprint_columns = {column["name"] for column in inspector.get_columns("sprints")}
            if "goal" not in sprint_columns:
                connection.execute(text("ALTER TABLE sprints ADD COLUMN goal TEXT DEFAULT ''"))

        # Comments table migration
        if "comments" in tables:
            comment_columns = {column["name"] for column in inspector.get_columns("comments")}
            if "updated_at" not in comment_columns:
                if is_sqlite:
                    connection.execute(text(
                        "ALTER TABLE comments ADD COLUMN updated_at DATETIME"
                    ))
                else:
                    connection.execute(text(
                        "ALTER TABLE comments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW()"
                    ))

        # Activities table migration
        if "activities" in tables:
            activity_columns = {column["name"] for column in inspector.get_columns("activities")}
            if "project_id" not in activity_columns:
                connection.execute(text("ALTER TABLE activities ADD COLUMN project_id VARCHAR(36)"))
            if "task_id" not in activity_columns:
                connection.execute(text("ALTER TABLE activities ADD COLUMN task_id VARCHAR(36)"))
            if "description" not in activity_columns:
                connection.execute(text("ALTER TABLE activities ADD COLUMN description TEXT DEFAULT ''"))

        # Project members table migration
        if "project_members" in tables:
            member_columns = {column["name"] for column in inspector.get_columns("project_members")}
            if "updated_at" not in member_columns:
                if is_sqlite:
                    connection.execute(text(
                        "ALTER TABLE project_members ADD COLUMN updated_at DATETIME"
                    ))
                else:
                    connection.execute(text(
                        "ALTER TABLE project_members ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW()"
                    ))

        # Notifications table migration
        if "notifications" in tables:
            notification_columns = {column["name"] for column in inspector.get_columns("notifications")}
            if "project_id" not in notification_columns:
                connection.execute(text("ALTER TABLE notifications ADD COLUMN project_id VARCHAR(36)"))
            if "task_id" not in notification_columns:
                connection.execute(text("ALTER TABLE notifications ADD COLUMN task_id VARCHAR(36)"))
