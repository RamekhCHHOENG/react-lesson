// ============================================================================
// Report Service
// ============================================================================

import { api } from "@/services/api";

export interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number;
}

export interface VelocityDataPoint {
  sprint_name: string;
  completed_points: number;
  committed_points: number;
}

export interface CumulativeFlowDataPoint {
  date: string;
  todo: number;
  "in-progress": number;
  review: number;
  done: number;
}

export const reportService = {
  getBurndown(projectId: string, sprintId: string): Promise<BurndownDataPoint[]> {
    return api.get<BurndownDataPoint[]>(`/api/projects/${projectId}/sprints/${sprintId}/burndown`);
  },

  getVelocity(projectId: string): Promise<VelocityDataPoint[]> {
    return api.get<VelocityDataPoint[]>(`/api/projects/${projectId}/velocity`);
  },

  getCumulativeFlow(projectId: string): Promise<CumulativeFlowDataPoint[]> {
    return api.get<CumulativeFlowDataPoint[]>(`/api/projects/${projectId}/cumulative-flow`);
  },
};
