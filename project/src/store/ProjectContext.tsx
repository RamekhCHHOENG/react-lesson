import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import {
  projectReducer,
  initialProjectState,
  type ProjectState,
  type ProjectAction,
} from "@/store/projectReducer"

interface ProjectContextValue {
  state: ProjectState
  dispatch: React.Dispatch<ProjectAction>
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialProjectState)

  useEffect(() => {
    dispatch({ type: "LOAD_PROJECTS" })
  }, [])

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProjectContext must be used within ProjectProvider")
  }
  return context
}
