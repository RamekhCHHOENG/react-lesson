// ============================================================================
// Project Types
// ============================================================================

import type { User } from "./user";
import type { Task } from "./task";
import type { ProjectMember } from "./team";

// ── Enums / Union types ─────────────────────────────────────────────────────

export type ProjectStatus =
  | "planning"
  | "in-progress"
  | "on-hold"
  | "completed"
  | "cancelled";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

// ── Entity ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string;
  end_date: string | null;
  tags: string[];
  type?: string;
  owner_id: string | null;
  owner?: User;
  tasks: Task[];
  members?: ProjectMember[];
  created_at: string;
  updated_at: string;
}

/** Lightweight project reference (lists, breadcrumbs, pickers) */
export interface ProjectSummary {
  id: string;
  key: string;
  name: string;
  status: ProjectStatus;
  priority: ProjectPriority;
}

// ── Form / Request payloads ─────────────────────────────────────────────────

export interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string;
  end_date?: string;
  tags?: string[];
}

export interface CreateProjectRequest extends ProjectFormData {
  key: string;
}

export interface UpdateProjectRequest extends Partial<ProjectFormData> {
  owner_id?: string;
}

// ── Query helpers ───────────────────────────────────────────────────────────

export interface ProjectQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  owner_id?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}
