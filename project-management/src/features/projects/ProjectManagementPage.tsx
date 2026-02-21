import { useState, useMemo, useCallback, useEffect } from "react"
import { useProjects } from "@/hooks/useProjects"
import { useProjectContext } from "@/store/ProjectContext"
import {
  StatsOverview,
  ProjectCard,
  ProjectFormDialog,
  ProjectDetail,
  ProjectFilters,
} from "./components"
import { Plus, FolderKanban } from "lucide-react"
import type { Project, ProjectFormData, ProjectStats, ProjectStatus, ProjectPriority } from "@/types/project"

interface Props {
  createTrigger?: number
}

export default function ProjectManagementPage({ createTrigger }: Props) {
  const { state } = useProjectContext()
  const { createProject, updateProject, deleteProject, isCreating, isUpdating } = useProjects()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | "all">("all")

  // Open create dialog from TopNav "Create" button
  useEffect(() => {
    if (createTrigger && createTrigger > 0) {
      setCreateDialogOpen(true)
    }
  }, [createTrigger])

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

  /* ── Detail view ── */
  if (currentViewProject) {
    return (
      <div className="h-full flex flex-col bg-[#FAFBFC]">
        <div className="flex-1 overflow-auto p-6">
          <ProjectDetail
            project={currentViewProject}
            onBack={() => setViewingProject(null)}
            onEdit={() => handleEdit(currentViewProject.id)}
          />
        </div>
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

  /* ── List view ── */
  return (
    <div className="h-full flex flex-col bg-[#FAFBFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#DFE1E6] shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-[#0052CC] to-[#6554C0]">
                <FolderKanban className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#172B4D]">Projects</h1>
                <p className="text-sm text-[#6B778C] mt-0.5">
                  {stats.total} project{stats.total !== 1 ? "s" : ""} &middot; {stats.completed} completed
                </p>
              </div>
            </div>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create project
            </button>
          </div>
        </div>
      </div>

      {/* Stats + Filters + Grid */}
      <div className="flex-1 overflow-auto p-6 space-y-5">
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderKanban className="h-12 w-12 text-[#DFE1E6] mb-4" />
            <h3 className="text-base font-medium text-[#172B4D]">No projects found</h3>
            <p className="text-sm text-[#6B778C] mt-1">
              {state.projects.length === 0
                ? "Create your first project to get started."
                : "Try adjusting your filters."}
            </p>
            {state.projects.length === 0 && (
              <button
                className="mt-4 flex items-center gap-1.5 h-8 px-3 rounded bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-medium transition-colors"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Create project
              </button>
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
      </div>

      <ProjectFormDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
        title="Create project"
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
        title="Edit project"
        isLoading={isUpdating}
      />
    </div>
  )
}
