import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { useProjectContext } from "@/store/ProjectContext"
import { api } from "@/services/api"
import type { ProjectFormData, TaskFormData } from "@/types/project"

const PROJECTS_KEY = ["projects"] as const

/**
 * Main hook – fetches projects from the virtual API and syncs to Context.
 */
export function useProjects() {
  const { dispatch } = useProjectContext()
  const queryClient = useQueryClient()

  // ── Query ───────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async () => {
      const res = await api.projects.getAll()
      // keep Context in sync so all consumers see fresh data
      dispatch({ type: "SET_PROJECTS", payload: res.data })
      return res.data
    },
  })

  // helper: after any mutation invalidate query → re-fetches → Context updates
  const refresh = () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })

  // ── Create ──────────────────────────
  const createMutation = useMutation({
    mutationFn: (formData: ProjectFormData) => api.projects.create(formData),
    onSuccess: () => refresh(),
  })

  // ── Update ──────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectFormData> }) =>
      api.projects.update(id, data),
    onSuccess: () => refresh(),
  })

  // ── Delete ──────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => refresh(),
  })

  return {
    projects: data ?? [],
    isLoading,
    error,
    createProject: createMutation.mutate,
    updateProject: updateMutation.mutate,
    deleteProject: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refresh,
  }
}

/**
 * Task mutations for a specific project – used by ProjectDetail and Board/Backlog.
 */
export function useTasks(projectId: string) {
  const queryClient = useQueryClient()
  const { dispatch } = useProjectContext()

  const refresh = async () => {
    const res = await api.projects.getAll()
    dispatch({ type: "SET_PROJECTS", payload: res.data })
    queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
  }

  const addMutation = useMutation({
    mutationFn: (data: TaskFormData) => api.tasks.add(projectId, data),
    onSuccess: () => refresh(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<TaskFormData> }) =>
      api.tasks.update(projectId, taskId, data),
    onSuccess: () => refresh(),
  })

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => api.tasks.delete(projectId, taskId),
    onSuccess: () => refresh(),
  })

  return {
    addTask: addMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refresh,
  }
}

/**
 * Generic task operations without a fixed projectId – for Board/Backlog pages
 */
export function useTaskActions() {
  const queryClient = useQueryClient()
  const { dispatch } = useProjectContext()

  const refresh = async () => {
    const res = await api.projects.getAll()
    dispatch({ type: "SET_PROJECTS", payload: res.data })
    queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
  }

  const updateTask = async (projectId: string, taskId: string, data: Partial<TaskFormData>) => {
    await api.tasks.update(projectId, taskId, data)
    await refresh()
  }

  const deleteTask = async (projectId: string, taskId: string) => {
    await api.tasks.delete(projectId, taskId)
    await refresh()
  }

  const addTask = async (projectId: string, data: TaskFormData) => {
    await api.tasks.add(projectId, data)
    await refresh()
  }

  return { updateTask, deleteTask, addTask, refresh }
}
