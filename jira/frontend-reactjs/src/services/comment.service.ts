// ============================================================================
// Comment Service
// ============================================================================

import { api } from "@/services/api";
import type { Comment } from "@/types";

export interface CreateCommentData {
  content: string;
}

export interface UpdateCommentData {
  content: string;
}

export const commentService = {
  /** List comments for a task */
  getByTask(taskId: string): Promise<Comment[]> {
    return api.get<Comment[]>(`/api/tasks/${taskId}/comments`);
  },

  /** Create a comment on a task */
  create(taskId: string, data: CreateCommentData): Promise<Comment> {
    return api.post<Comment>(`/api/tasks/${taskId}/comments`, data);
  },

  /** Update a comment */
  update(commentId: string, data: UpdateCommentData): Promise<Comment> {
    return api.put<Comment>(`/api/comments/${commentId}`, data);
  },

  /** Delete a comment */
  delete(commentId: string): Promise<void> {
    return api.delete(`/api/comments/${commentId}`);
  },
};
