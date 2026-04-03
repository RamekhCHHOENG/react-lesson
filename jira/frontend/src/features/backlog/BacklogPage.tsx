import { useState, useMemo } from "react"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  MoreHorizontal,
  Table as TableIcon,
  Filter as FilterIcon,
  Play,
  Settings2,
  Layers,
  CheckCircle2,
} from "lucide-react"
import { JiraWorkspaceFrame } from "@/components/jira/JiraWorkspaceFrame"
import { useProjectContext } from "@/store/project-context"
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks"
import { useSprints, useCreateSprint, useStartSprint, useCompleteSprint, useUpdateSprint } from "@/hooks/useSprints"
import { cn } from "@/lib/utils"
import { TASK_STATUS_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { StartSprintDialog } from "./components/StartSprintDialog"
import { CompleteSprintDialog } from "./components/CompleteSprintDialog"
import type { Task, TaskStatus, Sprint } from "@/types"

export default function BacklogPage() {
  const { selectedProject, projects, isLoading } = useProjectContext()
  const project = selectedProject ?? projects[0] ?? null
  const { data: sprints = [], isLoading: sprintsLoading } = useSprints(project?.id)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const createSprint = useCreateSprint()
  const startSprint = useStartSprint()
  const completeSprint = useCompleteSprint()
  const updateSprint = useUpdateSprint()
  const [query, setQuery] = useState("")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [showCreateInline, setShowCreateInline] = useState<string | null>(null)
  const [inlineTitle, setInlineTitle] = useState("")
  const [startDialogSprint, setStartDialogSprint] = useState<Sprint | null>(null)
  const [completeDialogSprint, setCompleteDialogSprint] = useState<Sprint | null>(null)

  // All tasks from the project
  const allTasks = useMemo(() => {
    if (!project) return []
    if (!query) return project.tasks
    const q = query.toLowerCase()
    return project.tasks.filter((t) => t.title.toLowerCase().includes(q) || t.issue_key?.toLowerCase().includes(q))
  }, [project, query])

  // Tasks assigned to a specific sprint
  const getSprintTasks = (sprintId: string) => allTasks.filter((t) => t.sprint_id === sprintId)

  // Tasks not assigned to any sprint = backlog
  const sprintIds = new Set(sprints.map((s) => s.id))
  const backlogTasks = allTasks.filter((t) => !t.sprint_id || !sprintIds.has(t.sprint_id))

  const isSectionExpanded = (id: string) => expandedSections[id] !== false // default expanded
  const toggleSection = (id: string) => setExpandedSections((prev) => ({ ...prev, [id]: !isSectionExpanded(id) }))

  const handleCreateInline = async (sprintId?: string) => {
    if (!project || !inlineTitle.trim()) return
    await createTask.mutateAsync({
      projectId: project.id,
      data: {
        title: inlineTitle,
        status: "todo",
        issue_type: "task",
        priority: "medium",
        sprint_id: sprintId,
      },
    })
    setInlineTitle("")
    setShowCreateInline(null)
  }

  const handleToggleStatus = (taskId: string, status: TaskStatus) => {
    if (!project) return
    updateTask.mutate({ projectId: project.id, taskId, data: { status } })
  }

  const handleCreateSprint = () => {
    if (!project) return
    const num = sprints.length + 1
    createSprint.mutate({
      projectId: project.id,
      data: { name: `${project.key} Sprint ${num}`, goal: "" },
    })
  }

  const handleStartSprint = (sprint: Sprint) => {
    setStartDialogSprint(sprint)
  }

  const handleConfirmStartSprint = (data: { name: string; start_date: string; end_date: string; goal: string }) => {
    if (!project || !startDialogSprint) return
    // Update sprint with form data, then start it
    updateSprint.mutate({
      projectId: project.id,
      sprintId: startDialogSprint.id,
      data: { name: data.name, goal: data.goal, start_date: data.start_date, end_date: data.end_date },
    })
    startSprint.mutate({ projectId: project.id, sprintId: startDialogSprint.id })
    setStartDialogSprint(null)
  }

  const handleCompleteSprint = (sprint: Sprint) => {
    setCompleteDialogSprint(sprint)
  }

  const handleConfirmCompleteSprint = (_moveToSprintId: string | null) => {
    if (!project || !completeDialogSprint) return
    completeSprint.mutate({ projectId: project.id, sprintId: completeDialogSprint.id })
    setCompleteDialogSprint(null)
  }

  // Sort sprints: active first, then planning, then completed
  const sortedSprints = useMemo(() => {
    const order: Record<string, number> = { active: 0, planning: 1, completed: 2 }
    return [...sprints].sort((a, b) => (order[a.status] ?? 1) - (order[b.status] ?? 1))
  }, [sprints])

  if (isLoading || sprintsLoading) {
    return (
      <JiraWorkspaceFrame tab="backlog">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-[3px]" />
            ))}
          </div>
        </div>
      </JiraWorkspaceFrame>
    )
  }

  return (
    <>
    <JiraWorkspaceFrame tab="backlog">
      <div className="space-y-6 pb-20">
        {/* Backlog Header */}
        <div className="flex items-center gap-3">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search backlog"
              className="h-10 w-full rounded-[3px] border border-border bg-input pl-10 pr-4 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <div className="flex -space-x-1.5 ml-2">
            <Avatar className="h-8 w-8 ring-2 ring-background border-none shadow-sm">
              <AvatarFallback className="bg-orange-500 text-[10px] text-white">RE</AvatarFallback>
            </Avatar>
            <button className="h-8 w-8 rounded-full ring-2 ring-background border-none bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all opacity-60">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button variant="ghost" className="h-10 text-muted-foreground font-bold px-3 hover:bg-secondary/50">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filter
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sprint Sections */}
        <div className="space-y-6">
          {sortedSprints.map((sprint) => {
            const tasks = getSprintTasks(sprint.id)
            return (
              <SprintSection
                key={sprint.id}
                sprint={sprint}
                expanded={isSectionExpanded(sprint.id)}
                onToggle={() => toggleSection(sprint.id)}
                tasks={tasks}
                onToggleStatus={handleToggleStatus}
                onStartSprint={() => handleStartSprint(sprint)}
                onCompleteSprint={() => handleCompleteSprint(sprint)}
                showCreate={showCreateInline === sprint.id}
                onShowCreate={() => setShowCreateInline(sprint.id)}
                onCancelCreate={() => setShowCreateInline(null)}
                inlineTitle={inlineTitle}
                onInlineTitleChange={setInlineTitle}
                onCreateInline={() => handleCreateInline(sprint.id)}
              />
            )
          })}

          {/* Backlog Section */}
          <BacklogSection
            expanded={isSectionExpanded("backlog")}
            onToggle={() => toggleSection("backlog")}
            tasks={backlogTasks}
            onToggleStatus={handleToggleStatus}
            onCreateSprint={handleCreateSprint}
            showCreate={showCreateInline === "backlog"}
            onShowCreate={() => setShowCreateInline("backlog")}
            onCancelCreate={() => setShowCreateInline(null)}
            inlineTitle={inlineTitle}
            onInlineTitleChange={setInlineTitle}
            onCreateInline={() => handleCreateInline()}
          />
        </div>
      </div>
    </JiraWorkspaceFrame>

    {/* Sprint Dialogs */}
    {startDialogSprint && (
      <StartSprintDialog
        open={!!startDialogSprint}
        onOpenChange={(open) => !open && setStartDialogSprint(null)}
        sprint={startDialogSprint}
        taskCount={getSprintTasks(startDialogSprint.id).length}
        onStart={handleConfirmStartSprint}
      />
    )}
    {completeDialogSprint && (
      <CompleteSprintDialog
        open={!!completeDialogSprint}
        onOpenChange={(open) => !open && setCompleteDialogSprint(null)}
        sprint={completeDialogSprint}
        completedCount={getSprintTasks(completeDialogSprint.id).filter((t) => t.status === "done").length}
        openCount={getSprintTasks(completeDialogSprint.id).filter((t) => t.status !== "done").length}
        otherSprints={sprints.filter((s) => s.id !== completeDialogSprint.id && s.status !== "completed")}
        onComplete={handleConfirmCompleteSprint}
      />
    )}
    </>
  )
}

