// ============================================================================
// Sprint Service
// ============================================================================

import { api } from "@/services/api";
import type { Sprint, SprintFormData } from "@/types";

export const sprintService = {
  /** List sprints for a project */
  getByProject(projectId: string): Promise<Sprint[]> {
    return api.get<Sprint[]>(`/api/projects/${projectId}/sprints`);
  },

  /** Create a sprint within a project */
  create(projectId: string, data: SprintFormData): Promise<Sprint> {
    return api.post<Sprint>(`/api/projects/${projectId}/sprints`, data);
  },

  /** Update a sprint */
  update(
    projectId: string,
    sprintId: string,
    data: Partial<SprintFormData>,
  ): Promise<Sprint> {
    return api.put<Sprint>(
      `/api/projects/${projectId}/sprints/${sprintId}`,
      data,
    );
  },

  /** Delete a sprint */
  delete(projectId: string, sprintId: string): Promise<void> {
    return api.delete(`/api/projects/${projectId}/sprints/${sprintId}`);
  },

  /** Start a sprint */
  start(projectId: string, sprintId: string): Promise<Sprint> {
    return api.post<Sprint>(
      `/api/projects/${projectId}/sprints/${sprintId}/start`,
    );
  },

  /** Complete a sprint */
  complete(projectId: string, sprintId: string): Promise<Sprint> {
    return api.post<Sprint>(
      `/api/projects/${projectId}/sprints/${sprintId}/complete`,
    );
  },
};
