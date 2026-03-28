// ============================================================================
// Internal Mock Implementation (Fallback when running without backend)
// ============================================================================

import type { Task, Project } from "@/types";

const defaultTaskFields = {
  assignee: "user-1",
  reporter: "user-1",
  due_date: null,
  sprint_id: null,
  epic_id: null,
  story_points: null,
  labels: [],
  parent_id: null,
};

// Seed Database
const INITIAL_DB = {
  projects: [
    {
      id: "proj-1",
      name: "My Software Team",
      key: "DEV",
      description: "Software dev team project",
      owner_id: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: [
        {
          id: "task-1",
          project_id: "proj-1",
          title: "Implement authentication",
          description: "Add JWT based auth",
          issue_type: "story",
          status: "in-progress",
          priority: "high",
          issue_key: "DEV-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...defaultTaskFields
        },
        {
          id: "task-2",
          project_id: "proj-1",
          title: "Setup CI/CD pipeline",
          description: "Github actions for auto deploy",
          issue_type: "task",
          status: "todo",
          priority: "medium",
          issue_key: "DEV-2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...defaultTaskFields
        },
        {
          id: "task-3",
          project_id: "proj-1",
          title: "Fix responsive layout bugs",
          description: "Mobile views are broken on dashboard",
          issue_type: "bug",
          status: "review",
          priority: "urgent",
          issue_key: "DEV-3",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...defaultTaskFields
        },
        {
          id: "task-4",
          project_id: "proj-1",
          title: "Design System Migration",
          description: "Migrate fully to tailwind v4",
          issue_type: "epic",
          status: "done",
          priority: "high",
          issue_key: "DEV-4",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...defaultTaskFields
        }
      ] as Task[]
    }
  ] as Project[],
  auth: {
    user: {
      id: "user-1",
      email: "admin@example.com",
      full_name: "Admin User",
      role: "admin",
      is_active: true
    },
    token: "mock-jwt-token-123"
  }
};

type DbSchema = typeof INITIAL_DB;

class MockDb {
  private db: DbSchema;

  constructor() {
    const stored = localStorage.getItem("jira-mock-db-v2");
    if (stored) {
      try {
        this.db = JSON.parse(stored);
      } catch (e) {
        this.db = structuredClone(INITIAL_DB);
      }
    } else {
      this.db = structuredClone(INITIAL_DB);
      this.save();
    }
  }

  private save() {
    localStorage.setItem("jira-mock-db-v2", JSON.stringify(this.db));
  }

  reset() {
    this.db = structuredClone(INITIAL_DB);
    this.save();
  }

  getAllProjects() {
    return this.db.projects;
  }

  getProject(id: string) {
    return this.db.projects.find((p) => p.id === id) || null;
  }

  createTask(projectId: string, data: any) {
    const project = this.db.projects.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found");

    const newTask: Task = {
      ...defaultTaskFields,
      ...data,
      id: crypto.randomUUID(),
      project_id: projectId,
      issue_key: `${project.key}-${(project.tasks.length || 0) + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    project.tasks.push(newTask);
    this.save();
    return newTask;
  }

  updateTask(projectId: string, taskId: string, data: any) {
    const project = this.db.projects.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found");

    const taskIndex = project.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) throw new Error("Task not found");

    project.tasks[taskIndex] = {
      ...project.tasks[taskIndex],
      ...data,
      updated_at: new Date().toISOString()
    };
    
    this.save();
    return project.tasks[taskIndex];
  }
  
  deleteTask(projectId: string, taskId: string) {
    const project = this.db.projects.find((p) => p.id === projectId);
    if (!project) throw new Error("Project not found");

    project.tasks = project.tasks.filter((t) => t.id !== taskId);
    this.save();
  }

  getUser() {
    return this.db.auth.user;
  }
  
  login() {
    return {
      access_token: this.db.auth.token,
      token_type: "bearer"
    };
  }
}

export const mockDb = new MockDb();
