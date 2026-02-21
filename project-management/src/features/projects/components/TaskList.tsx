import type { Task } from "@/types/project"
import { StatusBadge } from "./StatusBadge"
import { Pencil, Trash2, User, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="text-sm">No tasks yet. Add your first task to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between rounded border bg-card p-3 hover:bg-muted transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[13px] text-foreground truncate">{task.title}</span>
              <StatusBadge status={task.status} type="task" />
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
              {task.assignee && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {task.assignee}
                </span>
              )}
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {task.dueDate}
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
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
