import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import type {
  BurndownDataPoint,
  VelocityDataPoint,
  CumulativeFlowDataPoint,
} from "@/services/report.service"

export function useBurndown(projectId: string | undefined, sprintId: string | undefined) {
  return useQuery<BurndownDataPoint[]>({
    queryKey: ["burndown", projectId, sprintId],
    queryFn: () => api.get(`/api/projects/${projectId}/sprints/${sprintId}/burndown`),
    enabled: !!projectId && !!sprintId,
  })
}

export function useVelocity(projectId: string | undefined) {
  return useQuery<VelocityDataPoint[]>({
    queryKey: ["velocity", projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/velocity`),
    enabled: !!projectId,
  })
}

export function useCumulativeFlow(projectId: string | undefined) {
  return useQuery<CumulativeFlowDataPoint[]>({
    queryKey: ["cumulative-flow", projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/cumulative-flow`),
    enabled: !!projectId,
  })
}
