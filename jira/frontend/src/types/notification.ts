// ============================================================================
// Notification Types
// ============================================================================

// ── Enums / Union types ─────────────────────────────────────────────────────

export type NotificationType =
  | "task_assigned"
  | "comment_added"
  | "status_changed"
  | "mention"
  | "sprint_started"
  | "sprint_completed";

// ── Entity ──────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

// ── Request payloads ────────────────────────────────────────────────────────

export interface MarkNotificationReadRequest {
  notification_ids: string[];
}

// ── Query helpers ───────────────────────────────────────────────────────────

export interface NotificationQueryParams {
  page?: number;
  page_size?: number;
  is_read?: boolean;
  type?: NotificationType;
}
