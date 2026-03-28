import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
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

interface TaskFormDrawerProps {
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
}

export default function TaskFormDrawer({
  open,
  onOpenChange,
  projectId,
  task,
  onSuccess,
}: TaskFormDrawerProps) {
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
          labels: task.labels,
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
      newErrors.title = "Summary is required"
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
      // Error is handled by the hook
    }
  }

  const isPending = createTask.isPending || updateTask.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[540px] border-l border-border bg-background p-0 overflow-hidden flex flex-col shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="px-6 py-5 border-b border-border bg-card/50">
            <div className="flex items-center justify-between mb-1">
              <SheetTitle className="text-xl font-bold text-foreground">
                {isEditing ? "Edit Issue" : "Create Issue"}
              </SheetTitle>
              <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SheetDescription className="text-sm text-muted-foreground">
              {isEditing ? "Update issue details for your project." : "Add a new issue to your software project."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
            {/* Project & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project</Label>
                <div className="h-10 px-3 flex items-center rounded-[3px] border border-border bg-muted/30 text-sm font-medium">
                   Software Project (MKT)
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Issue Type</Label>
                <Select
                  value={formData.issue_type}
                  onValueChange={(value: IssueType) =>
                    setFormData((prev) => ({ ...prev, issue_type: value }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-[3px] border-border bg-input transition-all hover:bg-secondary/50 focus:ring-primary">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(ISSUE_TYPE_CONFIG) as any[]).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="focus:bg-secondary">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-2.5 w-2.5 rounded-full ${config.bgColor}`} />
                          <span className="font-medium">{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="task-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Summary <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                className="h-10 rounded-[3px] border-border bg-input transition-all hover:border-primary/50 focus:ring-primary"
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              {errors.title && (
                <p className="text-xs font-medium text-destructive mt-1.5">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="task-description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <span className="text-[10px] text-muted-foreground hover:text-primary cursor-pointer">Preview</span>
              </div>
              <Textarea
                id="task-description"
                className="min-h-[160px] rounded-[3px] border-border bg-input resize-none py-3 px-4 text-sm leading-relaxed transition-all hover:border-primary/50 focus:ring-primary"
                placeholder="Add more details about this issue..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: TaskStatus) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-[3px] border-border bg-input">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", config.bgColor || "bg-muted")} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: TaskPriority) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-[3px] border-border bg-input">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                           <span className={cn("font-medium", config.color)}>{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <Label htmlFor="task-assignee" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assignee</Label>
              <div className="relative">
                <Input
                  id="task-assignee"
                  className="h-10 rounded-[3px] border-border bg-input pl-10"
                  placeholder="Assign to someone"
                  value={formData.assignee ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      assignee: e.target.value,
                    }))
                  }
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  {formData.assignee ? formData.assignee.charAt(0).toUpperCase() : "?"}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 border-t border-border bg-card/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <button type="button" className="text-xs text-muted-foreground hover:text-foreground">Advanced fields</button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-4 rounded-[3px] text-sm font-semibold hover:bg-secondary text-muted-foreground transition-all"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="h-9 px-5 rounded-[3px] bg-primary text-white text-sm font-bold shadow-sm transition-all hover:bg-primary/90 focus:ring-2 focus:ring-primary/20" 
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
