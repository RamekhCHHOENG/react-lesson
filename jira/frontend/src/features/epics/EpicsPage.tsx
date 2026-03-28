import { useState, useMemo } from "react"
import { useEpics, useDeleteEpic } from "@/hooks/useEpics"
import { useProjects } from "@/hooks/useProjects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Milestone, Plus, MoreHorizontal, Pencil, Trash2, LayoutList, GanttChart } from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import type { Epic } from "@/types"
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

function EpicCard({ epic, onEdit, onDelete }: { epic: Epic; onEdit: () => void; onDelete: () => void }) {
  const progress = epic.tasks_total > 0 ? Math.round((epic.tasks_done / epic.tasks_total) * 100) : 0
  const statusStyle = EPIC_STATUS_STYLES[epic.status] ?? EPIC_STATUS_STYLES.todo

  return (
    <Card className="group relative">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Color bar */}
          <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: epic.color }} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold truncate">{epic.name}</h3>
              <Badge variant="outline" className={cn("text-[10px]", statusStyle.color, statusStyle.bg)}>
                {statusStyle.label}
              </Badge>
            </div>
            {epic.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{epic.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {epic.start_date && <span>Start: {formatDate(epic.start_date)}</span>}
              {epic.target_date && <span>Target: {formatDate(epic.target_date)}</span>}
              <span>{epic.tasks_done}/{epic.tasks_total} tasks done</span>
            </div>
            {epic.tasks_total > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <Progress value={progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-8 text-right">{progress}%</span>
              </div>
            )}
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
