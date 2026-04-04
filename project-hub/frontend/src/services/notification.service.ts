// ============================================================================
// Notification Service
// ============================================================================

import { api } from "@/services/api";
import type { Notification } from "@/types";

export interface UnreadCountResponse {
  count: number;
}

export const notificationService = {
  /** Get all notifications for the current user */
  getAll(): Promise<Notification[]> {
    return api.get<Notification[]>("/api/notifications");
  },

  /** Mark a single notification as read */
  markAsRead(id: string): Promise<Notification> {
    return api.put<Notification>(`/api/notifications/${id}/read`, {});
  },

  /** Mark all notifications as read */
  markAllAsRead(): Promise<void> {
    return api.put<void>("/api/notifications/read-all", {});
  },

  /** Get the count of unread notifications */
  getUnreadCount(): Promise<UnreadCountResponse> {
    return api.get<UnreadCountResponse>("/api/notifications/unread-count");
  },
};
