// ============================================================================
// Task Service
// ============================================================================

import { api } from "@/services/api";
import type { Task, TaskFormData, TaskSummary, LinkedIssue, LinkType } from "@/types";

export const taskService = {
  /** List tasks for a project */
  getByProject(projectId: string): Promise<Task[]> {
    return api.get<Task[]>(`/api/projects/${projectId}/tasks`);
  },

  /** Create a task within a project */
  create(projectId: string, data: TaskFormData): Promise<Task> {
    return api.post<Task>(`/api/projects/${projectId}/tasks`, data);
  },

  /** Update a task */
  update(
    projectId: string,
    taskId: string,
    data: Partial<TaskFormData>,
  ): Promise<Task> {
    return api.put<Task>(`/api/projects/${projectId}/tasks/${taskId}`, data);
  },

  /** Delete a task */
  delete(projectId: string, taskId: string): Promise<void> {
    return api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
  },

  /** Get subtasks of a task */
  getSubtasks(projectId: string, taskId: string): Promise<TaskSummary[]> {
    return api.get<TaskSummary[]>(`/api/projects/${projectId}/tasks/${taskId}/subtasks`);
  },

  /** Create a subtask */
  createSubtask(projectId: string, parentId: string, data: { title: string; assignee?: string }): Promise<Task> {
    return api.post<Task>(`/api/projects/${projectId}/tasks/${parentId}/subtasks`, data);
  },

  /** Get linked issues */
  getLinkedIssues(projectId: string, taskId: string): Promise<LinkedIssue[]> {
    return api.get<LinkedIssue[]>(`/api/projects/${projectId}/tasks/${taskId}/links`);
  },

  /** Link two issues */
  linkIssue(projectId: string, taskId: string, targetTaskId: string, linkType: LinkType): Promise<LinkedIssue> {
    return api.post<LinkedIssue>(`/api/projects/${projectId}/tasks/${taskId}/links`, {
      target_task_id: targetTaskId,
      link_type: linkType,
    });
  },

  /** Unlink an issue */
  unlinkIssue(projectId: string, taskId: string, linkId: string): Promise<void> {
    return api.delete(`/api/projects/${projectId}/tasks/${taskId}/links/${linkId}`);
  },

  /** Bulk update tasks */
  bulkUpdate(projectId: string, taskIds: string[], data: Partial<TaskFormData>): Promise<void> {
    return api.post(`/api/projects/${projectId}/tasks/bulk-update`, { task_ids: taskIds, ...data });
  },

  /** Bulk delete tasks */
  bulkDelete(projectId: string, taskIds: string[]): Promise<void> {
    return api.post(`/api/projects/${projectId}/tasks/bulk-delete`, { task_ids: taskIds });
  },
};
