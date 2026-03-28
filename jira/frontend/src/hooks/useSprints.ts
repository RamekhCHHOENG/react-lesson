import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { Sprint, SprintFormData } from "@/types"
import { toast } from "sonner"

export function useSprints(projectId: string | undefined) {
  return useQuery<Sprint[]>({
    queryKey: ["sprints", projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/sprints`),
    enabled: !!projectId,
  })
}

export function useAllSprints() {
  return useQuery<Sprint[]>({
    queryKey: ["all-sprints"],
    queryFn: async () => {
      const projects = await api.get<{ id: string }[]>("/api/projects")
      const all = await Promise.all(
        projects.map((p) => api.get<Sprint[]>(`/api/projects/${p.id}/sprints`))
      )
      return all.flat()
    },
  })
}

export function useCreateSprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: SprintFormData }) =>
      api.post<Sprint>(`/api/projects/${projectId}/sprints`, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] })
      toast.success("Sprint created")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateSprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, sprintId, data }: { projectId: string; sprintId: string; data: Partial<SprintFormData> }) =>
      api.put<Sprint>(`/api/projects/${projectId}/sprints/${sprintId}`, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] })
      toast.success("Sprint updated")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteSprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, sprintId }: { projectId: string; sprintId: string }) =>
      api.delete(`/api/projects/${projectId}/sprints/${sprintId}`),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] })
      toast.success("Sprint deleted")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useStartSprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, sprintId }: { projectId: string; sprintId: string }) =>
      api.post(`/api/projects/${projectId}/sprints/${sprintId}/start`),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] })
      toast.success("Sprint started")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useCompleteSprint() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, sprintId }: { projectId: string; sprintId: string }) =>
      api.post(`/api/projects/${projectId}/sprints/${sprintId}/complete`),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] })
      toast.success("Sprint completed")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
