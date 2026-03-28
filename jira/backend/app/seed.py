"""Seed the database with demo data. Run: python -m app.seed"""
import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import engine, SessionLocal
from app.core.security import get_password_hash
from app.models import Base
from app.models.user import User
from app.models.project import Project
from app.models.task import Task, task_labels
from app.models.sprint import Sprint
from app.models.epic import Epic
from app.models.comment import Comment
from app.models.member import ProjectMember
from app.models.label import Label
from app.models.notification import Notification
from app.models.activity import ActivityLog


def uid() -> str:
    return str(uuid.uuid4())


def now() -> datetime:
    return datetime.now(timezone.utc)


def days_ago(n: int) -> datetime:
    return now() - timedelta(days=n)


def date_str(days_offset: int = 0) -> str:
    return (now() + timedelta(days=days_offset)).strftime("%Y-%m-%d")


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        # ── Users ──
        admin = User(
            id=uid(), email="admin@jira.com", full_name="Admin User",
            hashed_password=get_password_hash("password"), role="admin",
        )
        alice = User(
            id=uid(), email="alice@jira.com", full_name="Alice Chen",
            hashed_password=get_password_hash("password"), role="member",
        )
        bob = User(
            id=uid(), email="bob@jira.com", full_name="Bob Smith",
            hashed_password=get_password_hash("password"), role="member",
        )
        users = [admin, alice, bob]
        db.add_all(users)
        await db.flush()

        # ── Labels ──
        labels_data = [
            ("frontend", "#3b82f6", "Frontend related"),
            ("backend", "#22c55e", "Backend related"),
            ("bug", "#ef4444", "Bug fix"),
            ("feature", "#8b5cf6", "New feature"),
            ("documentation", "#f97316", "Documentation"),
            ("urgent", "#dc2626", "Urgent priority"),
        ]
        labels = []
        for name, color, desc in labels_data:
            lb = Label(id=uid(), name=name, color=color, description=desc)
            labels.append(lb)
        db.add_all(labels)
        await db.flush()

        # ── Projects ──
        proj1 = Project(
            id=uid(), name="Jira Clone", key="JC", description="Build a Jira-like project management tool",
            status="in-progress", priority="high", owner_id=admin.id,
            start_date=date_str(-30), tags=["react", "python", "fastapi"], task_seq=0,
        )
        proj2 = Project(
            id=uid(), name="Marketing Website", key="MW", description="Company marketing website redesign",
            status="planning", priority="medium", owner_id=alice.id,
            start_date=date_str(-10), tags=["nextjs", "tailwind"], task_seq=0,
        )
        proj3 = Project(
            id=uid(), name="Mobile App", key="MA", description="Cross-platform mobile application",
            status="in-progress", priority="high", owner_id=bob.id,
            start_date=date_str(-20), tags=["react-native", "typescript"], task_seq=0,
        )
        projects = [proj1, proj2, proj3]
        db.add_all(projects)
        await db.flush()

        # ── Members ──
        for proj in projects:
            for user in users:
                role = "admin" if user.id == proj.owner_id else "member"
                db.add(ProjectMember(id=uid(), project_id=proj.id, user_id=user.id, role=role))
        await db.flush()

        # ── Sprints ──
        sprint1 = Sprint(
            id=uid(), project_id=proj1.id, name="Sprint 1 - Foundation",
            goal="Set up project structure and core features",
            status="completed", start_date=date_str(-28), end_date=date_str(-14),
        )
        sprint2 = Sprint(
            id=uid(), project_id=proj1.id, name="Sprint 2 - Features",
            goal="Implement board and backlog views",
            status="active", start_date=date_str(-14),
        )
        sprint3 = Sprint(
            id=uid(), project_id=proj1.id, name="Sprint 3 - Polish",
            goal="Mobile responsiveness and final polish",
            status="planning",
        )
        sprints = [sprint1, sprint2, sprint3]
        db.add_all(sprints)
        await db.flush()

        # ── Epics ──
        epic1 = Epic(
            id=uid(), project_id=proj1.id, name="Authentication System",
            description="User auth with JWT", color="#3b82f6", status="done",
            start_date=date_str(-28), target_date=date_str(-14),
        )
        epic2 = Epic(
            id=uid(), project_id=proj1.id, name="Board & Kanban",
            description="Drag and drop board", color="#22c55e", status="in-progress",
            start_date=date_str(-14), target_date=date_str(14),
        )
        epic3 = Epic(
            id=uid(), project_id=proj1.id, name="Reports & Analytics",
            description="Charts and dashboards", color="#8b5cf6", status="todo",
            start_date=date_str(7), target_date=date_str(30),
        )
        epics = [epic1, epic2, epic3]
        db.add_all(epics)
        await db.flush()

        # ── Tasks ──
        assignees = [admin.full_name, alice.full_name, bob.full_name]
        statuses = ["todo", "in-progress", "review", "done"]
        priorities = ["low", "medium", "high", "urgent"]
        issue_types = ["story", "task", "bug"]
        task_titles = [
            # Project 1 tasks
            ("Set up FastAPI project", "task", "done", "high", 3, sprint1.id, epic1.id),
            ("Implement JWT authentication", "story", "done", "urgent", 8, sprint1.id, epic1.id),
            ("Create user registration", "task", "done", "high", 5, sprint1.id, epic1.id),
            ("Design database schema", "task", "done", "high", 5, sprint1.id, None),
            ("Build Kanban board UI", "story", "in-progress", "high", 13, sprint2.id, epic2.id),
            ("Add drag-and-drop", "task", "in-progress", "medium", 8, sprint2.id, epic2.id),
            ("Task detail sidebar", "task", "review", "medium", 5, sprint2.id, epic2.id),
            ("Fix login redirect bug", "bug", "todo", "urgent", 2, sprint2.id, None),
            ("Add dark mode toggle", "task", "done", "low", 3, sprint2.id, None),
            ("Implement search functionality", "story", "todo", "medium", 8, None, None),
            ("Create reports page", "story", "todo", "medium", 13, None, epic3.id),
            ("Add burndown chart", "task", "todo", "low", 5, None, epic3.id),
            ("Sprint velocity chart", "task", "todo", "low", 5, None, epic3.id),
            ("Mobile responsive layout", "story", "in-progress", "high", 8, sprint2.id, None),
            ("Fix CSS overflow on board", "bug", "todo", "medium", 2, sprint2.id, epic2.id),
        ]
        proj1_tasks = []
        for i, (title, itype, status, priority, sp, sid, eid) in enumerate(task_titles):
            proj1.task_seq += 1
            t = Task(
                id=uid(), project_id=proj1.id, issue_key=f"JC-{proj1.task_seq}",
                title=title, description=f"Description for: {title}",
                issue_type=itype, status=status, priority=priority,
                assignee=assignees[i % 3], reporter=admin.full_name,
                due_date=date_str(i * 2 - 10), sprint_id=sid, epic_id=eid,
                story_points=sp, position=i,
                created_at=days_ago(30 - i), updated_at=days_ago(max(0, 15 - i)),
            )
            proj1_tasks.append(t)
        db.add_all(proj1_tasks)

        # Project 2 tasks
        proj2_titles = [
            ("Design homepage mockup", "story", "in-progress", "high", 8),
            ("Set up Next.js project", "task", "done", "medium", 3),
            ("Create contact form", "task", "todo", "low", 3),
            ("Add SEO meta tags", "task", "todo", "medium", 2),
            ("Performance optimization", "story", "todo", "high", 8),
        ]
        for i, (title, itype, status, priority, sp) in enumerate(proj2_titles):
            proj2.task_seq += 1
            db.add(Task(
                id=uid(), project_id=proj2.id, issue_key=f"MW-{proj2.task_seq}",
                title=title, issue_type=itype, status=status, priority=priority,
                assignee=assignees[i % 3], reporter=alice.full_name,
                story_points=sp, position=i,
                created_at=days_ago(10 - i), updated_at=days_ago(max(0, 5 - i)),
            ))

        # Project 3 tasks
        proj3_titles = [
            ("Set up React Native project", "task", "done", "high", 5),
            ("Build login screen", "story", "done", "high", 8),
            ("Implement push notifications", "story", "in-progress", "medium", 13),
            ("Fix Android crash on startup", "bug", "in-progress", "urgent", 3),
            ("Add biometric authentication", "task", "todo", "medium", 8),
            ("Design onboarding flow", "story", "review", "medium", 5),
        ]
        for i, (title, itype, status, priority, sp) in enumerate(proj3_titles):
            proj3.task_seq += 1
            db.add(Task(
                id=uid(), project_id=proj3.id, issue_key=f"MA-{proj3.task_seq}",
                title=title, issue_type=itype, status=status, priority=priority,
                assignee=assignees[i % 3], reporter=bob.full_name,
                story_points=sp, position=i,
                created_at=days_ago(20 - i), updated_at=days_ago(max(0, 10 - i)),
            ))

        await db.flush()

        # ── Attach labels to some tasks ──
        if proj1_tasks:
            for t in proj1_tasks[:3]:
                t.labels.append(labels[0])  # frontend
            for t in proj1_tasks[3:6]:
                t.labels.append(labels[1])  # backend
            proj1_tasks[7].labels.append(labels[2])  # bug

        # ── Comments ──
        if proj1_tasks:
            for i, t in enumerate(proj1_tasks[:5]):
                commenter = users[i % 3]
                db.add(Comment(
                    id=uid(), task_id=t.id, user_id=commenter.id,
                    content=f"Working on this. Looks good so far!",
                    created_at=days_ago(5 - i),
                ))

        # ── Activity ──
        for i, t in enumerate(proj1_tasks[:8]):
            db.add(ActivityLog(
                id=uid(), user_id=admin.id, user_name=admin.full_name,
                action="created" if i < 4 else "updated",
                entity_type="task", entity_id=t.id, entity_title=t.title,
                project_id=proj1.id, project_name=proj1.name,
                created_at=days_ago(28 - i),
            ))

        # ── Notifications ──
        db.add(Notification(
            id=uid(), user_id=admin.id, type="task_assigned",
            title="Task assigned to you", message="You were assigned JC-5: Build Kanban board UI",
            entity_type="task", entity_id=proj1_tasks[4].id if len(proj1_tasks) > 4 else None,
        ))
        db.add(Notification(
            id=uid(), user_id=admin.id, type="comment",
            title="New comment on JC-1", message="Alice commented on your task",
            entity_type="task",
        ))

        await db.commit()
        print("✓ Database seeded successfully!")
        print(f"  Users: admin@jira.com / alice@jira.com / bob@jira.com (password: password)")
        print(f"  Projects: {len(projects)}")
        print(f"  Tasks: {proj1.task_seq + proj2.task_seq + proj3.task_seq}")


if __name__ == "__main__":
    asyncio.run(seed())
