import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { useProjectContext } from "@/store/ProjectContext"
import { api } from "@/services/api"
import { toast } from "sonner"
import type { Project, ProjectFormData, TaskFormData } from "@/types/project"

const PROJECTS_KEY = ["projects"] as const

/* ─── helpers ──────────────────────────────────────────────────── */

/** Read the current projects cache (or empty array). */
function readCache(qc: ReturnType<typeof useQueryClient>): Project[] {
  return qc.getQueryData<Project[]>(PROJECTS_KEY) ?? []
}

/** Write projects to both react-query cache AND ProjectContext. */
function writeCache(
  qc: ReturnType<typeof useQueryClient>,
  dispatch: ReturnType<typeof useProjectContext>["dispatch"],
  projects: Project[],
) {
  qc.setQueryData(PROJECTS_KEY, projects)
  dispatch({ type: "SET_PROJECTS", payload: projects })
}

/* ═══════════════════════════════════════════════════════════════ */
/*  useProjects – main hook with optimistic create / update / del */
/* ═══════════════════════════════════════════════════════════════ */

export function useProjects() {
  const { dispatch } = useProjectContext()
  const qc = useQueryClient()

  // ── Query ───────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async () => {
      const res = await api.projects.getAll()
      dispatch({ type: "SET_PROJECTS", payload: res.data })
      return res.data
    },
  })

  // ── Create (optimistic) ─────────────
  const createMutation = useMutation({
    mutationFn: (formData: ProjectFormData) => api.projects.create(formData),

    onMutate: async (formData) => {
      await qc.cancelQueries({ queryKey: PROJECTS_KEY })
      const previous = readCache(qc)

      const tempProject: Project = {
        id: `temp-${Date.now()}`,
        ...formData,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      writeCache(qc, dispatch, [...previous, tempProject])
      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) writeCache(qc, dispatch, ctx.previous)
      toast.error("Failed to create project")
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY })
    },
  })

  // ── Update (optimistic) ─────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectFormData> }) =>
      api.projects.update(id, data),

    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: PROJECTS_KEY })
      const previous = readCache(qc)

      const updated = previous.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p,
      )
      writeCache(qc, dispatch, updated)
      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) writeCache(qc, dispatch, ctx.previous)
      toast.error("Failed to update project")
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY })
    },
  })

  // ── Delete (optimistic) ─────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.projects.delete(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: PROJECTS_KEY })
      const previous = readCache(qc)

      writeCache(qc, dispatch, previous.filter((p) => p.id !== id))
      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) writeCache(qc, dispatch, ctx.previous)
      toast.error("Failed to delete project")
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY })
    },
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
    refresh: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  }
}

/* ═══════════════════════════════════════════════════════════════ */
/*  useTasks – task mutations for a specific project (optimistic) */
/* ═══════════════════════════════════════════════════════════════ */

export function useTasks(projectId: string) {
  const { dispatch } = useProjectContext()
  const qc = useQueryClient()

  // ── Add task (optimistic) ───────────
  const addMutation = useMutation({
    mutationFn: (data: TaskFormData) => api.tasks.add(projectId, data),

    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: PROJECTS_KEY })
      const previous = readCache(qc)

      const tempTask = {
        id: `temp-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const updated = previous.map((p) =>
        p.id === projectId ? { ...p, tasks: [...p.tasks, tempTask] } : p,
      )
      writeCache(qc, dispatch, updated)
      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) writeCache(qc, dispatch, ctx.previous)
      toast.error("Failed to create task")
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY })
    },
  })

  // ── Update task (optimistic) ────────
  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<TaskFormData> }) =>
      api.tasks.update(projectId, taskId, data),

    onMutate: async ({ taskId, data }) => {
      await qc.cancelQueries({ queryKey: PROJECTS_KEY })
      const previous = readCache(qc)

      const updated = previous.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, ...data, updatedAt: new Date().toISOString() }
                  : t,
              ),
            }
          : p,
      )
      writeCache(qc, dispatch, updated)
      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) writeCache(qc, dispatch, ctx.previous)
      toast.error("Failed to update task")
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY })
    },
  })

  // ── Delete task (optimistic) ────────
  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => api.tasks.delete(projectId, taskId),

    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: PROJECTS_KEY })
      const previous = readCache(qc)

      const updated = previous.map((p) =>
        p.id === projectId
          ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
          : p,
      )
      writeCache(qc, dispatch, updated)
      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) writeCache(qc, dispatch, ctx.previous)
      toast.error("Failed to delete task")
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY })
    },
  })

  return {
    addTask: addMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refresh: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  }
}

/* ═══════════════════════════════════════════════════════════════ */
/*  useTaskActions – generic task ops for Board / Backlog pages   */
/*  (optimistic – UI updates instantly, rolls back on error)      */
/* ═══════════════════════════════════════════════════════════════ */

export function useTaskActions() {
  const { dispatch } = useProjectContext()
  const qc = useQueryClient()

  /** Snapshot → mutate cache → call API → rollback on error → always refetch */
  const optimistic = async (
    apply: (projects: Project[]) => Project[],
    apiCall: () => Promise<unknown>,
    errorMsg: string,
  ) => {
    await qc.cancelQueries({ queryKey: PROJECTS_KEY })
    const previous = readCache(qc)

    // instant UI update
    writeCache(qc, dispatch, apply(previous))

    try {
      await apiCall()
    } catch {
      // revert
      writeCache(qc, dispatch, previous)
      toast.error(errorMsg)
    }

    // always sync with server truth
    qc.invalidateQueries({ queryKey: PROJECTS_KEY })
  }

  const updateTask = (projectId: string, taskId: string, data: Partial<TaskFormData>) =>
    optimistic(
      (projects) =>
        projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === taskId
                    ? { ...t, ...data, updatedAt: new Date().toISOString() }
                    : t,
                ),
              }
            : p,
        ),
      () => api.tasks.update(projectId, taskId, data),
      "Failed to update issue",
    )

  const deleteTask = (projectId: string, taskId: string) =>
    optimistic(
      (projects) =>
        projects.map((p) =>
          p.id === projectId
            ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
            : p,
        ),
      () => api.tasks.delete(projectId, taskId),
      "Failed to delete issue",
    )

  const addTask = (projectId: string, data: TaskFormData) =>
    optimistic(
      (projects) =>
        projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: [
                  ...p.tasks,
                  {
                    id: `temp-${Date.now()}`,
                    ...data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ],
              }
            : p,
        ),
      () => api.tasks.add(projectId, data),
      "Failed to create issue",
    )

  return {
    updateTask,
    deleteTask,
    addTask,
    refresh: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  }
}
