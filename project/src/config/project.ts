export const APP_CONFIG = {
  appName: "ProjectHub",
  storageKeys: {
    projects: "projecthub_projects",
  },
  defaultPageSize: 10,
  dateFormat: "YYYY-MM-DD",
} as const

export const PROJECT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  planning: { label: "Planning", color: "bg-blue-100 text-blue-800" },
  "in-progress": { label: "In Progress", color: "bg-amber-100 text-amber-800" },
  "on-hold": { label: "On Hold", color: "bg-orange-100 text-orange-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
}

export const PROJECT_PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-slate-100 text-slate-800" },
  medium: { label: "Medium", color: "bg-sky-100 text-sky-800" },
  high: { label: "High", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800" },
}

export const TASK_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  todo: { label: "To Do", color: "bg-slate-100 text-slate-800" },
  "in-progress": { label: "In Progress", color: "bg-amber-100 text-amber-800" },
  review: { label: "Review", color: "bg-purple-100 text-purple-800" },
  done: { label: "Done", color: "bg-green-100 text-green-800" },
}
