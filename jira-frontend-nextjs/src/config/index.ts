export const APP_CONFIG = {
  appName: "ProjectHub",
  storageKeys: {
    projects: "projecthub_projects",
  },
} as const

interface StatusConfig { label: string; color: string; dotColor: string }

export interface IssueConfig extends StatusConfig { icon?: string }

export const PROJECT_STATUS_CONFIG: Record<string, StatusConfig> = {
  planning: { label: "Planning", color: "bg-blue-100 text-blue-800", dotColor: "#4C9AFF" },
  "in-progress": { label: "In Progress", color: "bg-amber-100 text-amber-800", dotColor: "#FFAB00" },
  "on-hold": { label: "On Hold", color: "bg-orange-100 text-orange-800", dotColor: "#FF8B00" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", dotColor: "#36B37E" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", dotColor: "#DE350B" },
}

export const PROJECT_PRIORITY_CONFIG: Record<string, StatusConfig> = {
  low: { label: "Low", color: "bg-slate-100 text-slate-800", dotColor: "#6B778C" },
  medium: { label: "Medium", color: "bg-sky-100 text-sky-800", dotColor: "#0065FF" },
  high: { label: "High", color: "bg-orange-100 text-orange-800", dotColor: "#FF8B00" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800", dotColor: "#DE350B" },
}

export const TASK_STATUS_CONFIG: Record<string, StatusConfig> = {
  todo: { label: "To Do", color: "bg-slate-100 text-slate-800", dotColor: "#6B778C" },
  "in-progress": { label: "In Progress", color: "bg-amber-100 text-amber-800", dotColor: "#FFAB00" },
  review: { label: "Review", color: "bg-purple-100 text-purple-800", dotColor: "#6554C0" },
  done: { label: "Done", color: "bg-green-100 text-green-800", dotColor: "#36B37E" },
}

export const ISSUE_TYPE_CONFIG: Record<string, IssueConfig> = {
  story: { label: "Story", color: "bg-emerald-100 text-emerald-800", dotColor: "#22C55E", icon: "S" },
  task: { label: "Task", color: "bg-sky-100 text-sky-800", dotColor: "#0EA5E9", icon: "T" },
  bug: { label: "Bug", color: "bg-rose-100 text-rose-800", dotColor: "#F43F5E", icon: "B" },
  epic: { label: "Epic", color: "bg-violet-100 text-violet-800", dotColor: "#8B5CF6", icon: "E" },
}

export const ISSUE_PRIORITY_CONFIG: Record<string, StatusConfig> = {
  low: { label: "Low", color: "bg-slate-100 text-slate-800", dotColor: "#6B778C" },
  medium: { label: "Medium", color: "bg-sky-100 text-sky-800", dotColor: "#0065FF" },
  high: { label: "High", color: "bg-orange-100 text-orange-800", dotColor: "#FF8B00" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800", dotColor: "#DE350B" },
}

/** Resolve status config for default AND custom board column statuses. */
export function getTaskStatusConfig(status: string): StatusConfig {
  if (TASK_STATUS_CONFIG[status]) return TASK_STATUS_CONFIG[status]

  // Check custom board columns from localStorage
  try {
    const stored = localStorage.getItem("projecthub_board_columns")
    if (stored) {
      const columns = JSON.parse(stored) as Array<{ key: string; label: string; headerColor: string }>
      const col = columns.find((c) => c.key === status)
      if (col) {
        return { label: col.label, color: "bg-slate-100 text-slate-800", dotColor: col.headerColor }
      }
    }
  } catch { /* ignore */ }

  // Fallback: humanise the key
  return {
    label: status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    color: "bg-slate-100 text-slate-800",
    dotColor: "#6B778C",
  }
}

export function getIssueTypeConfig(type: string): IssueConfig {
  return ISSUE_TYPE_CONFIG[type] ?? {
    label: type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    color: "bg-slate-100 text-slate-800",
    dotColor: "#6B778C",
    icon: type.slice(0, 1).toUpperCase(),
  }
}

export function getIssuePriorityConfig(priority: string): StatusConfig {
  return ISSUE_PRIORITY_CONFIG[priority] ?? ISSUE_PRIORITY_CONFIG.medium
}
