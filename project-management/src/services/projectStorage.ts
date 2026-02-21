import type { Project, Task } from "@/types/project"
import { APP_CONFIG } from "@/config"

const STORAGE_KEY = APP_CONFIG.storageKeys.projects

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function getAll(): Project[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  return JSON.parse(raw) as Project[]
}

function save(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

function getById(id: string): Project | undefined {
  return getAll().find((p) => p.id === id)
}

function create(data: Omit<Project, "id" | "createdAt" | "updatedAt" | "tasks">): Project {
  const now = new Date().toISOString()
  const project: Project = {
    ...data,
    id: generateId(),
    tasks: [],
    createdAt: now,
    updatedAt: now,
  }
  const all = getAll()
  all.unshift(project)
  save(all)
  return project
}

function update(id: string, data: Partial<Omit<Project, "id" | "createdAt">>): Project | undefined {
  const all = getAll()
  const index = all.findIndex((p) => p.id === id)
  if (index === -1) return undefined
  all[index] = { ...all[index], ...data, updatedAt: new Date().toISOString() }
  save(all)
  return all[index]
}

function remove(id: string): boolean {
  const all = getAll()
  const filtered = all.filter((p) => p.id !== id)
  if (filtered.length === all.length) return false
  save(filtered)
  return true
}

function addTask(
  projectId: string,
  task: Omit<Task, "id" | "createdAt" | "updatedAt">
): Task | undefined {
  const all = getAll()
  const index = all.findIndex((p) => p.id === projectId)
  if (index === -1) return undefined
  const now = new Date().toISOString()
  const newTask: Task = {
    ...task,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  all[index].tasks.push(newTask)
  all[index].updatedAt = now
  save(all)
  return newTask
}

function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<Omit<Task, "id" | "createdAt">>
): Task | undefined {
  const all = getAll()
  const pIndex = all.findIndex((p) => p.id === projectId)
  if (pIndex === -1) return undefined
  const tIndex = all[pIndex].tasks.findIndex((t) => t.id === taskId)
  if (tIndex === -1) return undefined
  const now = new Date().toISOString()
  all[pIndex].tasks[tIndex] = { ...all[pIndex].tasks[tIndex], ...data, updatedAt: now }
  all[pIndex].updatedAt = now
  save(all)
  return all[pIndex].tasks[tIndex]
}

function removeTask(projectId: string, taskId: string): boolean {
  const all = getAll()
  const pIndex = all.findIndex((p) => p.id === projectId)
  if (pIndex === -1) return false
  const before = all[pIndex].tasks.length
  all[pIndex].tasks = all[pIndex].tasks.filter((t) => t.id !== taskId)
  if (all[pIndex].tasks.length === before) return false
  all[pIndex].updatedAt = new Date().toISOString()
  save(all)
  return true
}

export const projectStorage = {
  getAll,
  getById,
  create,
  update,
  remove,
  addTask,
  updateTask,
  removeTask,
}
