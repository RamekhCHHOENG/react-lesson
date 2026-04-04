import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useProjects } from "@/hooks/useProjects"
import type { Project } from "@/types"

interface ProjectContextValue {
  projects: Project[]
  selectedProject: Project | null
  selectProject: (id: string | null) => void
  isLoading: boolean
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { data: projects = [], isLoading } = useProjects()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedProject = selectedId
    ? projects.find((p) => p.id === selectedId) ?? null
    : projects[0] ?? null

  const selectProject = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  return (
    <ProjectContext.Provider value={{ projects, selectedProject, selectProject, isLoading }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjectContext() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error("useProjectContext must be used inside <ProjectProvider>")
  return ctx
}
