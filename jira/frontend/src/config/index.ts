// ============================================================================
// Application Configuration Constants
// ============================================================================

import type {
  IssueType,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  ProjectPriority,
  SprintStatus,
  MemberRole,
  ActivityAction,
  EpicStatus,
} from "@/types";

// ── Issue Type ──────────────────────────────────────────────────────────────

export const ISSUE_TYPE_CONFIG: Record<
  IssueType,
  { label: string; icon: string; color: string; bgColor: string; hex: string }
> = {
  epic: { label: "Epic", icon: "Zap", color: "text-purple-700", bgColor: "bg-purple-100", hex: "#a062ff" },
  story: { label: "Story", icon: "BookOpen", color: "text-green-700", bgColor: "bg-green-100", hex: "#36b37e" },
  task: { label: "Task", icon: "CheckSquare", color: "text-blue-700", bgColor: "bg-blue-100", hex: "#4c9aff" },
  bug: { label: "Bug", icon: "Bug", color: "text-red-700", bgColor: "bg-red-100", hex: "#ff5630" },
  subtask: { label: "Subtask", icon: "GitBranch", color: "text-cyan-700", bgColor: "bg-cyan-100", hex: "#00b8d9" },
};

// ── Task Status ─────────────────────────────────────────────────────────────

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string; hex: string }
> = {
  todo: { label: "To Do", color: "text-slate-600", bgColor: "bg-slate-100", hex: "#42526E" },
  "in-progress": { label: "In Progress", color: "text-blue-700", bgColor: "bg-blue-100", hex: "#0052CC" },
  review: { label: "In Review", color: "text-yellow-700", bgColor: "bg-yellow-100", hex: "#FF8B00" },
  done: { label: "Done", color: "text-green-700", bgColor: "bg-green-100", hex: "#36B37E" },
};

// ── Task Priority ───────────────────────────────────────────────────────────

export const TASK_PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bgColor: string; icon: string; hex: string }
> = {
  low: { label: "Low", color: "text-green-700", bgColor: "bg-green-100", icon: "ArrowDown", hex: "#36B37E" },
  medium: { label: "Medium", color: "text-yellow-700", bgColor: "bg-yellow-100", icon: "ArrowRight", hex: "#FFAB00" },
  high: { label: "High", color: "text-orange-700", bgColor: "bg-orange-100", icon: "ArrowUp", hex: "#FF5630" },
  urgent: { label: "Urgent", color: "text-red-700", bgColor: "bg-red-100", icon: "ChevronsUp", hex: "#BF2600" },
};

// ── Project Status ──────────────────────────────────────────────────────────

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bgColor: string }
> = {
  planning: { label: "Planning", color: "text-gray-700", bgColor: "bg-gray-100" },
  "in-progress": { label: "In Progress", color: "text-blue-700", bgColor: "bg-blue-100" },
  "on-hold": { label: "On Hold", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  completed: { label: "Completed", color: "text-green-700", bgColor: "bg-green-100" },
  cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-100" },
};

// ── Project Priority ────────────────────────────────────────────────────────

export const PROJECT_PRIORITY_CONFIG: Record<
  ProjectPriority,
  { label: string; color: string; bgColor: string }
> = {
  low: { label: "Low", color: "text-green-700", bgColor: "bg-green-100" },
  medium: { label: "Medium", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  high: { label: "High", color: "text-orange-700", bgColor: "bg-orange-100" },
  urgent: { label: "Urgent", color: "text-red-700", bgColor: "bg-red-100" },
};

// ── Sprint Status ───────────────────────────────────────────────────────────

export const SPRINT_STATUS_CONFIG: Record<
  SprintStatus,
  { label: string; color: string; bgColor: string }
> = {
  planning: { label: "Planning", color: "text-gray-700", bgColor: "bg-gray-100" },
  active: { label: "Active", color: "text-blue-700", bgColor: "bg-blue-100" },
  completed: { label: "Completed", color: "text-green-700", bgColor: "bg-green-100" },
};

// ── Member Role ─────────────────────────────────────────────────────────────

export const MEMBER_ROLE_CONFIG: Record<
  MemberRole,
  { label: string; color: string; bgColor: string }
> = {
  admin: { label: "Admin", color: "text-purple-700", bgColor: "bg-purple-100" },
  member: { label: "Member", color: "text-blue-700", bgColor: "bg-blue-100" },
  viewer: { label: "Viewer", color: "text-gray-700", bgColor: "bg-gray-100" },
};

// ── Activity Actions ────────────────────────────────────────────────────────

export const ACTIVITY_ACTION_CONFIG: Record<
  ActivityAction,
  { label: string; icon: string }
> = {
  created: { label: "created", icon: "Plus" },
  updated: { label: "updated", icon: "Pencil" },
  deleted: { label: "deleted", icon: "Trash2" },
  commented: { label: "commented on", icon: "MessageSquare" },
  status_changed: { label: "changed status of", icon: "RefreshCw" },
  assigned: { label: "assigned", icon: "UserPlus" },
  moved: { label: "moved", icon: "ArrowUpRight" },
};

// ── Board Column Defaults ───────────────────────────────────────────────────

// ── Epic Status ─────────────────────────────────────────────────────────────

export const EPIC_STATUS_CONFIG: Record<
  EpicStatus,
  { label: string; color: string; bgColor: string }
> = {
  todo: { label: "To Do", color: "text-gray-700", bgColor: "bg-gray-100" },
  "in-progress": { label: "In Progress", color: "text-blue-700", bgColor: "bg-blue-100" },
  done: { label: "Done", color: "text-green-700", bgColor: "bg-green-100" },
};

// ── Board Column Defaults ───────────────────────────────────────────────────

export const DEFAULT_BOARD_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "TO DO" },
  { id: "in-progress", title: "IN PROGRESS" },
  { id: "review", title: "IN REVIEW" },
  { id: "done", title: "DONE" },
];
