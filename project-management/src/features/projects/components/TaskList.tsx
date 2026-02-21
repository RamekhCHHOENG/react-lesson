import type { Task } from "@/types/project"
import { StatusBadge } from "./StatusBadge"
import { Pencil, Trash2, User, Calendar } from "lucide-react"

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 text-[#6B778C]">
        <p className="text-sm">No tasks yet. Add your first task to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between rounded border border-[#DFE1E6] bg-white p-3 hover:bg-[#F4F5F7] transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[13px] text-[#172B4D] truncate">{task.title}</span>
              <StatusBadge status={task.status} type="task" />
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-[#6B778C]">
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
            <button
              onClick={() => onEdit(task)}
              className="flex items-center justify-center h-7 w-7 rounded hover:bg-[#EBECF0]"
            >
              <Pencil className="h-3.5 w-3.5 text-[#6B778C]" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="flex items-center justify-center h-7 w-7 rounded hover:bg-[#FFEBE6]"
            >
              <Trash2 className="h-3.5 w-3.5 text-[#DE350B]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
