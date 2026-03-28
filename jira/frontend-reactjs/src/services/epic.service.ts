// ============================================================================
// Epic Service
// ============================================================================

import { api } from "@/services/api";
import type { Epic, EpicFormData } from "@/types";

export const epicService = {
  getByProject(projectId: string): Promise<Epic[]> {
    return api.get<Epic[]>(`/api/projects/${projectId}/epics`);
  },

  getAll(): Promise<Epic[]> {
    return api.get<Epic[]>(`/api/epics`);
  },

  getById(projectId: string, epicId: string): Promise<Epic> {
    return api.get<Epic>(`/api/projects/${projectId}/epics/${epicId}`);
  },

  create(projectId: string, data: EpicFormData): Promise<Epic> {
    return api.post<Epic>(`/api/projects/${projectId}/epics`, data);
  },

  update(projectId: string, epicId: string, data: Partial<EpicFormData>): Promise<Epic> {
    return api.put<Epic>(`/api/projects/${projectId}/epics/${epicId}`, data);
  },

  delete(projectId: string, epicId: string): Promise<void> {
    return api.delete(`/api/projects/${projectId}/epics/${epicId}`);
  },

  linkTask(projectId: string, epicId: string, taskId: string): Promise<void> {
    return api.post(`/api/projects/${projectId}/epics/${epicId}/tasks`, { task_id: taskId });
  },

  unlinkTask(projectId: string, epicId: string, taskId: string): Promise<void> {
    return api.delete(`/api/projects/${projectId}/epics/${epicId}/tasks/${taskId}`);
  },
};
