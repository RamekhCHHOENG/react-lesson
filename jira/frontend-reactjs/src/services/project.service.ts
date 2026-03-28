// ============================================================================
// Project Service
// ============================================================================

import { api } from "@/services/api";
import type { Project, ProjectFormData } from "@/types";

export const projectService = {
  /** List all projects */
  getAll(): Promise<Project[]> {
    return api.get<Project[]>("/api/projects");
  },

  /** Get a single project by ID */
  getById(id: string): Promise<Project> {
    return api.get<Project>(`/api/projects/${id}`);
  },

  /** Create a new project */
  create(data: ProjectFormData): Promise<Project> {
    return api.post<Project>("/api/projects", data);
  },

  /** Update an existing project */
  update(id: string, data: Partial<ProjectFormData>): Promise<Project> {
    return api.put<Project>(`/api/projects/${id}`, data);
  },

  /** Delete a project */
  delete(id: string): Promise<void> {
    return api.delete(`/api/projects/${id}`);
  },
};
