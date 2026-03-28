// ============================================================================
// Common / Shared Types
// ============================================================================

/** Standard wrapper for single-item API responses */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/** Paginated list response returned by list endpoints */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/** Generic API error payload */
export interface ApiError {
  detail: string;
  status_code?: number;
  errors?: Record<string, string[]>;
}

/** Reusable option shape for <Select /> and similar controls */
export interface SelectOption<V = string> {
  label: string;
  value: V;
  icon?: string;
  disabled?: boolean;
}

/** Global search result item */
export interface SearchResult {
  type: "project" | "task";
  id: string;
  title: string;
  subtitle: string;
  project_key?: string;
  issue_key?: string;
}

/** Database / storage metrics shown in the admin dashboard */
export interface StorageInfo {
  data_size: string;
  project_count: number;
  task_count: number;
}

/** Sort direction used by table / list queries */
export type SortDirection = "asc" | "desc";

/** Common query parameters for list endpoints */
export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: SortDirection;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: import("./user").User;
}
