/**
 * In-Memory Database with Persistence
 *
 * Stores all data in a module-level variable (application RAM),
 * just like a Java/Spring application stores data in its JVM heap.
 *
 * Persistence layer:
 * - After every mutation, data is synced to localStorage (like DB → disk flush).
 * - On startup, loads from localStorage if available (like DB recovery on restart).
 * - If no saved data exists, seeds with demo data.
 *
 * When switching to a real Spring Boot API:
 * - Remove this file entirely — persistence is handled by the real DB (PostgreSQL, etc.)
 */

import type { Project, Task, ProjectFormData, TaskFormData } from "@/types/project"
import { createSeedProjects } from "@/services/seedData"

const PERSIST_KEY = "projecthub_db"

// ── In-memory store (like Java static field or Spring @Repository bean) ──
let projects: Project[] = []

// ── ID generation ───────────────────────────────────────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

// ── Persistence helpers (like JPA flushing to disk) ─────────────
function persist(): void {
  try {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(projects))
  } catch {
    console.warn("[DB] Failed to persist data to localStorage")
  }
}

function loadPersistedData(): Project[] | null {
  try {
    const raw = localStorage.getItem(PERSIST_KEY)
    if (raw) {
      const data = JSON.parse(raw) as Project[]
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch { /* corrupted data — ignore */ }
  return null
}

// ── Initialize: recover from disk or seed fresh ─────────────────
function initialize(): void {
  const saved = loadPersistedData()
  if (saved) {
    projects = saved
    console.log(`[DB] Recovered ${projects.length} projects from storage`)
  } else {
    projects = createSeedProjects()
    persist()
    console.log(`[DB] Initialized with ${projects.length} seed projects`)
  }
}

// ── Search result type ──────────────────────────────────────────
export interface SearchResult {
  type: "project" | "task"
  id: string
  projectId: string
  projectName: string
  title: string
  description: string
  status: string
}

// ── Database operations (like Spring @Repository methods) ───────
export const db = {
  // ── Projects ────────────────────────────────────────────────
  projects: {
    findAll(): Project[] {
      return projects.map((p) => ({ ...p, tasks: [...p.tasks] }))
    },

    findById(id: string): Project | undefined {
      const project = projects.find((p) => p.id === id)
      if (!project) return undefined
      return { ...project, tasks: [...project.tasks] }
    },

    create(data: ProjectFormData): Project {
      const now = new Date().toISOString()
      const project: Project = {
        ...data,
        id: generateId(),
        tasks: [],
        createdAt: now,
        updatedAt: now,
      }
      projects.unshift(project)
      persist()
      return { ...project }
    },

    update(id: string, data: Partial<ProjectFormData>): Project | null {
      const index = projects.findIndex((p) => p.id === id)
      if (index === -1) return null
      projects[index] = {
        ...projects[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      persist()
      return { ...projects[index] }
    },

    delete(id: string): boolean {
      const before = projects.length
      projects = projects.filter((p) => p.id !== id)
      if (projects.length < before) persist()
      return projects.length < before
    },
  },

  // ── Tasks ───────────────────────────────────────────────────
  tasks: {
    add(projectId: string, data: TaskFormData): Task | null {
      const project = projects.find((p) => p.id === projectId)
      if (!project) return null
      const now = new Date().toISOString()
      const task: Task = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      project.tasks.push(task)
      project.updatedAt = now
      persist()
      return { ...task }
    },

    update(
      projectId: string,
      taskId: string,
      data: Partial<TaskFormData>
    ): Task | null {
      const project = projects.find((p) => p.id === projectId)
      if (!project) return null
      const tIndex = project.tasks.findIndex((t) => t.id === taskId)
      if (tIndex === -1) return null
      const now = new Date().toISOString()
      project.tasks[tIndex] = {
        ...project.tasks[tIndex],
        ...data,
        updatedAt: now,
      }
      project.updatedAt = now
      persist()
      return { ...project.tasks[tIndex] }
    },

    delete(projectId: string, taskId: string): boolean {
      const project = projects.find((p) => p.id === projectId)
      if (!project) return false
      const before = project.tasks.length
      project.tasks = project.tasks.filter((t) => t.id !== taskId)
      if (project.tasks.length < before) {
        project.updatedAt = new Date().toISOString()
        persist()
        return true
      }
      return false
    },
  },

  // ── Search ──────────────────────────────────────────────────
  search(query: string): SearchResult[] {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const results: SearchResult[] = []

    for (const project of projects) {
      if (
        project.name.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q)
      ) {
        results.push({
          type: "project",
          id: project.id,
          projectId: project.id,
          projectName: project.name,
          title: project.name,
          description: project.description,
          status: project.status,
        })
      }
      for (const task of project.tasks) {
        if (
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          task.assignee.toLowerCase().includes(q)
        ) {
          results.push({
            type: "task",
            id: task.id,
            projectId: project.id,
            projectName: project.name,
            title: task.title,
            description: task.description,
            status: task.status,
          })
        }
      }
    }
    return results.slice(0, 20)
  },

  // ── Storage / Admin ─────────────────────────────────────────
  storage: {
    getInfo() {
      const raw = JSON.stringify(projects)
      const bytes = new Blob([raw]).size
      let size: string
      if (bytes < 1024) size = `${bytes} B`
      else if (bytes < 1024 * 1024) size = `${(bytes / 1024).toFixed(1)} KB`
      else size = `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      return {
        size,
        projectCount: projects.length,
        taskCount: projects.reduce((sum, p) => sum + p.tasks.length, 0),
      }
    },

    clear() {
      projects = []
      persist()
      console.log("[DB] All data cleared")
    },

    reseed() {
      projects = createSeedProjects()
      persist()
      console.log(`[DB] Re-seeded with ${projects.length} projects`)
    },

    /** Export raw data for download */
    exportJSON(): string {
      return JSON.stringify(projects, null, 2)
    },
  },
} as const

// Auto-initialize on module load (like Spring @PostConstruct)
initialize()
