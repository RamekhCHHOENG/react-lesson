export const APP_CONFIG = {
  appName: "ProjectHub",
  storageKeys: {
    projects: "projecthub_projects",
  },
} as const

interface StatusConfig { label: string; color: string; dotColor: string }

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
