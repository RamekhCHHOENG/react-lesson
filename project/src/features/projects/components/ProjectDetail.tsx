import { useState } from "react"
import type { Project, Task, TaskFormData } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge, PriorityBadge } from "./StatusBadge"
import { TaskList } from "./TaskList"
import { TaskFormDialog } from "./TaskFormDialog"
import { useTasks } from "@/hooks/useProjects"
import { ArrowLeft, Plus, Calendar, Tag } from "lucide-react"

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
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

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
                <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

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
