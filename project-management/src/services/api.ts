/**
 * API Client
 *
 * Makes real HTTP fetch() calls to REST endpoints.
 * In development, MSW (Mock Service Worker) intercepts these calls
 * and serves data from an in-memory store (like Java/Spring RAM).
 *
 * When connecting to a real backend (e.g., Spring Boot):
 *   1. Remove MSW startup from main.tsx
 *   2. Change BASE_URL to your real server (e.g., "http://localhost:8080/api")
 *   3. Everything just works — no other code changes needed!
 *
 * Endpoints:
 *   GET    /api/projects                    → projects.getAll()
 *   GET    /api/projects/:id                → projects.getById(id)
 *   POST   /api/projects                    → projects.create(data)
 *   PUT    /api/projects/:id                → projects.update(id, data)
 *   DELETE /api/projects/:id                → projects.delete(id)
 *   POST   /api/projects/:id/tasks          → tasks.add(projectId, data)
 *   PUT    /api/projects/:id/tasks/:taskId  → tasks.update(projectId, taskId, data)
 *   DELETE /api/projects/:id/tasks/:taskId  → tasks.delete(projectId, taskId)
 *   GET    /api/search?q=query              → search(query)
 *   GET    /api/storage/info                → storage.getInfo()
 *   DELETE /api/storage/clear               → storage.clearAll()
 *   POST   /api/storage/reseed              → storage.reseed()
 *   GET    /api/storage/export              → storage.exportJSON()
 */

import type { Project, Task, ProjectFormData, TaskFormData } from "@/types/project"

// ── Base URL — change this when connecting to a real backend ──
const BASE_URL = "/api"

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

export interface SearchResult {
  type: "project" | "task"
  id: string
  projectId: string
  projectName: string
  title: string
  description: string
  status: string
}

// ─── HTTP helpers ────────────────────────────────────────────

async function get<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw { success: false, message: body.message ?? res.statusText, status: res.status } as ApiError
  }
  return res.json()
}

async function post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw { success: false, message: data.message ?? res.statusText, status: res.status } as ApiError
  }
  return res.json()
}

async function put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw { success: false, message: data.message ?? res.statusText, status: res.status } as ApiError
  }
  return res.json()
}

async function del<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE" })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw { success: false, message: data.message ?? res.statusText, status: res.status } as ApiError
  }
  return res.json()
}

// ─── Export as namespaced API (same interface as before) ─────

export const api = {
  projects: {
    getAll: () => get<Project[]>("/projects"),
    getById: (id: string) => get<Project>(`/projects/${id}`),
    create: (data: ProjectFormData) => post<Project>("/projects", data),
    update: (id: string, data: Partial<ProjectFormData>) =>
      put<Project>(`/projects/${id}`, data),
    delete: (id: string) => del<null>(`/projects/${id}`),
  },
  tasks: {
    add: (projectId: string, data: TaskFormData) =>
      post<Task>(`/projects/${projectId}/tasks`, data),
    update: (projectId: string, taskId: string, data: Partial<TaskFormData>) =>
      put<Task>(`/projects/${projectId}/tasks/${taskId}`, data),
    delete: (projectId: string, taskId: string) =>
      del<null>(`/projects/${projectId}/tasks/${taskId}`),
  },
  search: (query: string) =>
    get<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`),
  storage: {
    getInfo: () =>
      get<{ size: string; projectCount: number; taskCount: number }>("/storage/info"),
    clearAll: () => del<null>("/storage/clear"),
    reseed: () => post<null>("/storage/reseed"),
    exportJSON: () => get<string>("/storage/export"),
  },
} as const
