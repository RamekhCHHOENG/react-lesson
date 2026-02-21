/**
 * Virtual API Service
 *
 * Simulates a REST API backed by localStorage.
 * All methods are async and return Promises, just like real HTTP calls.
 * This makes it trivial to swap in a real backend later.
 *
 * Endpoints simulated:
 *   GET    /api/projects          → getProjects()
 *   GET    /api/projects/:id      → getProject(id)
 *   POST   /api/projects          → createProject(data)
 *   PUT    /api/projects/:id      → updateProject(id, data)
 *   DELETE /api/projects/:id      → deleteProject(id)
 *   POST   /api/projects/:id/tasks          → addTask(projectId, data)
 *   PUT    /api/projects/:id/tasks/:taskId  → updateTask(projectId, taskId, data)
 *   DELETE /api/projects/:id/tasks/:taskId  → deleteTask(projectId, taskId)
 */

import type { Project, Task, ProjectFormData, TaskFormData } from "@/types/project"
import { APP_CONFIG } from "@/config"

const STORAGE_KEY = APP_CONFIG.storageKeys.projects

// Simulate network latency (ms) — set to 0 for instant, or 100-300 for realism
const SIMULATED_DELAY = 150

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/** Simulate async network delay */
function delay(ms: number = SIMULATED_DELAY): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Read raw data from localStorage */
function readStore(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Project[]
  } catch {
    return []
  }
}

/** Write data to localStorage */
function writeStore(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

// ─── API Response Types ──────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  success: false
  message: string
  status: number
}

function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { data, success: true, message }
}

function err(message: string, status = 400): ApiError {
  return { success: false, message, status }
}

// ─── Projects API ────────────────────────────────────────────

/** GET /api/projects */
async function getProjects(): Promise<ApiResponse<Project[]>> {
  await delay()
  return ok(readStore())
}

/** GET /api/projects/:id */
async function getProject(id: string): Promise<ApiResponse<Project> | ApiError> {
  await delay()
  const project = readStore().find((p) => p.id === id)
  if (!project) return err("Project not found", 404)
  return ok(project)
}

/** POST /api/projects */
async function createProject(
  data: ProjectFormData
): Promise<ApiResponse<Project>> {
  await delay()
  const now = new Date().toISOString()
  const project: Project = {
    ...data,
    id: generateId(),
    tasks: [],
    createdAt: now,
    updatedAt: now,
  }
  const all = readStore()
  all.unshift(project)
  writeStore(all)
  return ok(project, "Project created successfully")
}

/** PUT /api/projects/:id */
async function updateProject(
  id: string,
  data: Partial<ProjectFormData>
): Promise<ApiResponse<Project> | ApiError> {
  await delay()
  const all = readStore()
  const index = all.findIndex((p) => p.id === id)
  if (index === -1) return err("Project not found", 404)
  all[index] = { ...all[index], ...data, updatedAt: new Date().toISOString() }
  writeStore(all)
  return ok(all[index], "Project updated successfully")
}

/** DELETE /api/projects/:id */
async function deleteProject(id: string): Promise<ApiResponse<null> | ApiError> {
  await delay()
  const all = readStore()
  const filtered = all.filter((p) => p.id !== id)
  if (filtered.length === all.length) return err("Project not found", 404)
  writeStore(filtered)
  return ok(null, "Project deleted successfully")
}

// ─── Tasks API ───────────────────────────────────────────────

/** POST /api/projects/:id/tasks */
async function addTask(
  projectId: string,
  data: TaskFormData
): Promise<ApiResponse<Task> | ApiError> {
  await delay()
  const all = readStore()
  const index = all.findIndex((p) => p.id === projectId)
  if (index === -1) return err("Project not found", 404)
  const now = new Date().toISOString()
  const newTask: Task = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  all[index].tasks.push(newTask)
  all[index].updatedAt = now
  writeStore(all)
  return ok(newTask, "Task created successfully")
}

/** PUT /api/projects/:id/tasks/:taskId */
async function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<TaskFormData>
): Promise<ApiResponse<Task> | ApiError> {
  await delay()
  const all = readStore()
  const pIndex = all.findIndex((p) => p.id === projectId)
  if (pIndex === -1) return err("Project not found", 404)
  const tIndex = all[pIndex].tasks.findIndex((t) => t.id === taskId)
  if (tIndex === -1) return err("Task not found", 404)
  const now = new Date().toISOString()
  all[pIndex].tasks[tIndex] = {
    ...all[pIndex].tasks[tIndex],
    ...data,
    updatedAt: now,
  }
  all[pIndex].updatedAt = now
  writeStore(all)
  return ok(all[pIndex].tasks[tIndex], "Task updated successfully")
}

/** DELETE /api/projects/:id/tasks/:taskId */
async function deleteTask(
  projectId: string,
  taskId: string
): Promise<ApiResponse<null> | ApiError> {
  await delay()
  const all = readStore()
  const pIndex = all.findIndex((p) => p.id === projectId)
  if (pIndex === -1) return err("Project not found", 404)
  const before = all[pIndex].tasks.length
  all[pIndex].tasks = all[pIndex].tasks.filter((t) => t.id !== taskId)
  if (all[pIndex].tasks.length === before) return err("Task not found", 404)
  all[pIndex].updatedAt = new Date().toISOString()
  writeStore(all)
  return ok(null, "Task deleted successfully")
}

// ─── Search API ──────────────────────────────────────────────

export interface SearchResult {
  type: "project" | "task"
  id: string
  projectId: string
  projectName: string
  title: string
  description: string
  status: string
}

/** GET /api/search?q=query */
async function search(query: string): Promise<ApiResponse<SearchResult[]>> {
  await delay(80) // search should be fast
  if (!query.trim()) return ok([])
  const q = query.toLowerCase()
  const results: SearchResult[] = []
  const projects = readStore()

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
  return ok(results.slice(0, 20)) // limit results
}

// ─── Storage Utilities ───────────────────────────────────────

/** GET /api/storage/info */
async function getStorageInfo(): Promise<
  ApiResponse<{ size: string; projectCount: number; taskCount: number }>
> {
  await delay(50)
  const all = readStore()
  const raw = localStorage.getItem(STORAGE_KEY) ?? ""
  const bytes = new Blob([raw]).size
  let size: string
  if (bytes < 1024) size = `${bytes} B`
  else if (bytes < 1024 * 1024) size = `${(bytes / 1024).toFixed(1)} KB`
  else size = `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return ok({
    size,
    projectCount: all.length,
    taskCount: all.reduce((sum, p) => sum + p.tasks.length, 0),
  })
}

/** DELETE /api/storage/clear */
async function clearAllData(): Promise<ApiResponse<null>> {
  await delay()
  localStorage.removeItem(STORAGE_KEY)
  return ok(null, "All data cleared")
}

// ─── Export as namespaced API ────────────────────────────────

export const api = {
  projects: {
    getAll: getProjects,
    getById: getProject,
    create: createProject,
    update: updateProject,
    delete: deleteProject,
  },
  tasks: {
    add: addTask,
    update: updateTask,
    delete: deleteTask,
  },
  search,
  storage: {
    getInfo: getStorageInfo,
    clearAll: clearAllData,
  },
} as const