/* ─── Sprint Section ──────────────────────────────────────────────── */

function SprintSection({
  sprint,
  expanded,
  onToggle,
  tasks,
  onToggleStatus,
  onStartSprint,
  onCompleteSprint,
  showCreate,
  onShowCreate,
  onCancelCreate,
  inlineTitle,
  onInlineTitleChange,
  onCreateInline,
}: {
  sprint: Sprint
  expanded: boolean
  onToggle: () => void
  tasks: Task[]
  onToggleStatus: (id: string, s: TaskStatus) => void
  onStartSprint: () => void
  onCompleteSprint: () => void
  showCreate: boolean
  onShowCreate: () => void
  onCancelCreate: () => void
  inlineTitle: string
  onInlineTitleChange: (v: string) => void
  onCreateInline: () => void
}) {
  const isActive = sprint.status === "active"
  const isCompleted = sprint.status === "completed"
  const isPlanning = sprint.status === "planning"

  const todoCount = tasks.filter((t) => t.status === "todo").length
  const inProgressCount = tasks.filter((t) => t.status === "in-progress" || t.status === "review").length
  const doneCount = tasks.filter((t) => t.status === "done").length

  const dateLabel = sprint.start_date && sprint.end_date
    ? `${formatShortDate(sprint.start_date)} – ${formatShortDate(sprint.end_date)}`
    : null

  return (
    <div
      className={cn(
        "jira-panel bg-secondary/10 border-none overflow-hidden transition-all",
        isActive && "ring-1 ring-blue-500/20 bg-blue-500/5",
        isCompleted && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-border/20 group hover:bg-secondary/20 transition-all cursor-pointer">
        <div className="flex items-center gap-3" onClick={onToggle}>
          <button className="h-5 w-5 flex items-center justify-center rounded-sm hover:bg-secondary transition-colors">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-foreground/90 uppercase tracking-widest">{sprint.name}</h3>
            {isActive && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-sm">
                Active
              </span>
            )}
            {isCompleted && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-green-500/15 text-green-400 px-2 py-0.5 rounded-sm">
                Completed
              </span>
            )}
            <span className="text-[11px] font-medium text-muted-foreground opacity-60">
              {dateLabel ? `${dateLabel} · ` : ""}{tasks.length} issue{tasks.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 opacity-80 scale-90">
            {todoCount > 0 && <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold border-none">{todoCount}</Badge>}
            {inProgressCount > 0 && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold border-none">{inProgressCount}</Badge>}
            {doneCount > 0 && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 font-bold border-none">{doneCount}</Badge>}
          </div>
          <div className="h-4 w-px bg-border/40 mx-2" />
          {isPlanning && (
            <Button
              variant="outline"
              className="h-8 font-bold text-[11px] bg-blue-600 text-white hover:bg-blue-700 hover:text-white rounded-sm border-blue-600"
              onClick={onStartSprint}
              disabled={tasks.length === 0}
            >
              <Play className="h-3 w-3 mr-1.5 fill-white" />
              Start sprint
            </Button>
          )}
          {isActive && (
            <Button
              variant="outline"
              className="h-8 font-bold text-[11px] bg-secondary/50 rounded-sm border-border/40 hover:bg-secondary/80"
              onClick={onCompleteSprint}
            >
              <CheckCircle2 className="h-3 w-3 mr-1.5" />
              Complete sprint
            </Button>
          )}
          {isCompleted && (
            <span className="text-[11px] font-bold text-muted-foreground">Sprint closed</span>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="divide-y divide-border/10 bg-background/20">
          {tasks.map((task) => (
            <BacklogTaskItem key={task.id} task={task} onToggleStatus={onToggleStatus} />
          ))}

          {!isCompleted && showCreate ? (
            <InlineCreateForm
              inlineTitle={inlineTitle}
              onInlineTitleChange={onInlineTitleChange}
              onCancel={onCancelCreate}
              onCreate={onCreateInline}
            />
          ) : !isCompleted ? (
            <button
              onClick={onShowCreate}
              className="w-full p-4 flex items-center gap-3 text-sm text-muted-foreground hover:bg-secondary/30 transition-all opacity-60 hover:opacity-100 group/new"
            >
              <Plus className="h-4 w-4 group-hover/new:text-primary transition-colors" />
              <span className="font-medium group-hover/new:text-primary">Create issue</span>
            </button>
          ) : null}

          {tasks.length === 0 && !showCreate && (
            <EmptySection />
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Backlog Section ─────────────────────────────────────────────── */

function BacklogSection({
  expanded,
  onToggle,
  tasks,
  onToggleStatus,
  onCreateSprint,
  showCreate,
  onShowCreate,
  onCancelCreate,
  inlineTitle,
  onInlineTitleChange,
  onCreateInline,
}: {
  expanded: boolean
  onToggle: () => void
  tasks: Task[]
  onToggleStatus: (id: string, s: TaskStatus) => void
  onCreateSprint: () => void
  showCreate: boolean
  onShowCreate: () => void
  onCancelCreate: () => void
  inlineTitle: string
  onInlineTitleChange: (v: string) => void
  onCreateInline: () => void
}) {
  return (
    <div
      className={cn(
        "jira-panel bg-secondary/10 border-none overflow-hidden transition-all",
        expanded ? "min-h-[100px]" : "h-[48px]"
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-border/20 group hover:bg-secondary/20 transition-all cursor-pointer">
        <div className="flex items-center gap-3" onClick={onToggle}>
          <button className="h-5 w-5 flex items-center justify-center rounded-sm hover:bg-secondary transition-colors">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-foreground/90 uppercase tracking-widest">Backlog</h3>
            <span className="text-[11px] font-medium text-muted-foreground opacity-60">
              ({tasks.length} issue{tasks.length !== 1 ? "s" : ""})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 opacity-80 scale-90">
            <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold border-none">{tasks.length}</Badge>
          </div>
          <div className="h-4 w-px bg-border/40 mx-2" />
          <Button
            variant="outline"
            className="h-8 font-bold text-[11px] bg-secondary/50 rounded-sm border-border/40 hover:bg-secondary/80"
            onClick={onCreateSprint}
          >
            <Plus className="h-3 w-3 mr-1.5" />
            Create sprint
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="divide-y divide-border/10 bg-background/20">
          {tasks.map((task) => (
            <BacklogTaskItem key={task.id} task={task} onToggleStatus={onToggleStatus} />
          ))}

          {showCreate ? (
            <InlineCreateForm
              inlineTitle={inlineTitle}
              onInlineTitleChange={onInlineTitleChange}
              onCancel={onCancelCreate}
              onCreate={onCreateInline}
            />
          ) : (
            <button
              onClick={onShowCreate}
              className="w-full p-4 flex items-center gap-3 text-sm text-muted-foreground hover:bg-secondary/30 transition-all opacity-60 hover:opacity-100 group/new"
            >
              <Plus className="h-4 w-4 group-hover/new:text-primary transition-colors" />
              <span className="font-medium group-hover/new:text-primary">Create issue</span>
            </button>
          )}

          {tasks.length === 0 && !showCreate && <EmptySection />}
        </div>
      )}
    </div>
  )
}

/* ─── Shared Components ───────────────────────────────────────────── */

function InlineCreateForm({
  inlineTitle,
  onInlineTitleChange,
  onCancel,
  onCreate,
}: {
  inlineTitle: string
  onInlineTitleChange: (v: string) => void
  onCancel: () => void
  onCreate: () => void
}) {
  return (
    <div className="p-3 bg-background border-2 border-primary mx-3 my-2 rounded-sm shadow-xl animate-in zoom-in-95 duration-150">
      <input
        autoFocus
        value={inlineTitle}
        onChange={(e) => onInlineTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel()
          if (e.key === "Enter") onCreate()
        }}
        placeholder="What needs to be done?"
        className="w-full bg-transparent text-sm text-foreground outline-none mb-3 font-medium"
      />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-blue-600 rounded-sm flex items-center justify-center">
            <Play className="h-3 w-3 text-white fill-white translate-x-0.5" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" className="h-8 text-[11px] px-4 font-bold bg-primary text-white" onClick={onCreate}>
            Create
          </Button>
        </div>
      </div>
    </div>
  )
}

function EmptySection() {
  return (
    <div className="p-12 text-center opacity-30 select-none">
      <Layers className="h-10 w-10 mx-auto mb-4" />
      <p className="text-[12px] font-bold uppercase tracking-widest">Empty section</p>
      <p className="text-xs italic mt-1 font-medium">Drop issues here or create them inline</p>
    </div>
  )
}

function BacklogTaskItem({ task, onToggleStatus }: { task: Task; onToggleStatus: (id: string, s: TaskStatus) => void }) {
  const statusCfg = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG] || TASK_STATUS_CONFIG.todo
  const typeCfg = ISSUE_TYPE_CONFIG[task.issue_type as keyof typeof ISSUE_TYPE_CONFIG] || ISSUE_TYPE_CONFIG.task

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 px-4 hover:bg-primary/5 transition-all group/item cursor-pointer",
        task.status === "done" && "opacity-60"
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        <input type="checkbox" checked={task.status === "done"} className="h-3.5 w-3.5 rounded-sm border-border cursor-pointer accent-primary" readOnly />
        <div className="h-4.5 w-4.5 rounded-[3px] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill={typeCfg.hex} className="h-4 w-4">
            <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
          </svg>
        </div>
        <span className="text-[11px] font-bold text-muted-foreground tracking-tighter uppercase min-w-[50px] group-hover/item:text-primary transition-colors">
          {task.issue_key}
        </span>
        <span
          className={cn(
            "text-sm font-semibold truncate text-foreground/90 group-hover/item:text-primary transition-colors",
            task.status === "done" && "line-through"
          )}
        >
          {task.title}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-[3px] border border-border/20 transition-all cursor-pointer select-none ring-primary/20 hover:ring-2",
            statusCfg.bgColor,
            statusCfg.color
          )}
          onClick={(e) => {
            e.stopPropagation()
            const next: TaskStatus =
              task.status === "todo" ? "in-progress" : task.status === "in-progress" ? "review" : task.status === "review" ? "done" : "todo"
            onToggleStatus(task.id, next)
          }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest">{statusCfg.label}</span>
          <ChevronDown className="h-3 w-3 opacity-40 group-hover/item:opacity-100 transition-opacity" />
        </div>

        <div className="flex items-center gap-3 opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <div className="h-6 w-px bg-border/40 mx-1" />
          <div className="h-6 w-16 bg-secondary/40 rounded-[2px] border border-border/20 flex items-center justify-center text-[10px] font-black text-muted-foreground">
            —
          </div>
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-blue-600 text-[8px] text-white font-bold">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" })
}
