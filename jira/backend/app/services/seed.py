from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models import Project, Task, User
from app.services.jira import ensure_jira_metadata


def days_from_today(days: int) -> date:
    return date.today() + timedelta(days=days)


def ensure_default_user(db: Session) -> User:
    user = db.scalar(select(User).where(User.email == settings.FIRST_SUPERUSER_EMAIL))
    if user:
        return user

    user = User(
        email=settings.FIRST_SUPERUSER_EMAIL,
        full_name=settings.FIRST_SUPERUSER_NAME,
        hashed_password=hash_password(settings.FIRST_SUPERUSER_PASSWORD),
        is_active=True,
        is_superuser=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def seed_demo_projects(db: Session, owner: User, force: bool = False) -> None:
    existing_count = db.scalar(select(func.count()).select_from(Project))
    if existing_count and not force:
        return

    if force:
        db.query(Task).delete()
        db.query(Project).delete()
        db.commit()

    projects = [
        {
            "key": "WEB",
            "name": "Website Redesign",
            "description": "Redesign the company website with modern UI/UX patterns and responsive design.",
            "status": "in-progress",
            "priority": "high",
            "start_date": days_from_today(-14),
            "end_date": days_from_today(30),
            "tags": ["frontend", "design", "ui"],
            "tasks": [
                ("story", "high", "Admin User", "Create wireframes", "Design wireframes for all major pages", "done", "Alice", days_from_today(-7)),
                ("task", "high", "Admin User", "Implement homepage", "Build the new homepage with hero section and features", "in-progress", "Bob", days_from_today(5)),
                ("task", "medium", "Admin User", "Mobile responsive", "Ensure all pages work on mobile devices", "todo", "Alice", days_from_today(14)),
                ("task", "medium", "Admin User", "SEO optimization", "Add meta tags, structured data, and optimize for search engines", "todo", "", days_from_today(20)),
                ("bug", "high", "Admin User", "Code review - header component", "Review the new header component implementation", "review", "Charlie", days_from_today(2)),
            ],
        },
        {
            "key": "MOB",
            "name": "Mobile App v2",
            "description": "Build version 2 of the mobile application with new features and performance improvements.",
            "status": "planning",
            "priority": "urgent",
            "start_date": days_from_today(-3),
            "end_date": days_from_today(60),
            "tags": ["mobile", "react-native"],
            "tasks": [
                ("epic", "urgent", "Admin User", "Define app architecture", "Choose tech stack and define the app architecture", "in-progress", "Dave", days_from_today(3)),
                ("task", "high", "Admin User", "Set up CI/CD pipeline", "Configure automated builds and deployments for iOS and Android", "todo", "Eve", days_from_today(10)),
                ("story", "high", "Admin User", "Design system setup", "Create reusable component library for the mobile app", "todo", "Alice", days_from_today(12)),
            ],
        },
        {
            "key": "API",
            "name": "API Gateway Migration",
            "description": "Migrate from legacy API gateway to a modern cloud-native solution.",
            "status": "in-progress",
            "priority": "high",
            "start_date": days_from_today(-21),
            "end_date": days_from_today(14),
            "tags": ["backend", "devops", "cloud"],
            "tasks": [
                ("task", "medium", "Admin User", "Audit existing endpoints", "Document all existing API endpoints and their usage patterns", "done", "Frank", days_from_today(-14)),
                ("task", "high", "Admin User", "Set up new gateway", "Deploy and configure the new API gateway infrastructure", "done", "Frank", days_from_today(-7)),
                ("story", "urgent", "Admin User", "Migrate auth service", "Move authentication service to the new gateway", "in-progress", "Grace", days_from_today(3)),
                ("task", "high", "Admin User", "Load testing", "Run load tests to ensure the new gateway handles traffic", "todo", "Frank", days_from_today(10)),
                ("task", "medium", "Admin User", "Update client SDKs", "Update all client libraries to use new gateway URLs", "review", "Hank", days_from_today(5)),
                ("task", "medium", "Admin User", "DNS cutover plan", "Plan the DNS migration to minimize downtime", "todo", "Grace", days_from_today(12)),
            ],
        },
        {
            "key": "MKT",
            "name": "Q1 Marketing Campaign",
            "description": "Plan and execute the Q1 marketing campaign across all channels.",
            "status": "completed",
            "priority": "medium",
            "start_date": days_from_today(-45),
            "end_date": days_from_today(-5),
            "tags": ["marketing", "campaign"],
            "tasks": [
                ("story", "medium", "Admin User", "Create campaign brief", "Write campaign objectives, audience, and messaging", "done", "Ivy", days_from_today(-40)),
                ("task", "medium", "Admin User", "Design ad creatives", "Create banner ads, social posts, and email templates", "done", "Alice", days_from_today(-25)),
                ("task", "medium", "Admin User", "Launch email campaign", "Send email blast to subscriber list", "done", "Ivy", days_from_today(-15)),
            ],
        },
        {
            "key": "SEC",
            "name": "Security Audit",
            "description": "Conduct a comprehensive security audit of all systems and fix vulnerabilities.",
            "status": "on-hold",
            "priority": "urgent",
            "start_date": days_from_today(-10),
            "end_date": days_from_today(20),
            "tags": ["security", "compliance"],
            "tasks": [
                ("bug", "urgent", "Admin User", "Vulnerability scanning", "Run automated scans across all environments", "done", "Jack", days_from_today(-5)),
                ("task", "urgent", "Admin User", "Penetration testing", "Hire external team for pen testing", "todo", "", days_from_today(10)),
            ],
        },
    ]

    for item in projects:
        project = Project(
            key=item["key"],
            name=item["name"],
            description=item["description"],
            status=item["status"],
            priority=item["priority"],
            start_date=item["start_date"],
            end_date=item["end_date"],
            tags=item["tags"],
            owner_id=owner.id,
        )
        db.add(project)
        db.flush()

        counter = 1
        for issue_type, priority, reporter, title, description, status, assignee, due_date in item["tasks"]:
            db.add(
                Task(
                    project_id=project.id,
                    issue_key=f"{project.key}-{counter}",
                    issue_type=issue_type,
                    title=title,
                    description=description,
                    status=status,
                    priority=priority,
                    reporter=reporter,
                    assignee=assignee,
                    due_date=due_date,
                )
            )
            counter += 1

    db.commit()
    ensure_jira_metadata(db)


def seed_initial_data(db: Session) -> None:
    user = ensure_default_user(db)
    seed_demo_projects(db, owner=user)
    ensure_jira_metadata(db)
