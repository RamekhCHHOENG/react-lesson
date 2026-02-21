import type { Project } from "@/types/project"

/**
 * Simplified reducer – all mutations go through the API (fetch → MSW → in-memory DB)
 * and React Query hooks. The reducer just holds the latest snapshot.
 */
export type ProjectAction =
  | { type: "SET_PROJECTS"; payload: Project[] }

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
    default:
      return state
  }
}
