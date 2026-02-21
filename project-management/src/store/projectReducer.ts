import type { Project } from "@/types/project"

/**
 * Simplified reducer – all mutations now go through the virtual API (api.ts)
 * and React Query hooks. The reducer just holds the latest snapshot.
 */
export type ProjectAction =
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "LOAD_PROJECTS" }

export interface ProjectState {
  projects: Project[]
}

export const initialProjectState: ProjectState = {
  projects: [],
}

export function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case "SET_PROJECTS": {
      return { ...state, projects: action.payload }
    }
    case "LOAD_PROJECTS": {
      // Sync read for initial load – the API query will take over afterward
      try {
        const raw = localStorage.getItem("projecthub_projects")
        if (raw) {
          return { ...state, projects: JSON.parse(raw) }
        }
      } catch { /* ignore */ }
      return state
    }
    default:
      return state
  }
}
