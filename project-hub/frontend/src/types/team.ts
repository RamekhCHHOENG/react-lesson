// ============================================================================
// Team / Project Member Types
// ============================================================================

import type { User } from "./user";

// ── Enums / Union types ─────────────────────────────────────────────────────

export type MemberRole = "admin" | "member" | "viewer";

// ── Entity ──────────────────────────────────────────────────────────────────

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  user?: User;
  role: MemberRole;
  created_at: string;
}

// ── Form / Request payloads ─────────────────────────────────────────────────

export interface AddMemberRequest {
  user_id: string;
  role: MemberRole;
}

export interface UpdateMemberRoleRequest {
  role: MemberRole;
}
