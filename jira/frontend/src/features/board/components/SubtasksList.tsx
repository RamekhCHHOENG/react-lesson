import { useState } from "react"
import { useSubtasks, useCreateSubtask, useUpdateTask } from "@/hooks/useTasks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "@/config"
import type { TaskSummary } from "@/types"

interface SubtasksListProps {
  projectId: string
  taskId: string
}

export function SubtasksList({ projectId, taskId }: SubtasksListProps) {
  const { data: subtasks, isLoading } = useSubtasks(projectId, taskId)
  const createSubtask = useCreateSubtask()
  const updateTask = useUpdateTask()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")

  const handleCreate = () => {
    if (!title.trim()) return
    createSubtask.mutate(
      { projectId, parentId: taskId, data: { title: title.trim() } },
      { onSuccess: () => { setTitle(""); setShowForm(false) } }
    )
  }

  const toggleDone = (subtask: TaskSummary) => {
    const newStatus = subtask.status === "done" ? "todo" : "done"
    updateTask.mutate({ projectId, taskId: subtask.id, data: { status: newStatus } })
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
    )
  }

  const total = subtasks?.length ?? 0
  const done = subtasks?.filter((s) => s.status === "done").length ?? 0
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="space-y-3">
      {/* Progress */}
      {total > 0 && (
        <div className="flex items-center gap-2">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground">{done}/{total}</span>
        </div>
      )}

      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks?.map((sub) => {
          const statusCfg = TASK_STATUS_CONFIG[sub.status]
          const priorityCfg = TASK_PRIORITY_CONFIG[sub.priority]
          return (
            <div
              key={sub.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50 transition-colors group"
            >
              <Checkbox
                checked={sub.status === "done"}
                onCheckedChange={() => toggleDone(sub)}
              />
              <span className="text-xs text-muted-foreground font-mono">{sub.issue_key}</span>
              <span className={cn("text-sm flex-1 truncate", sub.status === "done" && "line-through text-muted-foreground")}>
                {sub.title}
              </span>
              <Badge variant="outline" className={cn("text-[10px]", statusCfg?.color)}>
                {statusCfg?.label}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px]", priorityCfg?.color)}>
                {priorityCfg?.label}
              </Badge>
            </div>
          )
        })}
      </div>

      {/* Add subtask form */}
      {showForm ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Subtask title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
            className="h-8 text-sm"
          />
          <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleCreate} disabled={!title.trim() || createSubtask.isPending}>
            <Send className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8" onClick={() => { setShowForm(false); setTitle("") }}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add subtask
        </Button>
      )}
    </div>
  )
}
