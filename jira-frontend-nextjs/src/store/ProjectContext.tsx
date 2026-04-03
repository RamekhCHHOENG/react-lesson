import { createContext, useContext, useReducer, type ReactNode } from "react"
import {
 projectReducer,
 initialProjectState,
 type ProjectState,
 type ProjectAction,
} from "./projectReducer"

interface ProjectContextValue {
 state: ProjectState
 dispatch: React.Dispatch<ProjectAction>
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
 const [state, dispatch] = useReducer(projectReducer, initialProjectState)

 // No more localStorage read — React Query fetches from the API on mount

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
