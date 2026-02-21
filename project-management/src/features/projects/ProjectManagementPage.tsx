import { useState, useMemo, useCallback } from "react"
import { useProjects } from "@/hooks/useProjects"
import { useProjectContext } from "@/store/ProjectContext"
import { Button } from "@/components/ui/button"
import {
  StatsOverview,
  ProjectCard,
  ProjectFormDialog,
  ProjectDetail,
  ProjectFilters,
} from "./components"
import { Plus, FolderKanban } from "lucide-react"
import type { Project, ProjectFormData, ProjectStats, ProjectStatus, ProjectPriority } from "@/types/project"

export default function ProjectManagementPage() {
  const { state } = useProjectContext()
  const { createProject, updateProject, deleteProject, isCreating, isUpdating } = useProjects()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | "all">("all")

  const stats = useMemo<ProjectStats>(() => {
    const p = state.projects
    return {
      total: p.length,
      planning: p.filter((x) => x.status === "planning").length,
      inProgress: p.filter((x) => x.status === "in-progress").length,
      onHold: p.filter((x) => x.status === "on-hold").length,
      completed: p.filter((x) => x.status === "completed").length,
      cancelled: p.filter((x) => x.status === "cancelled").length,
    }
  }, [state.projects])

  const filteredProjects = useMemo(() => {
    return state.projects.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || p.status === statusFilter
      const matchPriority = priorityFilter === "all" || p.priority === priorityFilter
      return matchSearch && matchStatus && matchPriority
    })
  }, [state.projects, search, statusFilter, priorityFilter])

  const handleCreate = useCallback(
    (data: ProjectFormData) => {
      createProject(data)
    },
    [createProject]
  )

  const handleEdit = useCallback(
    (id: string) => {
      const project = state.projects.find((p) => p.id === id)
      if (project) {
        setEditingProject(project)
        setEditDialogOpen(true)
      }
    },
    [state.projects]
  )

  const handleUpdate = useCallback(
    (data: ProjectFormData) => {
      if (!editingProject) return
      updateProject({ id: editingProject.id, data })
      setEditingProject(null)
    },
    [editingProject, updateProject]
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteProject(id)
      if (viewingProject?.id === id) setViewingProject(null)
    },
    [deleteProject, viewingProject]
  )

  const handleView = useCallback(
    (id: string) => {
      const project = state.projects.find((p) => p.id === id)
      if (project) setViewingProject(project)
    },
    [state.projects]
  )

  const currentViewProject = useMemo(() => {
    if (!viewingProject) return null
    return state.projects.find((p) => p.id === viewingProject.id) ?? null
  }, [state.projects, viewingProject])

  if (currentViewProject) {
    return (
      <div className="min-h-screen bg-background p-6 max-w-7xl mx-auto">
        <ProjectDetail
          project={currentViewProject}
          onBack={() => setViewingProject(null)}
          onEdit={() => handleEdit(currentViewProject.id)}
        />
        <ProjectFormDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false)
            setEditingProject(null)
          }}
          onSubmit={handleUpdate}
          initialData={editingProject ?? undefined}
          title="Edit Project"
          isLoading={isUpdating}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderKanban className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">Manage and track all your projects</p>
          </div>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <StatsOverview stats={stats} />

      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderKanban className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {state.projects.length === 0
              ? "Create your first project to get started."
              : "Try adjusting your filters."}
          </p>
          {state.projects.length === 0 && (
            <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
        title="New Project"
        isLoading={isCreating}
      />

      <ProjectFormDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setEditingProject(null)
        }}
        onSubmit={handleUpdate}
        initialData={editingProject ?? undefined}
        title="Edit Project"
        isLoading={isUpdating}
      />
    </div>
  )
}
