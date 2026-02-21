import { useState, useRef, useMemo } from "react"
import { useProjectContext } from "@/store/ProjectContext"
import { useTaskActions, useProjects } from "@/hooks/useProjects"
import { BoardPageSkeleton } from "@/components/skeletons/PageSkeletons"
import { BOARD_COLUMNS, TaskCard } from "@/features/projects/components/ProjectDetail"
import { TaskFormDialog } from "@/features/projects/components/TaskFormDialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import type { Task, TaskStatus } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LayoutDashboard, Plus } from "lucide-react"

interface BoardTask extends Task {
  projectId: string
  projectName: string
}

export default function BoardPage() {
  const { state } = useProjectContext()
  const { isLoading } = useProjects()
  const { updateTask, deleteTask: apiDeleteTask, addTask } = useTaskActions()
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const dragTaskRef = useRef<{ task: BoardTask; sourceColumn: TaskStatus } | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<BoardTask | null>(null)
  const [createForProject, setCreateForProject] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")
  const [deleteTarget, setDeleteTarget] = useState<BoardTask | null>(null)

  const allTasks = useMemo<BoardTask[]>(() => {
    return state.projects.flatMap((project) =>
      project.tasks.map((task) => ({
        ...task,
        projectId: project.id,
        projectName: project.name,
      }))
    )
  }, [state.projects])

  const filteredTasks = useMemo(() => {
    if (selectedProjectId === "all") return allTasks
    return allTasks.filter((t) => t.projectId === selectedProjectId)
  }, [allTasks, selectedProjectId])

  const tasksByStatus = BOARD_COLUMNS.map((col) => ({
    ...col,
    tasks: filteredTasks.filter((t) => t.status === col.key),
  }))

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    const boardTask = filteredTasks.find((t) => t.id === task.id)
    if (!boardTask) return
    dragTaskRef.current = { task: boardTask, sourceColumn: task.status }
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5"
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
    }
    dragTaskRef.current = null
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnKey: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(columnKey)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetColumn: TaskStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const ref = dragTaskRef.current
    if (!ref) return
    if (ref.sourceColumn === targetColumn) return
    updateTask(ref.task.projectId, ref.task.id, { status: targetColumn })
    dragTaskRef.current = null
  }

  const handleEditTask = (task: Task) => {
    const boardTask = filteredTasks.find((t) => t.id === task.id)
    if (boardTask) {
      setEditingTask(boardTask)
      setTaskDialogOpen(true)
    }
  }

  const handleDeleteTask = (taskId: string) => {
    const boardTask = filteredTasks.find((t) => t.id === taskId)
    if (boardTask) {
      setDeleteTarget(boardTask)
    }
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    apiDeleteTask(deleteTarget.projectId, deleteTarget.id)
    setDeleteTarget(null)
  }

  if (isLoading && state.projects.length === 0) {
    return <BoardPageSkeleton />
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-primary to-blue-500">
                <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Board</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {filteredTasks.length} issue{filteredTasks.length !== 1 ? "s" : ""} across{" "}
                  {selectedProjectId === "all"
                    ? `${state.projects.length} projects`
                    : "1 project"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={selectedProjectId}
                onValueChange={(value) => setSelectedProjectId(value)}
              >
                <SelectTrigger className="h-8 w-[180px] text-sm">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {state.projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.projects.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => {
                    const targetProject = selectedProjectId !== "all"
                      ? selectedProjectId
                      : state.projects[0]?.id
                    if (targetProject) {
                      setCreateForProject(targetProject)
                      setEditingTask(null)
                      setTaskDialogOpen(true)
                    }
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create issue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-auto p-6">
        {state.projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LayoutDashboard className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-medium text-foreground">No projects yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a project first, then add issues to see them here.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 h-full min-h-[400px]">
            {tasksByStatus.map((column) => (
              <div
                key={column.key}
                className={`flex flex-col w-[280px] min-w-[280px] rounded transition-colors ${
                  dragOverColumn === column.key
                    ? "bg-accent ring-2 ring-ring"
                    : "bg-muted/50"
                }`}
                onDragOver={(e) => handleDragOver(e, column.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.key)}
              >
                <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: column.headerColor }}
                    >
                      {column.label}
                    </span>
                    <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold">
                      {column.tasks.length}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                  {column.tasks.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-xs text-muted-foreground/60">
                      Drop issues here
                    </div>
                  ) : (
                    column.tasks.map((task) => (
                      <div key={task.id} className="relative">
                        <TaskCard
                          task={task}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                          draggable
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        />
                        <div className="absolute bottom-1 left-3 text-[9px] text-muted-foreground/60 font-medium pointer-events-none">
                          {(task as BoardTask).projectName}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskFormDialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false)
          setEditingTask(null)
          setCreateForProject(null)
        }}
        onSubmit={(data) => {
          if (editingTask) {
            updateTask(editingTask.projectId, editingTask.id, data)
          } else if (createForProject) {
            addTask(createForProject, data)
          }
          setEditingTask(null)
          setCreateForProject(null)
        }}
        initialData={editingTask ?? undefined}
        title={editingTask ? "Edit issue" : "Create issue"}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete issue"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
