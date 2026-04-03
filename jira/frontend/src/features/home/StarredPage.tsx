import { useState, useMemo, useCallback } from "react"
import { Star, CheckSquare2, Bug, BookOpen, Zap, GitBranch, ArrowUp, ArrowDown, ArrowRight, ChevronsUp, StarOff } from "lucide-react"
import { useProjectContext } from "@/store/project-context"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import { timeAgo, cn } from "@/lib/utils"
import type { Task } from "@/types"
import { toast } from "sonner"

const ISSUE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bug: Bug, story: BookOpen, task: CheckSquare2, epic: Zap, subtask: GitBranch,
}
const PRIORITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  urgent: ChevronsUp, high: ArrowUp, medium: ArrowRight, low: ArrowDown,
}

export default function StarredPage() {
  const { projects, isLoading } = useProjectContext()
  const [starredIds, setStarredIds] = useLocalStorage<string[]>("jira-starred-items", [])

  const allTasks = useMemo(() =>
    projects.flatMap((p) => p.tasks.map((t) => ({ ...t, projectName: p.name, projectKey: p.key }))),
    [projects],
  )

  const starredTasks = useMemo(() =>
    allTasks.filter((t) => starredIds.includes(t.id)).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [allTasks, starredIds],
  )

  const toggleStar = useCallback((id: string) => {
    setStarredIds((prev) => {
      if (prev.includes(id)) {
        toast.success("Removed from starred")
        return prev.filter((i) => i !== id)
      }
      toast.success("Added to starred")
      return [...prev, id]
    })
  }, [setStarredIds])

  if (isLoading) {
    return (
      <div className="px-8 py-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}
      </div>
    )
  }

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
          Starred
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Your bookmarked work items</p>
      </div>

      {starredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/50 rounded-xl">
          <StarOff className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">No starred items yet</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Star tasks from the board or backlog to find them quickly here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {starredTasks.map((item) => (
            <StarredItem key={item.id} item={item} onToggleStar={() => toggleStar(item.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function StarredItem({ item, onToggleStar }: { item: Task & { projectName: string; projectKey: string }; onToggleStar: () => void }) {
  const TypeIcon = ISSUE_ICONS[item.issue_type] || CheckSquare2
  const PriorityIcon = PRIORITY_ICONS[item.priority] || ArrowRight
  const typeCfg = ISSUE_TYPE_CONFIG[item.issue_type as keyof typeof ISSUE_TYPE_CONFIG] || ISSUE_TYPE_CONFIG.task
  const priorityCfg = TASK_PRIORITY_CONFIG[item.priority as keyof typeof TASK_PRIORITY_CONFIG] || TASK_PRIORITY_CONFIG.medium
  const statusCfg = TASK_STATUS_CONFIG[item.status as keyof typeof TASK_STATUS_CONFIG]
  const initials = item.assignee?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-card px-4 py-3 hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer group">
      <button onClick={(e) => { e.stopPropagation(); onToggleStar() }} className="shrink-0 text-yellow-500 hover:scale-110 transition-transform">
        <Star className="h-4 w-4 fill-yellow-500" />
      </button>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="shrink-0"><TypeIcon className="h-4 w-4" style={{ color: typeCfg.hex }} /></div>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-xs">{typeCfg.label}</TooltipContent>
      </Tooltip>

      <span className="text-xs font-bold text-muted-foreground/70 shrink-0 w-16 uppercase">{item.issue_key || "—"}</span>

      <p className="text-sm font-medium truncate flex-1 group-hover:text-primary transition-colors">{item.title}</p>

      <span className="text-xs text-muted-foreground shrink-0">{item.projectName}</span>

      {statusCfg && (
        <Badge variant="outline" className={cn("text-[10px] shrink-0", statusCfg.color, statusCfg.bgColor)}>
          {statusCfg.label}
        </Badge>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="shrink-0"><PriorityIcon className="h-3.5 w-3.5" style={{ color: priorityCfg.hex }} /></div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{priorityCfg.label}</TooltipContent>
      </Tooltip>

      {initials ? (
        <Avatar className="h-6 w-6 shrink-0"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-[8px] text-white font-bold">{initials}</AvatarFallback></Avatar>
      ) : (
        <div className="h-6 w-6 shrink-0 rounded-full border-2 border-dashed border-border/40" />
      )}
    </div>
  )
}
