import { useState } from "react"
import type { Project, Task, TaskFormData } from "@/types/project"
import { StatusBadge, PriorityBadge } from "./StatusBadge"
import { TaskList } from "./TaskList"
import { TaskFormDialog } from "./TaskFormDialog"
import { useTasks } from "@/hooks/useProjects"
import { formatDate } from "@/lib/utils"
import { Plus, Calendar, Tag, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface ProjectDetailDrawerProps {
  project: Project | null
  open: boolean
  onClose: () => void
  onEdit: (id: string) => void
}

export function ProjectDetailDrawer({ project, open, onClose, onEdit }: ProjectDetailDrawerProps) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { addTask, updateTask, deleteTask } = useTasks(project?.id ?? "")

  const handleAddTask = (data: TaskFormData) => {
    addTask(data)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  const handleUpdateTask = (data: TaskFormData) => {
    if (!editingTask) return
    updateTask({ taskId: editingTask.id, data })
    setEditingTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId)
  }

  const tasksDone = project?.tasks.filter((t) => t.status === "done").length ?? 0
  const totalTasks = project?.tasks.length ?? 0
  const progress = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[520px] p-0 flex flex-col"
        >
          {project && (
            <>
              {/* Header */}
              <div className="border-b px-6 pt-6 pb-4 shrink-0">
                <SheetHeader className="space-y-1">
                  <div className="flex items-start justify-between gap-3 pr-6">
                    <SheetTitle className="text-lg font-semibold leading-snug">
                      {project.name}
                    </SheetTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => onEdit(project.id)}
                    >
                      <Pencil className="h-3 w-3 mr-1.5" />
                      Edit
                    </Button>
                  </div>
                  <SheetDescription className="text-[13px] leading-relaxed">
                    {project.description || "No description"}
                  </SheetDescription>
                </SheetHeader>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Status / Priority / Progress row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                      Status
                    </p>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                      Priority
                    </p>
                    <PriorityBadge priority={project.priority} />
                  </div>
                  <div className="rounded-lg border bg-card p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                      Progress
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: progress === 100 ? "#36B37E" : "#0052CC",
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-foreground">{progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Dates & Tags */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {formatDate(project.startDate)} &#8594;{" "}
                      {project.endDate ? formatDate(project.endDate) : "No end date"}
                    </span>
                  </div>
                  {project.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t" />

                {/* Tasks section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Tasks{" "}
                      <span className="text-muted-foreground font-normal">
                        ({totalTasks})
                      </span>
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTask(null)
                        setTaskDialogOpen(true)
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task
                    </Button>
                  </div>
                  <TaskList
                    tasks={project.tasks}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <TaskFormDialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false)
          setEditingTask(null)
        }}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        initialData={editingTask ?? undefined}
        title={editingTask ? "Edit Task" : "Add Task"}
      />
    </>
  )
}
