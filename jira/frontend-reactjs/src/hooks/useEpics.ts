import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { Epic, EpicFormData } from "@/types"
import { toast } from "sonner"

export function useEpics(projectId: string | undefined) {
  return useQuery<Epic[]>({
    queryKey: ["epics", projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/epics`),
    enabled: !!projectId,
  })
}

export function useAllEpics() {
  return useQuery<Epic[]>({
    queryKey: ["epics"],
    queryFn: () => api.get(`/api/epics`),
  })
}

export function useCreateEpic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: EpicFormData }) =>
      api.post<Epic>(`/api/projects/${projectId}/epics`, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["epics", projectId] })
      queryClient.invalidateQueries({ queryKey: ["epics"] })
      toast.success("Epic created")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateEpic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, epicId, data }: { projectId: string; epicId: string; data: Partial<EpicFormData> }) =>
      api.put<Epic>(`/api/projects/${projectId}/epics/${epicId}`, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["epics", projectId] })
      queryClient.invalidateQueries({ queryKey: ["epics"] })
      toast.success("Epic updated")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteEpic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, epicId }: { projectId: string; epicId: string }) =>
      api.delete(`/api/projects/${projectId}/epics/${epicId}`),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["epics", projectId] })
      queryClient.invalidateQueries({ queryKey: ["epics"] })
      toast.success("Epic deleted")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useLinkTaskToEpic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, epicId, taskId }: { projectId: string; epicId: string; taskId: string }) =>
      api.post(`/api/projects/${projectId}/epics/${epicId}/tasks`, { task_id: taskId }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["epics", projectId] })
      queryClient.invalidateQueries({ queryKey: ["epics"] })
      toast.success("Task linked to epic")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUnlinkTaskFromEpic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, epicId, taskId }: { projectId: string; epicId: string; taskId: string }) =>
      api.delete(`/api/projects/${projectId}/epics/${epicId}/tasks/${taskId}`),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["epics", projectId] })
      queryClient.invalidateQueries({ queryKey: ["epics"] })
      toast.success("Task unlinked from epic")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
