// ============================================================================
// Comment Types
// ============================================================================

import type { User } from "./user";

// ── Entity ──────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  user?: User;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

// ── Form / Request payloads ─────────────────────────────────────────────────

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
