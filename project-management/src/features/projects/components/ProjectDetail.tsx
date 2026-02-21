import { useState } from "react"
import type { Project, Task, TaskFormData, TaskStatus } from "@/types/project"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge, PriorityBadge } from "./StatusBadge"
import { TaskList } from "./TaskList"
import { TaskFormDialog } from "./TaskFormDialog"
import { useTasks } from "@/hooks/useProjects"
import { ArrowLeft, Plus, Calendar, Tag, Pencil, Trash2 } from "lucide-react"
import { TASK_STATUS_CONFIG } from "@/config"

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
}

export function TaskCard({ task, onEdit, onDelete, draggable, onDragStart }: TaskCardProps) {
  const statusConfig = TASK_STATUS_CONFIG[task.status]
  return (
    <Card
      className="hover:bg-accent/50 cursor-pointer shadow-sm"
      draggable={draggable}
      onDragStart={draggable && onDragStart ? (e) => onDragStart(e, task) : undefined}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{task.title}</p>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(task)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(task.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0"
            style={{ backgroundColor: statusConfig?.dotColor + "20", color: statusConfig?.dotColor }}
          >
            {statusConfig?.label ?? task.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-muted-foreground">{project.description || "No description"}</p>
        </div>
        <Button variant="outline" onClick={onEdit}>
          Edit Project
        </Button>
      </div>

      {/* Meta cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={project.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Priority</span>
              <PriorityBadge priority={project.priority} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-semibold">{progress}%</span>
            </div>
            <div className="mt-2 w-full bg-secondary rounded-full h-2">
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

      {/* Dates & Tags */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{project.startDate} → {project.endDate || "No end date"}</span>
        </div>
        {project.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tasks */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Tasks ({project.tasks.length})</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditingTask(null)
              setTaskDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          <TaskList tasks={project.tasks} onEdit={handleEditTask} onDelete={handleDeleteTask} />
        </CardContent>
      </Card>

      <TaskFormDialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false)
          setEditingTask(null)
        }}
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        initialData={editingTask ?? undefined}
        title={editingTask ? "Edit Task" : "New Task"}
      />
    </div>
  )
}
