import { useState, useMemo } from "react"
import { useEpics, useDeleteEpic, useLinkTaskToEpic } from "@/hooks/useEpics"
import { useProjects } from "@/hooks/useProjects"
import { useCreateTask } from "@/hooks/useTasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Milestone, Plus, MoreHorizontal, Pencil, Trash2, LayoutList, GanttChart,
  ChevronDown, CheckSquare2, Loader2,
} from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import { TASK_STATUS_CONFIG } from "@/config"
import type { Epic, Task } from "@/types"
import { EpicFormDialog } from "./components/EpicFormDialog"
import { RoadmapTimeline } from "./components/RoadmapTimeline"

const EPIC_STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  todo: { label: "To Do", color: "text-gray-700", bg: "bg-gray-100" },
  "in-progress": { label: "In Progress", color: "text-blue-700", bg: "bg-blue-100" },
  done: { label: "Done", color: "text-green-700", bg: "bg-green-100" },
}

export default function EpicsPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const [selectedProject, setSelectedProject] = useState<string>("")
  const projectId = selectedProject || projects?.[0]?.id || ""

  const { data: epics, isLoading: epicsLoading } = useEpics(projectId || undefined)
  const deleteEpic = useDeleteEpic()

  // Get tasks for the selected project to display in epic cards
  const currentProject = projects?.find((p) => p.id === effectiveProjectId)
  const projectTasks: Task[] = currentProject?.tasks ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Epic | null>(null)

  // Auto-select first project
  const effectiveProjectId = selectedProject || projects?.[0]?.id || ""

  const sortedEpics = useMemo(() => {
    if (!epics) return []
    const order = { "in-progress": 0, todo: 1, done: 2 }
    return [...epics].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9))
  }, [epics])

  const isLoading = projectsLoading || epicsLoading

  if (isLoading) return <EpicsSkeleton />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Milestone className="h-6 w-6" />
            Epics
          </h1>
          <p className="text-muted-foreground mt-1">Organize and track large bodies of work</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={effectiveProjectId} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditingEpic(null); setFormOpen(true) }} disabled={!effectiveProjectId}>
            <Plus className="mr-2 h-4 w-4" />
            Create Epic
          </Button>
        </div>
      </div>

      {!effectiveProjectId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Milestone className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">Create a project first to manage epics</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <LayoutList className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="gap-2">
              <GanttChart className="h-4 w-4" />
              Roadmap
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="mt-4 space-y-3">
            {sortedEpics.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Milestone className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-sm text-muted-foreground">No epics yet</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => { setEditingEpic(null); setFormOpen(true) }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first epic
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sortedEpics.map((epic) => (
                <EpicCard
                  key={epic.id}
                  epic={epic}
                  projectId={effectiveProjectId}
                  tasks={projectTasks}
                  onEdit={() => { setEditingEpic(epic); setFormOpen(true) }}
                  onDelete={() => setDeleteTarget(epic)}
                />
              ))
            )}
          </TabsContent>

          {/* Roadmap View */}
          <TabsContent value="roadmap" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <RoadmapTimeline epics={sortedEpics} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Form Dialog */}
      {effectiveProjectId && (
        <EpicFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          projectId={effectiveProjectId}
          epic={editingEpic}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Epic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? Linked tasks will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteEpic.mutate(
                    { projectId: effectiveProjectId, epicId: deleteTarget.id },
                    { onSuccess: () => setDeleteTarget(null) }
                  )
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EpicCard({ epic, onEdit, onDelete, projectId, tasks }: { epic: Epic; onEdit: () => void; onDelete: () => void; projectId: string; tasks: Task[] }) {
  const progress = epic.tasks_total > 0 ? Math.round((epic.tasks_done / epic.tasks_total) * 100) : 0
  const statusStyle = EPIC_STATUS_STYLES[epic.status] ?? EPIC_STATUS_STYLES.todo
  const [isOpen, setIsOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const createTask = useCreateTask()
  const linkTask = useLinkTaskToEpic()

  // Filter tasks that belong to this epic
  const epicTasks = tasks.filter((t) => epic.task_ids?.includes(t.id))

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return
    try {
      const task = await createTask.mutateAsync({
        projectId,
        data: { title: newTaskTitle, issue_type: "task", status: "todo", priority: "medium" },
      })
      // Link the new task to this epic
      await linkTask.mutateAsync({ projectId, epicId: epic.id, taskId: task.id })
      setNewTaskTitle("")
      setShowCreate(false)
    } catch {
      // Errors shown by hook toast
    }
  }

  return (
    <Card className="group relative">
      <CardContent className="p-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-start gap-4">
            {/* Color bar */}
            <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: epic.color }} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <ChevronDown className={cn("h-4 w-4 transition-transform", !isOpen && "-rotate-90")} />
                    <h3 className="text-sm font-semibold truncate">{epic.name}</h3>
                  </button>
                </CollapsibleTrigger>
                <Badge variant="outline" className={cn("text-[10px]", statusStyle.color, statusStyle.bg)}>
                  {statusStyle.label}
                </Badge>
              </div>
              {epic.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 ml-6">{epic.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground ml-6">
                {epic.start_date && <span>Start: {formatDate(epic.start_date)}</span>}
                {epic.target_date && <span>Target: {formatDate(epic.target_date)}</span>}
                <span>{epic.tasks_done}/{epic.tasks_total} tasks done</span>
              </div>
              {epic.tasks_total > 0 && (
                <div className="mt-2 flex items-center gap-2 ml-6">
                  <Progress value={progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground w-8 text-right">{progress}%</span>
                </div>
              )}

              {/* Collapsible task list */}
              <CollapsibleContent className="ml-6 mt-3">
                <div className="space-y-1 border-l-2 border-border/50 pl-3">
                  {epicTasks.length === 0 && !showCreate && (
                    <p className="text-xs text-muted-foreground/60 italic py-2">No tasks in this epic yet</p>
                  )}
                  {epicTasks.map((task) => {
                    const statusCfg = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG]
                    return (
                      <div key={task.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-accent/50 transition-colors text-sm">
                        <CheckSquare2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-bold text-muted-foreground/60 w-14 shrink-0 uppercase">{task.issue_key || "—"}</span>
                        <span className="truncate flex-1 text-sm">{task.title}</span>
                        {statusCfg && (
                          <Badge variant="outline" className={cn("text-[9px] shrink-0", statusCfg.color, statusCfg.bgColor)}>
                            {statusCfg.label}
                          </Badge>
                        )}
                      </div>
                    )
                  })}

                  {/* Inline create task */}
                  {showCreate ? (
                    <div className="flex items-center gap-2 py-1">
                      <Input
                        autoFocus
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateTask()
                          if (e.key === "Escape") { setShowCreate(false); setNewTaskTitle("") }
                        }}
                        placeholder="Task title..."
                        className="h-8 text-sm flex-1"
                        disabled={createTask.isPending || linkTask.isPending}
                      />
                      <Button size="sm" className="h-8 text-xs px-3" onClick={handleCreateTask} disabled={createTask.isPending || linkTask.isPending || !newTaskTitle.trim()}>
                        {(createTask.isPending || linkTask.isPending) ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={() => { setShowCreate(false); setNewTaskTitle("") }}>Cancel</Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCreate(true)}
                      className="flex items-center gap-2 py-1.5 px-2 text-xs text-muted-foreground hover:text-primary transition-colors w-full rounded hover:bg-accent/50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create task in epic
                    </button>
                  )}
                </div>
              </CollapsibleContent>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

function EpicsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
  )
}
