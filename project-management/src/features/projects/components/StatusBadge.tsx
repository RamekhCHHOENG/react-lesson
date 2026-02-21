import type { ProjectStatus, ProjectPriority, TaskStatus } from "@/types/project"
import { PROJECT_STATUS_CONFIG, PROJECT_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from "@/config"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: ProjectStatus | TaskStatus
  type?: "project" | "task"
  className?: string
}

export function StatusBadge({ status, type = "project", className }: StatusBadgeProps) {
  const config = type === "task" ? TASK_STATUS_CONFIG : PROJECT_STATUS_CONFIG
  const cfg = config[status]
  if (!cfg) return null

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.color, className)}>
      {cfg.label}
    </span>
  )
}

interface PriorityBadgeProps {
  priority: ProjectPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const cfg = PROJECT_PRIORITY_CONFIG[priority]
  if (!cfg) return null

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.color, className)}>
      {cfg.label}
    </span>
  )
}
