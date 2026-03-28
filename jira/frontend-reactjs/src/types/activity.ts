// ============================================================================
// Activity Log Types
// ============================================================================

// ── Enums / Union types ─────────────────────────────────────────────────────

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "commented"
  | "status_changed"
  | "assigned"
  | "moved";

export type ActivityEntityType = "project" | "task" | "sprint" | "comment";

// ── Entity ──────────────────────────────────────────────────────────────────

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  action: ActivityAction;
  entity_type: ActivityEntityType;
  entity_id: string;
  entity_title: string;
  project_id: string | null;
  project_name: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

// ── Backwards-compat alias (the original monolith exported "Activity") ──────

/** @deprecated Use `ActivityLog` instead */
export type Activity = ActivityLog;

// ── Query helpers ───────────────────────────────────────────────────────────

export interface ActivityQueryParams {
  page?: number;
  page_size?: number;
  entity_type?: ActivityEntityType;
  entity_id?: string;
  user_id?: string;
  action?: ActivityAction;
}
