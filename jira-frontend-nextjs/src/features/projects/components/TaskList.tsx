import { useState } from "react"
import type { Task } from "@/types/project"
import { IssuePriorityBadge, IssueTypeBadge, StatusBadge } from "./StatusBadge"
import { formatDate } from "@/lib/utils"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { Pencil, Trash2, User, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="text-sm">No issues yet. Add your first issue to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded border bg-card p-3 hover:bg-muted transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{task.issueKey}</span>
                <span className="font-medium text-[13px] text-foreground truncate">{task.title}</span>
                <IssueTypeBadge issueType={task.issueType} className="px-1.5 py-0 text-[10px]" />
                <IssuePriorityBadge priority={task.priority} className="px-1.5 py-0 text-[10px]" />
                <StatusBadge status={task.status} type="task" />
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                {task.reporter && <span>Reporter: {task.reporter}</span>}
                {task.assignee && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assignee}
                  </span>
                )}
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(task)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteTarget(task)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete issue"
        description={`Are you sure you want to delete "${deleteTarget?.issueKey} ${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget.id)
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
