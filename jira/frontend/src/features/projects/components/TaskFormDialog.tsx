import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks"
import {
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  ISSUE_TYPE_CONFIG,
} from "@/config"
import type {
  Task,
  TaskFormData,
  TaskStatus,
  TaskPriority,
  IssueType,
} from "@/types"

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  task?: Task
  onSuccess?: () => void
}

const defaultFormData: TaskFormData = {
  title: "",
  description: "",
  issue_type: "task",
  status: "todo",
  priority: "medium",
  assignee: "",
  reporter: "",
  due_date: undefined,
  story_points: undefined,
}

export default function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  task,
  onSuccess,
}: TaskFormDialogProps) {
  const isEditing = !!task
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const [formData, setFormData] = useState<TaskFormData>(defaultFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (task) {
        setFormData({
          title: task.title,
          description: task.description,
          issue_type: task.issue_type,
          status: task.status,
          priority: task.priority,
          assignee: task.assignee ?? "",
          reporter: task.reporter ?? "",
          due_date: task.due_date ? task.due_date.split("T")[0] : undefined,
          story_points: task.story_points ?? undefined,
        })
      } else {
        setFormData(defaultFormData)
      }
      setErrors({})
    }
  }, [open, task])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const payload: TaskFormData = {
      ...formData,
      assignee: formData.assignee || undefined,
      reporter: formData.reporter || undefined,
      due_date: formData.due_date || undefined,
      story_points: formData.story_points ?? undefined,
    }

    try {
      if (isEditing && task) {
        await updateTask.mutateAsync({
          projectId,
          taskId: task.id,
          data: payload,
        })
      } else {
        await createTask.mutateAsync({ projectId, data: payload })
      }
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Error toast is handled by the mutation hooks
    }
  }

  const isPending = createTask.isPending || updateTask.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Task" : "Create New Task"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the task details below."
                : "Fill in the details to create a new task."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="task-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                placeholder="e.g. Implement login page"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                autoFocus
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Add a detailed description..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {/* Issue Type & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Type</Label>
                <Select
                  value={formData.issue_type}
                  onValueChange={(value: IssueType) =>
                    setFormData((prev) => ({ ...prev, issue_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(ISSUE_TYPE_CONFIG) as [
                        IssueType,
                        (typeof ISSUE_TYPE_CONFIG)[IssueType],
                      ][]
                    )
                      .filter(([key]) => key !== "subtask")
                      .map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`inline-block h-2 w-2 rounded-full ${config.bgColor}`}
                            />
                            {config.label}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: TaskStatus) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority & Story Points */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: TaskPriority) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_CONFIG).map(
                      ([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-story-points">Story Points</Label>
                <Input
                  id="task-story-points"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="e.g. 5"
                  value={formData.story_points ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      story_points: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>
            </div>

            {/* Assignee & Reporter */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Input
                  id="task-assignee"
                  placeholder="e.g. John Doe"
                  value={formData.assignee ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assignee: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-reporter">Reporter</Label>
                <Input
                  id="task-reporter"
                  placeholder="e.g. Jane Smith"
                  value={formData.reporter ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reporter: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={formData.due_date ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    due_date: e.target.value || undefined,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
