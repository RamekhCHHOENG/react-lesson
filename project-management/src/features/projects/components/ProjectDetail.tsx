import { useState } from "react"
import type { Project, Task, TaskFormData, TaskStatus } from "@/types/project"
import { StatusBadge, PriorityBadge } from "./StatusBadge"
import { TaskList } from "./TaskList"
import { TaskFormDialog } from "./TaskFormDialog"
import { useTasks } from "@/hooks/useProjects"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Plus, Calendar, Tag, Pencil, Trash2 } from "lucide-react"
import { TASK_STATUS_CONFIG } from "@/config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const BOARD_COLUMNS: { key: TaskStatus; label: string; headerColor: string }[] = [
  { key: "todo", label: "TO DO", headerColor: "#6B778C" },
  { key: "in-progress", label: "IN PROGRESS", headerColor: "#0065FF" },
  { key: "review", label: "IN REVIEW", headerColor: "#6554C0" },
  { key: "done", label: "DONE", headerColor: "#36B37E" },
]

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent, task: Task) => void
  onDragEnd?: (e: React.DragEvent) => void
}

export function TaskCard({ task, onEdit, onDelete, draggable, onDragStart, onDragEnd }: TaskCardProps) {
  const statusConfig = TASK_STATUS_CONFIG[task.status]
  return (
    <div
      className="bg-card rounded border p-3 hover:bg-muted cursor-pointer shadow-sm"
      draggable={draggable}
      onDragStart={draggable && onDragStart ? (e) => onDragStart(e, task) : undefined}
      onDragEnd={draggable && onDragEnd ? onDragEnd : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(task)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(task.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span
          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
          style={{ backgroundColor: statusConfig?.dotColor + "20", color: statusConfig?.dotColor }}
        >
          {statusConfig?.label ?? task.status}
        </span>
      </div>
    </div>
  )
}

interface ProjectDetailProps {
  project: Project
  onBack: () => void
  onEdit: () => void
}

export function ProjectDetail({ project, onBack, onEdit }: ProjectDetailProps) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { addTask, updateTask, deleteTask } = useTasks(project.id)

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

  const tasksDone = project.tasks.filter((t) => t.status === "done").length
  const progress = project.tasks.length > 0 ? Math.round((tasksDone / project.tasks.length) * 100) : 0

  return (
    <div className="h-full flex flex-col bg-background">
      {/* header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate">{project.name}</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">{project.description || "No description"}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit Project
          </Button>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* meta cards */}
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground font-medium mb-1">Status</p>
              <StatusBadge status={project.status} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground font-medium mb-1">Priority</p>
              <PriorityBadge priority={project.priority} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-muted-foreground font-medium">Progress</p>
                <span className="text-sm font-bold text-foreground">{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: progress === 100 ? "#36B37E" : "#0052CC",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* dates & tags */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formatDate(project.startDate)} &#8594; {project.endDate ? formatDate(project.endDate) : "No end date"}
            </span>
          </div>
          {project.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
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

        {/* tasks section */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 px-4 py-3 border-b">
            <CardTitle className="text-sm">Tasks ({project.tasks.length})</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setEditingTask(null)
                setTaskDialogOpen(true)
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <TaskList tasks={project.tasks} onEdit={handleEditTask} onDelete={handleDeleteTask} />
          </CardContent>
        </Card>
      </div>

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
    </div>
  )
}
