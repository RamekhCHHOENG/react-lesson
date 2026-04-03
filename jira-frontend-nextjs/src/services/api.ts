/**
 * API Client
 *
 * All frontend data now comes from the real FastAPI backend.
 */

import type { Project, Task, ProjectFormData, TaskFormData } from "@/types/project"

const BASE_URL = "/api"
const AUTH_TOKEN_KEY = "projecthub_access_token"

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
  issueKey?: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface AuthLoginResponse {
  accessToken: string
  tokenType: string
  user: AuthUser
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
}

// ─── HTTP helpers ────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const token = getAuthToken()
  const headers = new Headers(init?.headers)

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    if (res.status === 401) {
      clearAuthToken()
    }
    throw {
      success: false,
      message: body.detail ?? body.message ?? res.statusText,
      status: res.status,
    } as ApiError
  }

  return res.json()
}

async function get<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path)
}

async function post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  })
}

async function put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  return request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

async function del<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: "DELETE" })
}

// ─── Export as namespaced API (same interface as before) ─────

export const api = {
  auth: {
    login: (email: string, password: string) =>
      post<AuthLoginResponse>("/auth/login", { email, password }),
    me: () => get<AuthUser>("/auth/me"),
  },
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
