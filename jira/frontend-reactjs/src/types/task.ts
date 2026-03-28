// ============================================================================
// Task Types
// ============================================================================

import type { Project } from "./project";
import type { Comment } from "./comment";
import type { ActivityLog } from "./activity";

// ── Enums / Union types ─────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type IssueType = "story" | "task" | "bug" | "epic" | "subtask";

export type LinkType = "blocks" | "is-blocked-by" | "relates-to" | "duplicates";

// ── Linked Issue ────────────────────────────────────────────────────────────

export interface LinkedIssue {
  id: string;
  link_type: LinkType;
  task: TaskSummary;
}

// ── Entity ──────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  project_id: string;
  issue_key: string;
  issue_type: IssueType;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  reporter: string;
  assignee: string;
  due_date: string | null;
  sprint_id: string | null;
  epic_id: string | null;
  story_points: number | null;
  labels: string[];
  parent_id: string | null;
  subtasks?: TaskSummary[];
  linked_issues?: LinkedIssue[];
  project?: Project;
  comments?: Comment[];
  activities?: ActivityLog[];
  created_at: string;
  updated_at: string;
}

/** Compact task reference (board cards, search results, linked issues) */
export interface TaskSummary {
  id: string;
  issue_key: string;
  issue_type: IssueType;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
}

// ── Form / Request payloads ─────────────────────────────────────────────────

export interface TaskFormData {
  title: string;
  description?: string;
  issue_type: IssueType;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  reporter?: string;
  due_date?: string;
  sprint_id?: string;
  epic_id?: string;
  parent_id?: string;
  story_points?: number;
  labels?: string[];
}

export type CreateTaskRequest = TaskFormData;

export type UpdateTaskRequest = Partial<TaskFormData>;

// ── Query helpers ───────────────────────────────────────────────────────────

export interface TaskQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  issue_type?: IssueType;
  assignee?: string;
  reporter?: string;
  sprint_id?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}
