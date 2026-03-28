import { useState, useMemo } from "react"
import { useProjects } from "@/hooks/useProjects"
import {
  useSprints,
  useCreateSprint,
  useUpdateSprint,
  useDeleteSprint,
  useStartSprint,
  useCompleteSprint,
} from "@/hooks/useSprints"
import { SPRINT_STATUS_CONFIG } from "@/config"
import { formatDate } from "@/lib/utils"
import type { Sprint, SprintFormData, SprintStatus } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreHorizontal,
  Play,
  CheckCircle2,
  Pencil,
  Trash2,
  CalendarDays,
  Target,
  ListTodo,
  Inbox,
} from "lucide-react"

// ── Sprint Form Dialog ────────────────────────────────────────────────────────

interface SprintFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Sprint | null
  onSubmit: (data: SprintFormData) => void
  isPending: boolean
}

function SprintFormDialog({ open, onOpenChange, initialData, onSubmit, isPending }: SprintFormDialogProps) {
  const [name, setName] = useState("")
  const [goal, setGoal] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const isEdit = !!initialData

  // Reset form when dialog opens
  const handleOpenChange = (value: boolean) => {
    if (value && initialData) {
      setName(initialData.name)
      setGoal(initialData.goal)
      setStartDate(initialData.start_date?.split("T")[0] ?? "")
      setEndDate(initialData.end_date?.split("T")[0] ?? "")
    } else if (value) {
      setName("")
      setGoal("")
      setStartDate("")
      setEndDate("")
    }
    onOpenChange(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: SprintFormData = {
      name: name.trim(),
      goal: goal.trim(),
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
    }
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Sprint" : "Create Sprint"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the sprint details below."
              : "Fill in the details to create a new sprint."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sprint-name">Sprint Name</Label>
            <Input
              id="sprint-name"
              placeholder="e.g. Sprint 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint-goal">Goal</Label>
            <Textarea
              id="sprint-goal"
              placeholder="What is the goal of this sprint?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save Changes" : "Create Sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Sprint Card ───────────────────────────────────────────────────────────────

interface SprintCardProps {
  sprint: Sprint
  projectId: string
  onEdit: (sprint: Sprint) => void
  onDelete: (sprint: Sprint) => void
  onStart: (sprint: Sprint) => void
  onComplete: (sprint: Sprint) => void
}

function SprintCard({ sprint, projectId: _projectId, onEdit, onDelete, onStart, onComplete }: SprintCardProps) {
  const statusCfg = SPRINT_STATUS_CONFIG[sprint.status]
  const tasks = sprint.tasks ?? []
  const doneTasks = tasks.filter((t) => t.status === "done").length
  const totalTasks = tasks.length
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const isActive = sprint.status === "active"
  const isPlanning = sprint.status === "planning"

  return (
    <Card className={isActive ? "border-blue-500 border-2" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base truncate">{sprint.name}</CardTitle>
              <Badge
                variant="secondary"
                className={`${statusCfg.bgColor} ${statusCfg.color} text-[10px] shrink-0`}
              >
                {statusCfg.label}
              </Badge>
            </div>
            {sprint.goal && (
              <CardDescription className="line-clamp-2">{sprint.goal}</CardDescription>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isPlanning && (
                <DropdownMenuItem onClick={() => onStart(sprint)}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Sprint
                </DropdownMenuItem>
              )}
              {isActive && (
                <DropdownMenuItem onClick={() => onComplete(sprint)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Sprint
                </DropdownMenuItem>
              )}
              {(isPlanning || isActive) && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={() => onEdit(sprint)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(sprint)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date range + task count */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {sprint.start_date || sprint.end_date
              ? `${formatDate(sprint.start_date)} - ${formatDate(sprint.end_date)}`
              : "No dates set"}
          </span>
          <span className="flex items-center gap-1">
            <ListTodo className="h-3.5 w-3.5" />
            {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
          </span>
        </div>

        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Mini task list */}
        {tasks.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {tasks.slice(0, 5).map((task) => {
              return (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      task.status === "done"
                        ? "bg-green-500"
                        : task.status === "in-progress"
                          ? "bg-blue-500"
                          : task.status === "review"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {task.issue_key}
                  </span>
                  <span className="truncate text-xs">{task.title}</span>
                </div>
              )
            })}
            {tasks.length > 5 && (
              <p className="text-xs text-muted-foreground pl-4">
                +{tasks.length - 5} more
              </p>
            )}
          </div>
        )}

        {tasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No tasks in this sprint</p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────

function SprintsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 2 }).map((_, j) => (
              <Skeleton key={j} className="h-48" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SprintsPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const { data: sprints, isLoading: sprintsLoading } = useSprints(selectedProjectId || undefined)

  const createSprint = useCreateSprint()
  const updateSprint = useUpdateSprint()
  const deleteSprint = useDeleteSprint()
  const startSprint = useStartSprint()
  const completeSprint = useCompleteSprint()

  const [formOpen, setFormOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Sprint | null>(null)

  // Auto-select first project once loaded
  const projectId = selectedProjectId || projects?.[0]?.id || ""

  // Group sprints by status: active -> planning -> completed
  const grouped = useMemo(() => {
    if (!sprints) return { active: [], planning: [], completed: [] }
    const groups: Record<SprintStatus, Sprint[]> = { active: [], planning: [], completed: [] }
    for (const sprint of sprints) {
      groups[sprint.status].push(sprint)
    }
    return groups
  }, [sprints])

  const isLoading = projectsLoading || (!!projectId && sprintsLoading)

  if (isLoading && !projects) {
    return <SprintsSkeleton />
  }

  const handleCreate = (data: SprintFormData) => {
    if (!projectId) return
    createSprint.mutate(
      { projectId, data },
      { onSuccess: () => setFormOpen(false) },
    )
  }

  const handleUpdate = (data: SprintFormData) => {
    if (!projectId || !editingSprint) return
    updateSprint.mutate(
      { projectId, sprintId: editingSprint.id, data },
      {
        onSuccess: () => {
          setEditingSprint(null)
          setFormOpen(false)
        },
      },
    )
  }

  const handleDelete = () => {
    if (!projectId || !deleteTarget) return
    deleteSprint.mutate(
      { projectId, sprintId: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) },
    )
  }

  const handleStartSprint = (sprint: Sprint) => {
    if (!projectId) return
    startSprint.mutate({ projectId, sprintId: sprint.id })
  }

  const handleCompleteSprint = (sprint: Sprint) => {
    if (!projectId) return
    completeSprint.mutate({ projectId, sprintId: sprint.id })
  }

  const openEditDialog = (sprint: Sprint) => {
    setEditingSprint(sprint)
    setFormOpen(true)
  }

  const statusOrder: SprintStatus[] = ["active", "planning", "completed"]
  const hasAnySprints = sprints && sprints.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sprints</h1>
          <p className="text-muted-foreground mt-1">Plan and manage your sprints</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={projectId}
            onValueChange={(val) => setSelectedProjectId(val)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditingSprint(null); setFormOpen(true) }} disabled={!projectId}>
            <Plus className="mr-2 h-4 w-4" />
            Create Sprint
          </Button>
        </div>
      </div>

      {/* Loading state for sprints */}
      {sprintsLoading && projectId && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      )}

      {/* No project selected */}
      {!projectId && !projectsLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">No projects found. Create a project first.</p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {projectId && !sprintsLoading && !hasAnySprints && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No sprints yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first sprint to start organizing tasks.
            </p>
            <Button onClick={() => { setEditingSprint(null); setFormOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Sprint
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sprint groups */}
      {projectId && !sprintsLoading && hasAnySprints && (
        <div className="space-y-8">
          {statusOrder.map((status) => {
            const sprintsInGroup = grouped[status]
            if (sprintsInGroup.length === 0) return null

            const cfg = SPRINT_STATUS_CONFIG[status]
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {cfg.label}
                  </h2>
                  <Badge variant="secondary" className="text-[10px]">
                    {sprintsInGroup.length}
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {sprintsInGroup.map((sprint) => (
                    <SprintCard
                      key={sprint.id}
                      sprint={sprint}
                      projectId={projectId}
                      onEdit={openEditDialog}
                      onDelete={setDeleteTarget}
                      onStart={handleStartSprint}
                      onComplete={handleCompleteSprint}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <SprintFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingSprint(null)
        }}
        initialData={editingSprint}
        onSubmit={editingSprint ? handleUpdate : handleCreate}
        isPending={createSprint.isPending || updateSprint.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sprint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
              Tasks in this sprint will be moved to the backlog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSprint.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
