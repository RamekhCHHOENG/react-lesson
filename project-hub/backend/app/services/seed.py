"""
Comprehensive sync seed – creates rich demo data on first run.

Called automatically from app.main lifespan.
Skips if users already exist (idempotent).
Pass force=True via POST /reseed to re-seed.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, insert, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models import (
    ActivityLog,
    Comment,
    Epic,
    Label,
    Notification,
    Project,
    ProjectMember,
    Sprint,
    Task,
    User,
    task_labels,
)
from app.services.jira import ensure_jira_metadata


def _uid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _ago(days: int = 0, hours: int = 0) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days, hours=hours)


# ------------------------------------------------------------------
# Public API
# ------------------------------------------------------------------


def seed_initial_data(db: Session, force: bool = False) -> None:
    """Seed all demo data.  Skips if users exist unless *force* is True."""

    user_count = db.scalar(select(func.count()).select_from(User)) or 0
    if user_count > 0 and not force:
        ensure_jira_metadata(db)
        return

    if force:
        # wipe in dependency order
        db.execute(task_labels.delete())
        for model in (Comment, ActivityLog, Notification, Task, Sprint, Epic, ProjectMember, Label, Project, User):
            db.query(model).delete()
        db.commit()

    _seed_all(db)
    ensure_jira_metadata(db)


# ------------------------------------------------------------------
# Internal – builds the entire demo dataset
# ------------------------------------------------------------------


def _seed_all(db: Session) -> None:
    # ── 1. USERS ────────────────────────────────────────────────────
    admin_id = _uid()
    alice_id = _uid()
    bob_id = _uid()

    admin = User(
        id=admin_id,
        email=settings.FIRST_SUPERUSER_EMAIL,
        full_name=settings.FIRST_SUPERUSER_NAME,
        hashed_password=hash_password(settings.FIRST_SUPERUSER_PASSWORD),
        role="admin",
        is_active=True,
        is_superuser=True,
        created_at=_ago(days=30),
    )
    alice = User(
        id=alice_id,
        email="alice@projecthub.com",
        full_name="Alice Chen",
        hashed_password=hash_password("password"),
        role="member",
        is_active=True,
        created_at=_ago(days=28),
    )
    bob = User(
        id=bob_id,
        email="bob@projecthub.com",
        full_name="Bob Martinez",
        hashed_password=hash_password("password"),
        role="member",
        is_active=True,
        created_at=_ago(days=25),
    )
    db.add_all([admin, alice, bob])
    db.flush()

    # ── 2. LABELS ───────────────────────────────────────────────────
    lbl = {}
    label_defs = [
        ("frontend", "#3B82F6", "Frontend related tasks"),
        ("backend", "#10B981", "Backend related tasks"),
        ("bug", "#EF4444", "Bug reports"),
        ("feature", "#8B5CF6", "Feature requests"),
        ("documentation", "#F59E0B", "Documentation tasks"),
        ("urgent", "#DC2626", "Urgent priority items"),
    ]
    for name, color, desc in label_defs:
        lid = _uid()
        lbl[name] = lid
        db.add(Label(id=lid, name=name, color=color, description=desc))
    db.flush()

    # ── 3. PROJECTS ─────────────────────────────────────────────────
    web_id, mob_id, api_id = _uid(), _uid(), _uid()
    now = _now()

    db.add_all([
        Project(
            id=web_id, name="Website Redesign", key="WEB",
            description="Complete redesign of the company website with modern UI/UX patterns, responsive design, and improved performance.",
            status="active", priority="high", owner_id=admin_id,
            start_date="2026-03-01", end_date="2026-05-31",
            tags=["frontend", "design", "ui"], task_seq=12,
            created_at=_ago(days=14), updated_at=now,
        ),
        Project(
            id=mob_id, name="Mobile App v2", key="MOB",
            description="Build version 2 of the mobile application with new features, improved UX, and performance enhancements.",
            status="active", priority="medium", owner_id=alice_id,
            start_date="2026-03-10", end_date="2026-06-30",
            tags=["mobile", "react-native", "ios", "android"], task_seq=5,
            created_at=_ago(days=10), updated_at=now,
        ),
        Project(
            id=api_id, name="API Gateway", key="API",
            description="Design and implement a centralized API gateway for microservices with rate limiting, authentication, and monitoring.",
            status="planning", priority="high", owner_id=admin_id,
            start_date="2026-04-01", end_date="2026-07-31",
            tags=["backend", "devops", "cloud"], task_seq=4,
            created_at=_ago(days=7), updated_at=now,
        ),
    ])
    db.flush()

    # ── 4. PROJECT MEMBERS ──────────────────────────────────────────
    for proj_id in (web_id, mob_id, api_id):
        for uid, role in [(admin_id, "admin"), (alice_id, "member"), (bob_id, "member")]:
            db.add(ProjectMember(id=_uid(), project_id=proj_id, user_id=uid, role=role, joined_at=_ago(days=14)))
    db.flush()

    # ── 5. SPRINTS ──────────────────────────────────────────────────
    ws1, ws2, ws3 = _uid(), _uid(), _uid()
    ms1 = _uid()

    db.add_all([
        Sprint(id=ws1, project_id=web_id, name="Sprint 1",
               goal="Complete homepage wireframes and authentication foundation.",
               status="completed", start_date="2026-03-01", end_date="2026-03-14",
               created_at=_ago(days=14), updated_at=_ago(days=1)),
        Sprint(id=ws2, project_id=web_id, name="Sprint 2",
               goal="Build hero section and integrate login API.",
               status="active", start_date="2026-03-15", end_date="2026-03-28",
               created_at=_ago(days=7), updated_at=_ago(hours=6)),
        Sprint(id=ws3, project_id=web_id, name="Sprint 3",
               goal="Performance optimization and image loading improvements.",
               status="planning",
               created_at=_ago(days=2), updated_at=_ago(days=2)),
        Sprint(id=ms1, project_id=mob_id, name="Sprint 1",
               goal="Core navigation and push notification integration.",
               status="active", start_date="2026-03-10", end_date="2026-03-24",
               created_at=_ago(days=10), updated_at=_ago(days=3)),
    ])
    db.flush()

    # ── 6. EPICS ────────────────────────────────────────────────────
    ep_home, ep_auth, ep_perf = _uid(), _uid(), _uid()

    db.add_all([
        Epic(id=ep_home, project_id=web_id, name="Homepage Redesign",
             description="Complete overhaul of the homepage including hero section, features grid, and testimonials.",
             color="#3B82F6", status="in_progress",
             start_date="2026-03-01", target_date="2026-04-15",
             created_at=_ago(days=14), updated_at=_ago(days=2)),
        Epic(id=ep_auth, project_id=web_id, name="User Authentication",
             description="Implement complete user authentication flow with JWT, social login, and password recovery.",
             color="#10B981", status="done",
             start_date="2026-03-01", target_date="2026-03-28",
             created_at=_ago(days=14), updated_at=_ago(days=3)),
        Epic(id=ep_perf, project_id=web_id, name="Performance Optimization",
             description="Audit and optimize website performance including image loading, caching, and bundle size.",
             color="#F59E0B", status="todo",
             start_date="2026-04-01", target_date="2026-04-30",
             created_at=_ago(days=7), updated_at=_ago(days=7)),
    ])
    db.flush()

    # ── 7. TASKS — WEB (12) ─────────────────────────────────────────
    wt: dict[str, str] = {}  # key → id
    web_tasks = [
        dict(key="WEB-1", title="Design homepage wireframes",
             description="Create detailed wireframes for the new homepage layout including desktop and mobile views.",
             issue_type="story", status="done", priority="medium",
             assignee="Alice Chen", reporter="Admin User",
             sprint_id=ws1, epic_id=ep_home, story_points=5.0, position=0,
             due_date="2026-03-07", created_at=_ago(days=14)),
        dict(key="WEB-2", title="Implement responsive header",
             description="Build the responsive header component with navigation menu, logo, and mobile hamburger menu.",
             issue_type="task", status="done", priority="medium",
             assignee="Bob Martinez", reporter="Admin User",
             sprint_id=ws1, epic_id=ep_home, story_points=3.0, position=1,
             due_date="2026-03-10", created_at=_ago(days=13)),
        dict(key="WEB-3", title="Set up authentication flow",
             description="Implement the complete authentication flow with login, register, and password reset using JWT tokens.",
             issue_type="story", status="done", priority="high",
             assignee="Alice Chen", reporter="Admin User",
             sprint_id=ws1, epic_id=ep_auth, story_points=8.0, position=2,
             due_date="2026-03-14", created_at=_ago(days=13)),
        dict(key="WEB-4", title="Fix mobile nav dropdown",
             description="The mobile navigation dropdown menu has incorrect z-index and overlapping issues on iOS 17.",
             issue_type="bug", status="in_progress", priority="high",
             assignee="Bob Martinez", reporter="Alice Chen",
             sprint_id=ws2, epic_id=None, story_points=2.0, position=0,
             due_date="2026-03-20", created_at=_ago(days=6)),
        dict(key="WEB-5", title="Build hero section",
             description="Implement the hero section with animated CTA button, background video, and responsive layout.",
             issue_type="story", status="in_progress", priority="medium",
             assignee="Alice Chen", reporter="Admin User",
             sprint_id=ws2, epic_id=ep_home, story_points=5.0, position=1,
             due_date="2026-03-25", created_at=_ago(days=5)),
        dict(key="WEB-6", title="API integration for login",
             description="Connect the login form to the backend API endpoint with proper error handling and loading states.",
             issue_type="task", status="review", priority="medium",
             assignee="Bob Martinez", reporter="Admin User",
             sprint_id=ws2, epic_id=ep_auth, story_points=3.0, position=2,
             due_date="2026-03-22", created_at=_ago(days=5)),
        dict(key="WEB-7", title="Add social login buttons",
             description="Add Google and GitHub social login buttons to the authentication page.",
             issue_type="task", status="todo", priority="medium",
             assignee=None, reporter="Admin User",
             sprint_id=ws2, epic_id=ep_auth, story_points=3.0, position=3,
             due_date="2026-03-28", created_at=_ago(days=4)),
        dict(key="WEB-8", title="Performance audit",
             description="Run Lighthouse and WebPageTest audits to identify performance bottlenecks.",
             issue_type="task", status="todo", priority="medium",
             assignee=None, reporter="Admin User",
             sprint_id=ws3, epic_id=ep_perf, story_points=5.0, position=0,
             due_date=None, created_at=_ago(days=3)),
        dict(key="WEB-9", title="Optimize image loading",
             description="Implement lazy loading, responsive images, and WebP format conversion for all site images.",
             issue_type="task", status="todo", priority="medium",
             assignee=None, reporter="Admin User",
             sprint_id=ws3, epic_id=ep_perf, story_points=3.0, position=1,
             due_date=None, created_at=_ago(days=3)),
        dict(key="WEB-10", title="Write API documentation",
             description="Document all REST API endpoints with request/response examples using OpenAPI/Swagger.",
             issue_type="task", status="todo", priority="low",
             assignee=None, reporter="Admin User",
             sprint_id=None, epic_id=None, story_points=2.0, position=0,
             due_date=None, created_at=_ago(days=2)),
        dict(key="WEB-11", title="Footer component",
             description="Build the site footer with links, social icons, newsletter signup, and responsive grid.",
             issue_type="story", status="todo", priority="low",
             assignee=None, reporter="Admin User",
             sprint_id=None, epic_id=None, story_points=2.0, position=1,
             due_date=None, created_at=_ago(days=2)),
        dict(key="WEB-12", title="Fix CSS grid layout on Safari",
             description="CSS grid layout breaks on Safari 17 due to a known WebKit bug. Need a workaround.",
             issue_type="bug", status="todo", priority="medium",
             assignee=None, reporter="Bob Martinez",
             sprint_id=None, epic_id=None, story_points=1.0, position=2,
             due_date=None, created_at=_ago(days=1)),
    ]
    for t in web_tasks:
        tid = _uid()
        wt[t["key"]] = tid
        db.add(Task(id=tid, project_id=web_id, issue_key=t["key"],
                     title=t["title"], description=t["description"],
                     issue_type=t["issue_type"], status=t["status"],
                     priority=t["priority"], assignee=t["assignee"],
                     reporter=t["reporter"], sprint_id=t["sprint_id"],
                     epic_id=t["epic_id"], story_points=t["story_points"],
                     position=t["position"], due_date=t["due_date"],
                     created_at=t["created_at"], updated_at=t["created_at"]))
    db.flush()

    # ── 8. TASKS — MOB (5) ──────────────────────────────────────────
    mt: dict[str, str] = {}
    mob_tasks = [
        dict(key="MOB-1", title="Design app navigation",
             description="Design the bottom tab navigation and drawer menu for the mobile app.",
             issue_type="story", status="done", priority="medium",
             assignee="Alice Chen", reporter="Alice Chen",
             sprint_id=ms1, story_points=5.0, position=0,
             due_date="2026-03-15", created_at=_ago(days=10)),
        dict(key="MOB-2", title="Implement push notifications",
             description="Integrate Firebase Cloud Messaging (FCM) for push notifications on iOS and Android.",
             issue_type="feature", status="in_progress", priority="high",
             assignee="Alice Chen", reporter="Alice Chen",
             sprint_id=ms1, story_points=8.0, position=1,
             due_date="2026-03-22", created_at=_ago(days=9)),
        dict(key="MOB-3", title="Fix crash on Android 12",
             description="App crashes on Android 12 devices when requesting permissions. Stack trace points to the permissions handler.",
             issue_type="bug", status="in_progress", priority="critical",
             assignee="Bob Martinez", reporter="Bob Martinez",
             sprint_id=ms1, story_points=3.0, position=2,
             due_date="2026-03-18", created_at=_ago(days=8)),
        dict(key="MOB-4", title="Add biometric login",
             description="Implement Face ID and fingerprint authentication for quick login on supported devices.",
             issue_type="story", status="todo", priority="medium",
             assignee=None, reporter="Alice Chen",
             sprint_id=None, story_points=5.0, position=0,
             due_date=None, created_at=_ago(days=7)),
        dict(key="MOB-5", title="Dark mode support",
             description="Add system-level dark mode support with manual toggle option in settings.",
             issue_type="feature", status="todo", priority="low",
             assignee=None, reporter="Alice Chen",
             sprint_id=None, story_points=3.0, position=1,
             due_date=None, created_at=_ago(days=6)),
    ]
    for t in mob_tasks:
        tid = _uid()
        mt[t["key"]] = tid
        db.add(Task(id=tid, project_id=mob_id, issue_key=t["key"],
                     title=t["title"], description=t["description"],
                     issue_type=t["issue_type"], status=t["status"],
                     priority=t["priority"], assignee=t["assignee"],
                     reporter=t["reporter"], sprint_id=t["sprint_id"],
                     epic_id=None, story_points=t["story_points"],
                     position=t["position"], due_date=t["due_date"],
                     created_at=t["created_at"], updated_at=t["created_at"]))
    db.flush()

    # ── 9. TASKS — API (4) ──────────────────────────────────────────
    at: dict[str, str] = {}
    api_tasks = [
        dict(key="API-1", title="Design API gateway architecture",
             description="Create architecture diagrams and design documents for the centralized API gateway.",
             issue_type="story", status="in_progress", priority="high",
             assignee="Admin User", reporter="Admin User",
             story_points=8.0, position=0,
             due_date="2026-04-10", created_at=_ago(days=7)),
        dict(key="API-2", title="Set up rate limiting",
             description="Implement rate limiting middleware with configurable thresholds per API key and endpoint.",
             issue_type="task", status="todo", priority="medium",
             assignee=None, reporter="Admin User",
             story_points=5.0, position=1,
             due_date=None, created_at=_ago(days=6)),
        dict(key="API-3", title="Authentication middleware",
             description="Build JWT authentication middleware for the API gateway with token validation and refresh.",
             issue_type="task", status="todo", priority="high",
             assignee=None, reporter="Admin User",
             story_points=5.0, position=2,
             due_date=None, created_at=_ago(days=5)),
        dict(key="API-4", title="Logging and monitoring",
             description="Set up structured logging, request tracing, and integration with monitoring dashboards.",
             issue_type="task", status="todo", priority="medium",
             assignee=None, reporter="Admin User",
             story_points=3.0, position=3,
             due_date=None, created_at=_ago(days=4)),
    ]
    for t in api_tasks:
        tid = _uid()
        at[t["key"]] = tid
        db.add(Task(id=tid, project_id=api_id, issue_key=t["key"],
                     title=t["title"], description=t["description"],
                     issue_type=t["issue_type"], status=t["status"],
                     priority=t["priority"], assignee=t["assignee"],
                     reporter=t["reporter"], sprint_id=None,
                     epic_id=None, story_points=t["story_points"],
                     position=t["position"], due_date=t["due_date"],
                     created_at=t["created_at"], updated_at=t["created_at"]))
    db.flush()

    # ── 10. TASK ↔ LABEL associations ───────────────────────────────
    for tid, lid in [
        (wt["WEB-1"], lbl["frontend"]), (wt["WEB-2"], lbl["frontend"]),
        (wt["WEB-5"], lbl["frontend"]),
        (wt["WEB-3"], lbl["backend"]), (wt["WEB-6"], lbl["backend"]),
        (wt["WEB-4"], lbl["bug"]),
        (mt["MOB-3"], lbl["bug"]), (mt["MOB-3"], lbl["urgent"]),
    ]:
        db.execute(insert(task_labels).values(task_id=tid, label_id=lid))
    db.flush()

    # ── 11. COMMENTS (10) ───────────────────────────────────────────
    db.add_all([
        Comment(id=_uid(), task_id=wt["WEB-1"], user_id=admin_id,
                content="Great wireframe work! The new layout looks much better.",
                created_at=_ago(days=12, hours=3), updated_at=_ago(days=12, hours=3)),
        Comment(id=_uid(), task_id=wt["WEB-1"], user_id=alice_id,
                content="Thanks! I'll refine the mobile version next.",
                created_at=_ago(days=12, hours=1), updated_at=_ago(days=12, hours=1)),
        Comment(id=_uid(), task_id=wt["WEB-3"], user_id=bob_id,
                content="Should we use JWT or session-based auth?",
                created_at=_ago(days=11, hours=5), updated_at=_ago(days=11, hours=5)),
        Comment(id=_uid(), task_id=wt["WEB-3"], user_id=admin_id,
                content="Let's go with JWT. Better for our API-first approach.",
                created_at=_ago(days=11, hours=2), updated_at=_ago(days=11, hours=2)),
        Comment(id=_uid(), task_id=wt["WEB-4"], user_id=bob_id,
                content="Reproduced on iOS 17. The hamburger menu z-index is wrong.",
                created_at=_ago(days=5, hours=6), updated_at=_ago(days=5, hours=6)),
        Comment(id=_uid(), task_id=wt["WEB-5"], user_id=alice_id,
                content="Working on the animation for the CTA button.",
                created_at=_ago(days=3, hours=4), updated_at=_ago(days=3, hours=4)),
        Comment(id=_uid(), task_id=mt["MOB-2"], user_id=alice_id,
                content="FCM integration is done, testing on different Android versions.",
                created_at=_ago(days=4, hours=2), updated_at=_ago(days=4, hours=2)),
        Comment(id=_uid(), task_id=mt["MOB-3"], user_id=bob_id,
                content="Stack trace points to the permissions handler. Fixing now.",
                created_at=_ago(days=6, hours=3), updated_at=_ago(days=6, hours=3)),
        Comment(id=_uid(), task_id=at["API-1"], user_id=admin_id,
                content="Let's review the architecture diagram in tomorrow's standup.",
                created_at=_ago(days=5, hours=1), updated_at=_ago(days=5, hours=1)),
        Comment(id=_uid(), task_id=wt["WEB-6"], user_id=bob_id,
                content="Login endpoint is connected. Need to add error handling.",
                created_at=_ago(days=2, hours=5), updated_at=_ago(days=2, hours=5)),
    ])
    db.flush()

    # ── 12. ACTIVITY LOGS (16) ──────────────────────────────────────
    db.add_all([
        ActivityLog(id=_uid(), user_id=admin_id, user_name="Admin User",
                    action="created", entity_type="project", entity_id=web_id,
                    entity_title="Website Redesign", project_id=web_id,
                    project_name="Website Redesign",
                    details={"key": "WEB", "status": "active"},
                    created_at=_ago(days=14, hours=8)),
        ActivityLog(id=_uid(), user_id=alice_id, user_name="Alice Chen",
                    action="created", entity_type="project", entity_id=mob_id,
                    entity_title="Mobile App v2", project_id=mob_id,
                    project_name="Mobile App v2",
                    details={"key": "MOB", "status": "active"},
                    created_at=_ago(days=10, hours=6)),
        ActivityLog(id=_uid(), user_id=admin_id, user_name="Admin User",
                    action="created", entity_type="project", entity_id=api_id,
                    entity_title="API Gateway", project_id=api_id,
                    project_name="API Gateway",
                    details={"key": "API", "status": "planning"},
                    created_at=_ago(days=7, hours=4)),
        ActivityLog(id=_uid(), user_id=admin_id, user_name="Admin User",
                    action="created", entity_type="task", entity_id=wt["WEB-1"],
                    entity_title="Design homepage wireframes", project_id=web_id,
                    project_name="Website Redesign",
                    details={"issue_key": "WEB-1", "issue_type": "story"},
                    created_at=_ago(days=14, hours=7)),
        ActivityLog(id=_uid(), user_id=admin_id, user_name="Admin User",
                    action="assigned", entity_type="task", entity_id=wt["WEB-1"],
                    entity_title="Design homepage wireframes", project_id=web_id,
                    project_name="Website Redesign",
                    details={"issue_key": "WEB-1", "assignee": "Alice Chen"},
                    created_at=_ago(days=14, hours=6)),
        ActivityLog(id=_uid(), user_id=admin_id, user_name="Admin User",
                    action="assigned", entity_type="task", entity_id=wt["WEB-2"],
                    entity_title="Implement responsive header", project_id=web_id,
                    project_name="Website Redesign",
                    details={"issue_key": "WEB-2", "assignee": "Bob Martinez"},
                    created_at=_ago(days=13, hours=4)),
        ActivityLog(id=_uid(), user_id=alice_id, user_name="Alice Chen",
                    action="updated", entity_type="task", entity_id=wt["WEB-1"],
                    entity_title="Design homepage wireframes", project_id=web_id,
                    project_name="Website Redesign",
                    details={"issue_key": "WEB-1", "field": "status", "from": "in_progress", "to": "done"},
                    created_at=_ago(days=10, hours=3)),
        ActivityLog(id=_uid(), user_id=bob_id, user_name="Bob Martinez",
                    action="updated", entity_type="task", entity_id=wt["WEB-2"],
                    entity_title="Implement responsive header", project_id=web_id,
                    project_name="Website Redesign",
                    details={"issue_key": "WEB-2", "field": "status", "from": "in_progress", "to": "done"},
                    created_at=_ago(days=9, hours=2)),
        ActivityLog(id=_uid(), user_id=alice_id, user_name="Alice Chen",
                    action="updated", entity_type="task", entity_id=wt["WEB-3"],
                    entity_title="Set up authentication flow", project_id=web_id,
                    project_name="Website Redesign",
                    details={"issue_key": "WEB-3", "field": "status", "from": "in_progress", "to": "done"},
                    created_at=_ago(days=8, hours=1)),
        ActivityLog(id=_uid(), user_id=admin_id, user_name="Admin User",
                    action="status_changed", entity_type="sprint", entity_id=ws1,
                    entity_title="Sprint 1", project_id=web_id,
                    project_name="Website Redesign",
                    details={"from": "active", "to": "completed"},
                    created_at=_ago(days=7, hours=8)),
        ActivityLog(id=_uid(), user_id=admin_id, user_name="Admin User",
                    action="status_changed", entity_type="sprint", entity_id=ws2,
                    entity_title="Sprint 2", project_id=web_id,
                    project_name="Website Redesign",
                    details={"from": "planning", "to": "active"},
                    created_at=_ago(days=7, hours=7)),
        ActivityLog(id=_uid(), user_id=admin_id, user_name="Admin User",
                    action="commented", entity_type="task", entity_id=wt["WEB-1"],
                    entity_title="Design homepage wireframes", project_id=web_id,
                    project_name="Website Redesign",
                    details={"issue_key": "WEB-1", "comment_preview": "Great wireframe work!"},
                    created_at=_ago(days=12, hours=3)),
        ActivityLog(id=_uid(), user_id=bob_id, user_name="Bob Martinez",
                    action="commented", entity_type="task", entity_id=wt["WEB-4"],
                    entity_title="Fix mobile nav dropdown", project_id=web_id,
                    project_name="Website Redesign",
                    details={"issue_key": "WEB-4", "comment_preview": "Reproduced on iOS 17."},
                    created_at=_ago(days=5, hours=6)),
        ActivityLog(id=_uid(), user_id=bob_id, user_name="Bob Martinez",
                    action="joined", entity_type="project", entity_id=web_id,
                    entity_title="Website Redesign", project_id=web_id,
                    project_name="Website Redesign",
                    details={"role": "member"},
                    created_at=_ago(days=13, hours=10)),
        ActivityLog(id=_uid(), user_id=alice_id, user_name="Alice Chen",
                    action="created", entity_type="task", entity_id=mt["MOB-2"],
                    entity_title="Implement push notifications", project_id=mob_id,
                    project_name="Mobile App v2",
                    details={"issue_key": "MOB-2", "issue_type": "feature"},
                    created_at=_ago(days=9, hours=5)),
        ActivityLog(id=_uid(), user_id=bob_id, user_name="Bob Martinez",
                    action="updated", entity_type="task", entity_id=wt["WEB-6"],
                    entity_title="API integration for login", project_id=web_id,
                    project_name="Website Redesign",
                    details={"issue_key": "WEB-6", "field": "status", "from": "in_progress", "to": "review"},
                    created_at=_ago(days=2, hours=5)),
    ])
    db.flush()

    # ── 13. NOTIFICATIONS (5 for admin) ─────────────────────────────
    db.add_all([
        Notification(id=_uid(), user_id=admin_id, type="task_assigned",
                     title="Task Assigned", message="Alice Chen assigned WEB-5 to you",
                     is_read=False, entity_type="task", entity_id=wt["WEB-5"],
                     created_at=_ago(days=5, hours=2)),
        Notification(id=_uid(), user_id=admin_id, type="comment_added",
                     title="New Comment", message="Bob commented on WEB-4",
                     is_read=False, entity_type="task", entity_id=wt["WEB-4"],
                     created_at=_ago(days=5, hours=6)),
        Notification(id=_uid(), user_id=admin_id, type="sprint_started",
                     title="Sprint Started", message="Sprint 2 has started",
                     is_read=True, entity_type="sprint", entity_id=ws2,
                     created_at=_ago(days=7, hours=7)),
        Notification(id=_uid(), user_id=admin_id, type="task_completed",
                     title="Task Completed", message="Alice completed WEB-3",
                     is_read=True, entity_type="task", entity_id=wt["WEB-3"],
                     created_at=_ago(days=8, hours=1)),
        Notification(id=_uid(), user_id=admin_id, type="member_added",
                     title="New Member", message="New member Bob joined Website Redesign",
                     is_read=True, entity_type="project", entity_id=web_id,
                     created_at=_ago(days=13, hours=10)),
    ])

    db.commit()
