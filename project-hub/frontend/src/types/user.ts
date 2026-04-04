// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

/** Subset returned in compact contexts (dropdowns, mentions, assignee pickers) */
export interface UserSummary {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

/** Payload for updating the current user's profile */
export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

/** Payload for changing password */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
