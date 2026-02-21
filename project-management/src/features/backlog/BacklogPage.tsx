import { useState, useMemo, useEffect } from "react"
import { useProjectContext } from "@/store/ProjectContext"
import { useTaskActions, useProjects } from "@/hooks/useProjects"
import { BacklogPageSkeleton } from "@/components/skeletons/PageSkeletons"
import { formatDate } from "@/lib/utils"
import { TaskFormDialog } from "@/features/projects/components/TaskFormDialog"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import type { Task, TaskStatus } from "@/types/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckSquare,
  Search,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Calendar,
  Plus,
} from "lucide-react"

interface BacklogTask extends Task {
  projectId: string
  projectName: string
}

function TaskRow({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: BacklogTask
  onEdit: (task: BacklogTask) => void
  onDelete: (task: BacklogTask) => void
  onStatusChange: (task: BacklogTask, status: TaskStatus) => void
}) {
  return (
    <div className="grid grid-cols-[1fr_120px_100px_100px_100px_80px] gap-3 px-4 py-2.5 border-b hover:bg-accent/50 transition-colors group items-center">
      <div className="min-w-0">
        <span className="text-sm font-medium text-foreground truncate block">
          {task.title}
        </span>
        {task.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
        )}
      </div>
      <div>
        <Badge variant="secondary" className="text-xs truncate block text-center">
          {task.projectName}
        </Badge>
      </div>
      <div>
        <Select
          value={task.status}
          onValueChange={(value) => onStatusChange(task, value as TaskStatus)}
        >
          <SelectTrigger className="h-6 text-[10px] font-semibold uppercase border-0 bg-transparent px-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">TO DO</SelectItem>
            <SelectItem value="in-progress">IN PROGRESS</SelectItem>
            <SelectItem value="review">IN REVIEW</SelectItem>
            <SelectItem value="done">DONE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold shrink-0">
              {task.assignee.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground truncate">{task.assignee}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60">Unassigned</span>
        )}
      </div>
      <div>
        {task.dueDate ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {formatDate(task.dueDate)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/60">&#8212;</span>
        )}
      </div>
      <div className="flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onEdit(task)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(task)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

interface Props {
  createTrigger?: number
}

export default function BacklogPage({ createTrigger }: Props) {
  const { state } = useProjectContext()
  const { isLoading } = useProjects()
  const { updateTask, deleteTask, addTask } = useTaskActions()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")
  const [editingTask, setEditingTask] = useState<BacklogTask | null>(null)
  const [createForProject, setCreateForProject] = useState<string | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BacklogTask | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    todo: true,
    "in-progress": true,
    review: true,
    done: false,
  })

  // Open create dialog from TopNav "Create" button
  useEffect(() => {
    if (createTrigger && createTrigger > 0) {
      const targetProject = selectedProjectId !== "all"
        ? selectedProjectId
        : state.projects[0]?.id
      if (targetProject) {
        setCreateForProject(targetProject)
        setEditingTask(null)
        setTaskDialogOpen(true)
      }
    }
  }, [createTrigger]) // eslint-disable-line react-hooks/exhaustive-deps

  const allTasks = useMemo<BacklogTask[]>(() => {
    return state.projects.flatMap((project) =>
      project.tasks.map((task) => ({
        ...task,
        projectId: project.id,
        projectName: project.name,
      }))
    )
  }, [state.projects])

  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === "all" || t.status === statusFilter
      const matchProject = selectedProjectId === "all" || t.projectId === selectedProjectId
      return matchSearch && matchStatus && matchProject
    })
  }, [allTasks, search, statusFilter, selectedProjectId])

  const groupedTasks = useMemo(() => {
    const groups: Record<string, { label: string; color: string; tasks: BacklogTask[] }> = {
      todo: { label: "TO DO", color: "#42526E", tasks: [] },
      "in-progress": { label: "IN PROGRESS", color: "#0052CC", tasks: [] },
      review: { label: "IN REVIEW", color: "#6554C0", tasks: [] },
      done: { label: "DONE", color: "#00875A", tasks: [] },
    }
    filteredTasks.forEach((t) => {
      if (groups[t.status]) {
        groups[t.status].tasks.push(t)
      }
    })
    return groups
  }, [filteredTasks])

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleStatusChange = (task: BacklogTask, status: TaskStatus) => {
    updateTask(task.projectId, task.id, { status })
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteTask(deleteTarget.projectId, deleteTarget.id)
    setDeleteTarget(null)
  }

  const backlogCount = allTasks.filter((t) => t.status === "todo").length

  if (isLoading && state.projects.length === 0) {
    return <BacklogPageSkeleton />
  }

  return (
    <div className="h-full flex flex-col bg-background">

      {/* Header */}
      <div className="bg-card border-b shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-secondary to-muted-foreground">
                <CheckSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Backlog</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {backlogCount} issue{backlogCount !== 1 ? "s" : ""} in backlog &middot;{" "}
                  {allTasks.length} total
                </p>
              </div>
            </div>
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

          {/* Filters */}
          <div className="flex items-center gap-3 mt-4">
            <div className="relative w-[240px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-sm"
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}
            >
              <SelectTrigger className="h-8 w-[150px] text-sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
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
          </div>
        </div>
      </div>

      {/* Backlog list */}
      <div className="flex-1 overflow-auto p-6">
        {allTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-medium text-foreground">Backlog is empty</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create issues in your projects to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedTasks).map(([key, group]) => (
              <Card key={key} className="overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => toggleSection(key)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-muted/50 border-b hover:bg-muted/80 transition-colors"
                >
                  {expandedSections[key] ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: group.color }}
                  >
                    {group.label}
                  </span>
                  <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold">
                    {group.tasks.length}
                  </Badge>
                </button>

                {/* Tasks */}
                {expandedSections[key] && (
                  <CardContent className="p-0">
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_120px_100px_100px_100px_80px] gap-3 px-4 py-1.5 bg-muted/30 border-b text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>Issue</span>
                      <span>Project</span>
                      <span>Status</span>
                      <span>Assignee</span>
                      <span>Due Date</span>
                      <span className="text-right">Actions</span>
                    </div>
                    {group.tasks.length === 0 ? (
                      <div className="flex items-center justify-center py-6 text-xs text-muted-foreground/60">
                        No issues
                      </div>
                    ) : (
                      group.tasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onEdit={(t) => {
                            setEditingTask(t)
                            setTaskDialogOpen(true)
                          }}
                          onDelete={(t) => setDeleteTarget(t)}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </CardContent>
                )}
              </Card>
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
