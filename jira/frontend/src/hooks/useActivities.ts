import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { Activity } from "@/types"

export function useActivities(params?: { projectId?: string; taskId?: string; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.projectId) {
    searchParams.set("entity_type", "project")
    searchParams.set("entity_id", params.projectId)
  }
  if (params?.taskId) {
    searchParams.set("entity_type", "task")
    searchParams.set("entity_id", params.taskId)
  }

  const query = searchParams.toString()

  return useQuery<Activity[]>({
    queryKey: ["activities", params],
    queryFn: () => api.get(`/api/activity${query ? `?${query}` : ""}`),
  })
}

export function useProjectActivities(projectId: string | undefined) {
  return useQuery<Activity[]>({
    queryKey: ["activities", "project", projectId],
    queryFn: () => api.get(`/api/activity?entity_type=project&entity_id=${projectId}`),
    enabled: !!projectId,
  })
}

export function useTaskActivities(taskId: string | undefined) {
  return useQuery<Activity[]>({
    queryKey: ["activities", "task", taskId],
    queryFn: () => api.get(`/api/activity?entity_type=task&entity_id=${taskId}`),
    enabled: !!taskId,
  })
}
