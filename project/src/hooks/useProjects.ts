import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectStorage } from "@/services/projectStorage"
import { useProjectContext } from "@/store/ProjectContext"
import type { ProjectFormData, TaskFormData } from "@/types/project"

const QUERY_KEY = ["projects"] as const

export function useProjects() {
  const { dispatch } = useProjectContext()

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => projectStorage.getAll(),
    staleTime: 0,
  })

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: ProjectFormData) => Promise.resolve(projectStorage.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      dispatch({ type: "LOAD_PROJECTS" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectFormData> }) =>
      Promise.resolve(projectStorage.update(id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      dispatch({ type: "LOAD_PROJECTS" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => Promise.resolve(projectStorage.remove(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      dispatch({ type: "LOAD_PROJECTS" })
    },
  })

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    createProject: createMutation.mutate,
    updateProject: updateMutation.mutate,
    deleteProject: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useTasks(projectId: string) {
  const { dispatch } = useProjectContext()
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: (data: TaskFormData) => Promise.resolve(projectStorage.addTask(projectId, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      dispatch({ type: "LOAD_PROJECTS" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<TaskFormData> }) =>
      Promise.resolve(projectStorage.updateTask(projectId, taskId, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      dispatch({ type: "LOAD_PROJECTS" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => Promise.resolve(projectStorage.removeTask(projectId, taskId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      dispatch({ type: "LOAD_PROJECTS" })
    },
  })

  return {
    addTask: addMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
