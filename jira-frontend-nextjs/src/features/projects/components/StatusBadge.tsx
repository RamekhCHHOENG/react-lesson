import type { ProjectStatus, ProjectPriority, TaskStatus, IssuePriority, IssueType } from "@/types/project"
import { PROJECT_STATUS_CONFIG, PROJECT_PRIORITY_CONFIG, getIssuePriorityConfig, getIssueTypeConfig, getTaskStatusConfig } from "@/config"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
 status: ProjectStatus | TaskStatus
 type?: "project" | "task"
 className?: string
}

export function StatusBadge({ status, type = "project", className }: StatusBadgeProps) {
 const cfg = type === "task"
   ? getTaskStatusConfig(status)
   : PROJECT_STATUS_CONFIG[status]
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

interface IssuePriorityBadgeProps {
 priority: IssuePriority
 className?: string
}

export function IssuePriorityBadge({ priority, className }: IssuePriorityBadgeProps) {
 const cfg = getIssuePriorityConfig(priority)

 return (
 <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.color, className)}>
 {cfg.label}
 </span>
 )
}

interface IssueTypeBadgeProps {
 issueType: IssueType | string
 className?: string
}

export function IssueTypeBadge({ issueType, className }: IssueTypeBadgeProps) {
 const cfg = getIssueTypeConfig(issueType)

 return (
 <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cfg.color, className)}>
 <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/80 text-[10px] font-bold">
 {cfg.icon}
 </span>
 {cfg.label}
 </span>
 )
}
