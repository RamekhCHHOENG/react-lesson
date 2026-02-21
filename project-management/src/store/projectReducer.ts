import type { Project, Task, ProjectFormData, TaskFormData } from "@/types/project"
import { projectStorage } from "@/services/projectStorage"

export type ProjectAction =
  | { type: "LOAD_PROJECTS" }
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "CREATE_PROJECT"; payload: ProjectFormData }
  | { type: "UPDATE_PROJECT"; payload: { id: string; data: Partial<ProjectFormData> } }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "ADD_TASK"; payload: { projectId: string; data: TaskFormData } }
  | { type: "UPDATE_TASK"; payload: { projectId: string; taskId: string; data: Partial<TaskFormData> } }
  | { type: "DELETE_TASK"; payload: { projectId: string; taskId: string } }

export interface ProjectState {
  projects: Project[]
}

export const initialProjectState: ProjectState = {
  projects: [],
}

export function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case "LOAD_PROJECTS": {
      return { ...state, projects: projectStorage.getAll() }
    }
    case "SET_PROJECTS": {
      return { ...state, projects: action.payload }
    }
    case "CREATE_PROJECT": {
      const created = projectStorage.create(action.payload)
      return { ...state, projects: [created, ...state.projects] }
    }
    case "UPDATE_PROJECT": {
      const updated = projectStorage.update(action.payload.id, action.payload.data)
      if (!updated) return state
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === action.payload.id ? updated : p)),
      }
    }
    case "DELETE_PROJECT": {
      projectStorage.remove(action.payload)
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
      }
    }
    case "ADD_TASK": {
      const newTask = projectStorage.addTask(action.payload.projectId, action.payload.data)
      if (!newTask) return state
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projectId ? { ...p, tasks: [...p.tasks, newTask] } : p
        ),
      }
    }
    case "UPDATE_TASK": {
      const updatedTask = projectStorage.updateTask(
        action.payload.projectId,
        action.payload.taskId,
        action.payload.data
      )
      if (!updatedTask) return state
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projectId
            ? {
                ...p,
                tasks: p.tasks.map((t: Task) => (t.id === action.payload.taskId ? updatedTask : t)),
              }
            : p
        ),
      }
    }
    case "DELETE_TASK": {
      projectStorage.removeTask(action.payload.projectId, action.payload.taskId)
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projectId
            ? { ...p, tasks: p.tasks.filter((t: Task) => t.id !== action.payload.taskId) }
            : p
        ),
      }
    }
    default:
      return state
  }
}
