import {
  useState, useCallback, useRef, useReducer, useTransition,
  useDeferredValue, memo, forwardRef, useImperativeHandle,
} from "react"
import {
  DragDropContext, Droppable, Draggable, type DropResult,
} from "@hello-pangea/dnd"
import {
  ArrowDown, ArrowRight, ArrowUp, BookOpen, Bug, CheckSquare,
  ChevronsUp, GitBranch, Plus, Search, Zap, MoreHorizontal,
  Settings2, Filter as FilterIcon, Table as TableIcon, X,
  Undo2, Redo2, Clock, Tag, User as UserIcon, AlertCircle,
} from "lucide-react"
import { JiraWorkspaceFrame } from "@/components/jira/JiraWorkspaceFrame"
import { TaskDetailDrawer } from "@/components/shared/TaskDetailDrawer"
import { useProjectContext } from "@/store/project-context"
import { useUpdateTask, useCreateTask } from "@/hooks/useTasks"
import { useDebounce } from "@/hooks/useDebounce"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useUndoRedo } from "@/hooks/useUndoRedo"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { usePrevious } from "@/hooks/usePrevious"
import { cn } from "@/lib/utils"
import { TASK_PRIORITY_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import type { Task, TaskStatus, IssueType, TaskPriority } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip"

// ────────────────────────────────────────────────────────────────────────────
// Types & Constants
// ────────────────────────────────────────────────────────────────────────────

interface ColumnDef {
  key: string
  title: string
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: "todo", title: "TO DO" },
  { key: "in-progress", title: "IN PROGRESS" },
  { key: "review", title: "IN REVIEW" },
  { key: "done", title: "DONE" },
]

const ISSUE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  bug: Bug, story: BookOpen, task: CheckSquare, epic: Zap, subtask: GitBranch,
}

const PRIORITY_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  urgent: ChevronsUp, high: ArrowUp, medium: ArrowRight, low: ArrowDown,
}

// ────────────────────────────────────────────────────────────────────────────
// useReducer — Board Filter State (complex state with discriminated unions)
// ────────────────────────────────────────────────────────────────────────────

interface BoardFilters {
  searchQuery: string
  issueTypes: IssueType[]
  priorities: TaskPriority[]
  assignee: string | null
  showSubtasks: boolean
  groupBy: "none" | "assignee" | "priority" | "type"
}

type BoardFilterAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "TOGGLE_ISSUE_TYPE"; payload: IssueType }
  | { type: "TOGGLE_PRIORITY"; payload: TaskPriority }
  | { type: "SET_ASSIGNEE"; payload: string | null }
  | { type: "TOGGLE_SUBTASKS" }
  | { type: "SET_GROUP_BY"; payload: BoardFilters["groupBy"] }
  | { type: "CLEAR_FILTERS" }

const initialFilters: BoardFilters = {
  searchQuery: "", issueTypes: [], priorities: [], assignee: null, showSubtasks: true, groupBy: "none",
}

function boardFilterReducer(state: BoardFilters, action: BoardFilterAction): BoardFilters {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload }
    case "TOGGLE_ISSUE_TYPE":
      return { ...state, issueTypes: state.issueTypes.includes(action.payload) ? state.issueTypes.filter((t) => t !== action.payload) : [...state.issueTypes, action.payload] }
    case "TOGGLE_PRIORITY":
      return { ...state, priorities: state.priorities.includes(action.payload) ? state.priorities.filter((p) => p !== action.payload) : [...state.priorities, action.payload] }
    case "SET_ASSIGNEE":
      return { ...state, assignee: action.payload }
    case "TOGGLE_SUBTASKS":
      return { ...state, showSubtasks: !state.showSubtasks }
    case "SET_GROUP_BY":
      return { ...state, groupBy: action.payload }
    case "CLEAR_FILTERS":
      return { ...initialFilters }
    default:
      return state
  }
}

// ────────────────────────────────────────────────────────────────────────────
// forwardRef + useImperativeHandle — Exposes board API to parent
// ────────────────────────────────────────────────────────────────────────────

export interface BoardHandle {
  resetFilters: () => void
  focusSearch: () => void
  getActiveFiltersCount: () => number
}

const BoardPageInner = forwardRef<BoardHandle>(function BoardPageInner(_, ref) {
  const { selectedProject, projects, isLoading } = useProjectContext()
  const updateTask = useUpdateTask()
  const createTask = useCreateTask()

  // ── useReducer for complex filter state ──
  const [filters, dispatch] = useReducer(boardFilterReducer, initialFilters)

  // ── useTransition — marks search as non-blocking ──
  const [isSearchPending, startTransition] = useTransition()

  // ── useDeferredValue — defers filtered list for smooth rendering ──
  const debouncedSearch = useDebounce(filters.searchQuery, 250)
  const deferredSearch = useDeferredValue(debouncedSearch)

  // ── useLocalStorage — persist column layout ──
  const [columnDefs, setColumnDefs] = useLocalStorage<ColumnDef[]>("jira-board-columns", DEFAULT_COLUMNS)

  // ── useUndoRedo — undo/redo task moves ──
  const { state: moveHistory, set: recordMove, undo: undoMove, canUndo, canRedo } = useUndoRedo<{ taskId: string; from: string; to: string } | null>(null)

  // ── usePrevious — track previous project for transition ──
  const previousProject = usePrevious(selectedProject)
  const projectChanged = previousProject?.id !== selectedProject?.id

  // ── useMediaQuery — responsive layout ──
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [showCreateInline, setShowCreateInline] = useState<string | null>(null)
  const [inlineTitle, setInlineTitle] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const addColumnInputRef = useRef<HTMLInputElement>(null)

  const project = selectedProject ?? projects[0] ?? null

  // ── useImperativeHandle — expose board API ──
  useImperativeHandle(ref, () => ({
    resetFilters: () => dispatch({ type: "CLEAR_FILTERS" }),
    focusSearch: () => searchRef.current?.focus(),
    getActiveFiltersCount: () => {
      let count = 0
      if (filters.searchQuery) count++
      count += filters.issueTypes.length + filters.priorities.length
      if (filters.assignee) count++
      return count
    },
  }), [filters])

  const handleAddColumn = useCallback(() => {
    const title = newColumnTitle.trim()
    if (!title) return
    const key = title.toLowerCase().replace(/\s+/g, "-")
    if (columnDefs.some((c) => c.key === key)) return
    setColumnDefs((prev) => [...prev, { key, title: title.toUpperCase() }])
    setNewColumnTitle("")
    setShowAddColumn(false)
  }, [newColumnTitle, columnDefs, setColumnDefs])

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination || !project) return
      const newStatus = result.destination.droppableId
      const taskId = result.draggableId
      if (newStatus === result.source.droppableId) return
      const fromStatus = result.source.droppableId
      recordMove({ taskId, from: fromStatus, to: newStatus })
      // Optimistic update is handled by useUpdateTask's onMutate.
      // On error, it will rollback automatically and show a toast.
      updateTask.mutate({ projectId: project.id, taskId, data: { status: newStatus as TaskStatus } })
    },
    [project, updateTask, recordMove],
  )

  const handleUndoMove = useCallback(() => {
    if (!canUndo || !project || !moveHistory) return
    updateTask.mutate({ projectId: project.id, taskId: moveHistory.taskId, data: { status: moveHistory.from as TaskStatus } })
    undoMove()
  }, [canUndo, project, moveHistory, updateTask, undoMove])

  const handleCreateInline = useCallback(async (status: string) => {
    if (!project || !inlineTitle.trim()) return
    await createTask.mutateAsync({
      projectId: project.id,
      data: { title: inlineTitle, status: status as TaskStatus, issue_type: "task", priority: "medium" },
    })
    setInlineTitle("")
    setShowCreateInline(null)
  }, [project, inlineTitle, createTask])

  if (isLoading) {
    return <JiraWorkspaceFrame tab="board"><BoardSkeleton /></JiraWorkspaceFrame>
  }

  // Filter tasks using deferred value (React 19 concurrent)
  const allTasks = project?.tasks ?? []
  const filteredTasks = allTasks.filter((task) => {
    if (deferredSearch) {
      const q = deferredSearch.toLowerCase()
      if (!task.title.toLowerCase().includes(q) && !task.issue_key?.toLowerCase().includes(q)) return false
    }
    if (filters.issueTypes.length > 0 && !filters.issueTypes.includes(task.issue_type as IssueType)) return false
    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority as TaskPriority)) return false
    if (filters.assignee && task.assignee !== filters.assignee) return false
    if (!filters.showSubtasks && task.issue_type === "subtask") return false
    return true
  })

  const activeFilterCount = filters.issueTypes.length + filters.priorities.length + (filters.assignee ? 1 : 0)
  const columns = columnDefs.map((col) => ({ ...col, tasks: filteredTasks.filter((t) => t.status === col.key) }))
  const assignees = [...new Set(allTasks.map((t) => t.assignee).filter(Boolean))]

  return (
    <JiraWorkspaceFrame tab="board">
      <div className={cn("flex flex-col h-full bg-background/50 overflow-hidden", projectChanged && "animate-in fade-in duration-300")}>
        {/* ── Toolbar ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 bg-background/80 backdrop-blur-md p-1.5 rounded-lg border border-border/30 shrink-0">
          <div className="relative group max-w-xs w-full">
            <Search className={cn("absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-all", isSearchPending ? "text-primary animate-pulse" : "text-muted-foreground group-focus-within:text-primary")} />
            <input
              ref={searchRef}
              value={filters.searchQuery}
              onChange={(e) => { const v = e.target.value; startTransition(() => dispatch({ type: "SET_SEARCH", payload: v })) }}
              placeholder="Search board..."
              className="h-9 w-full rounded-md border border-border bg-input pl-10 pr-4 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
            {isSearchPending && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="h-3.5 w-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
          </div>

          <div className="flex -space-x-1.5 ml-1">
            {assignees.slice(0, 3).map((name, i) => (
              <Tooltip key={name}>
                <TooltipTrigger asChild>
                  <button onClick={() => dispatch({ type: "SET_ASSIGNEE", payload: filters.assignee === name ? null : (name ?? null) })} className={cn("transition-all", filters.assignee === name && "ring-2 ring-primary rounded-full")}>
                    <Avatar className="h-8 w-8 ring-2 ring-background border-none shadow-sm">
                      <AvatarFallback className={cn("text-[10px] text-white font-bold", i === 0 ? "bg-blue-600" : i === 1 ? "bg-orange-500" : "bg-green-600")}>
                        {name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{name}</TooltipContent>
              </Tooltip>
            ))}
            <button className="h-8 w-8 rounded-full ring-2 ring-background border-none bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all">
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          <Button variant={showFilters ? "secondary" : "ghost"} className={cn("h-9 font-bold px-3 text-sm", showFilters && "bg-primary/10 text-primary")} onClick={() => setShowFilters(!showFilters)}>
            <FilterIcon className="h-4 w-4 mr-2" />Filter
            {activeFilterCount > 0 && <span className="ml-1.5 h-5 min-w-[20px] px-1 rounded-full bg-primary text-[10px] text-primary-foreground font-black flex items-center justify-center animate-in zoom-in duration-200">{activeFilterCount}</span>}
          </Button>

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 ml-1">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", canUndo ? "text-foreground" : "text-muted-foreground/30")} onClick={handleUndoMove} disabled={!canUndo}><Undo2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-xs">Undo move</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", canRedo ? "text-foreground" : "text-muted-foreground/30")} disabled={!canRedo}><Redo2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent side="bottom" className="text-xs">Redo move</TooltipContent></Tooltip>
          </div>

          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground mr-2"><span className="font-mono font-bold">{filteredTasks.length}</span><span>issues</span></div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-secondary/50"><TableIcon className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-secondary/50"><Settings2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-secondary/50"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* ── Filter Panel ───────────────────────────────────────── */}
        {showFilters && <div className="shrink-0 mt-3"><FilterPanel filters={filters} dispatch={dispatch} assignees={assignees} /></div>}

        {/* ── Board Columns ──────────────────────────────────────── */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={cn("flex gap-3 overflow-x-auto flex-1 min-h-0 mt-3 pb-2", isMobile && "gap-2")}>
            {columns.map((column) => (
              <BoardColumn key={column.key} column={column} isMobile={isMobile}
                showCreateInline={showCreateInline === column.key} inlineTitle={inlineTitle}
                onShowCreate={() => setShowCreateInline(column.key)} onCancelCreate={() => setShowCreateInline(null)}
                onInlineTitleChange={setInlineTitle} onCreateInline={() => handleCreateInline(column.key)}
                onTaskClick={(task) => { setSelectedTask(task); setDrawerOpen(true) }}
              />
            ))}

            {showAddColumn ? (
              <div className="flex-shrink-0 w-72 rounded-lg bg-secondary/20 p-3 border border-primary/20 h-fit animate-in slide-in-from-right-5 duration-200">
                <input ref={addColumnInputRef} autoFocus value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddColumn(); if (e.key === "Escape") { setShowAddColumn(false); setNewColumnTitle("") } }}
                  placeholder="Column name..." className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 mb-2" />
                <div className="flex gap-2">
                  <Button size="sm" className="h-8 text-[11px] px-4 font-bold bg-primary text-white" onClick={handleAddColumn}>Add</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowAddColumn(false); setNewColumnTitle("") }}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddColumn(true)} className="flex-shrink-0 w-72 h-12 rounded-lg bg-secondary/10 border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-secondary/20 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all group">
                <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />Add column
              </button>
            )}
          </div>
        </DragDropContext>
      </div>

      <TaskDetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} task={selectedTask} projectId={project?.id ?? ""} />
    </JiraWorkspaceFrame>
  )
})

// ────────────────────────────────────────────────────────────────────────────
// React.memo — Filter Panel
// ────────────────────────────────────────────────────────────────────────────

const FilterPanel = memo(function FilterPanel({ filters, dispatch, assignees }: { filters: BoardFilters; dispatch: React.Dispatch<BoardFilterAction>; assignees: (string | undefined)[] }) {
  const issueTypes: IssueType[] = ["epic", "story", "task", "bug", "subtask"]
  const priorities: TaskPriority[] = ["urgent", "high", "medium", "low"]

  return (
    <div className="bg-secondary/10 border border-border/30 rounded-lg p-4 animate-in slide-in-from-top-2 fade-in duration-300 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Filters</h3>
        <Button variant="ghost" size="sm" className="h-7 text-[11px] font-bold text-muted-foreground hover:text-destructive" onClick={() => dispatch({ type: "CLEAR_FILTERS" })}>
          <X className="h-3 w-3 mr-1" /> Clear all
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><Tag className="h-3 w-3" /> Type</label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {issueTypes.map((type) => { const cfg = ISSUE_TYPE_CONFIG[type]; const active = filters.issueTypes.includes(type); return (
              <button key={type} onClick={() => dispatch({ type: "TOGGLE_ISSUE_TYPE", payload: type })}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border", active ? "bg-primary/15 text-primary border-primary/30 shadow-sm" : "bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/60")}>{cfg.label}</button>
            )})}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertCircle className="h-3 w-3" /> Priority</label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {priorities.map((priority) => { const cfg = TASK_PRIORITY_CONFIG[priority]; const active = filters.priorities.includes(priority); return (
              <button key={priority} onClick={() => dispatch({ type: "TOGGLE_PRIORITY", payload: priority })}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border", active ? "border-primary/30 shadow-sm" : "bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/60")}
                style={active ? { backgroundColor: `${cfg.hex}20`, color: cfg.hex } : undefined}>{cfg.label}</button>
            )})}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><UserIcon className="h-3 w-3" /> Assignee</label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {assignees.map((name) => (
              <button key={name} onClick={() => dispatch({ type: "SET_ASSIGNEE", payload: filters.assignee === name ? null : (name ?? null) })}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border", filters.assignee === name ? "bg-primary/15 text-primary border-primary/30 shadow-sm" : "bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/60")}>{name}</button>
            ))}
            {assignees.length === 0 && <span className="text-[11px] text-muted-foreground/50 italic">No assignees</span>}
          </div>
        </div>
      </div>
    </div>
  )
})

// ────────────────────────────────────────────────────────────────────────────
// React.memo — Board Column
// ────────────────────────────────────────────────────────────────────────────

interface BoardColumnProps {
  column: ColumnDef & { tasks: Task[] }; isMobile: boolean; showCreateInline: boolean; inlineTitle: string
  onShowCreate: () => void; onCancelCreate: () => void; onInlineTitleChange: (v: string) => void; onCreateInline: () => void; onTaskClick: (task: Task) => void
}

const BoardColumn = memo(function BoardColumn({ column, isMobile, showCreateInline, inlineTitle, onShowCreate, onCancelCreate, onInlineTitleChange, onCreateInline, onTaskClick }: BoardColumnProps) {
  return (
    <Droppable droppableId={column.key}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps}
          className={cn("flex-shrink-0 rounded-lg bg-secondary/15 p-2 flex flex-col max-h-full border border-transparent transition-colors duration-200", isMobile ? "w-64" : "w-72", snapshot.isDraggingOver && "bg-primary/5 border-primary/20")}>
          <ColumnHeader title={column.title} count={column.tasks.length} status={column.key} />
          <div className="space-y-1.5 flex-1 min-h-0 scrollbar-thin overflow-y-auto px-0.5 py-1">
            {column.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(dp, ds) => (<div ref={dp.innerRef} {...dp.draggableProps} {...dp.dragHandleProps} style={{ ...dp.draggableProps.style, ...(ds.isDragging ? { zIndex: 9999 } : {}) }} onClick={() => !ds.isDragging && onTaskClick(task)}><BoardCard task={task} isDragging={ds.isDragging} /></div>)}
              </Draggable>
            ))}
            {provided.placeholder}
            {showCreateInline ? (
              <InlineCreate inlineTitle={inlineTitle} onInlineTitleChange={onInlineTitleChange} onCancel={onCancelCreate} onCreate={onCreateInline} />
            ) : (
              <button onClick={onShowCreate} className="w-full p-2.5 flex items-center gap-2.5 text-sm text-muted-foreground hover:bg-secondary/40 rounded-md transition-all group/create opacity-50 hover:opacity-100">
                <Plus className="h-4 w-4 group-hover/create:text-primary transition-colors" /><span className="font-medium">Create issue</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Droppable>
  )
})

// ────────────────────────────────────────────────────────────────────────────
// React.memo — Column Header with animated count
// ────────────────────────────────────────────────────────────────────────────

const ColumnHeader = memo(function ColumnHeader({ title, count, status }: { title: string; count: number; status: string }) {
  const statusColor = status === "done" ? "bg-green-500" : status === "in-progress" ? "bg-blue-500" : status === "review" ? "bg-yellow-500" : "bg-slate-400"
  return (
    <div className="flex items-center justify-between px-2 py-2.5 mb-1 group/column">
      <div className="flex items-center gap-2.5">
        <div className={cn("h-2 w-2 rounded-full", statusColor)} />
        <span className="text-[11px] font-black text-muted-foreground/80 uppercase tracking-[0.15em]">{title}</span>
        <AnimatedCount value={count} />
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover/column:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>
    </div>
  )
})

function AnimatedCount({ value }: { value: number }) {
  const prev = usePrevious(value)
  const changed = prev !== undefined && prev !== value
  return (
    <span className={cn("h-5 min-w-[20px] px-1.5 rounded-full bg-secondary/80 text-[10px] font-black flex items-center justify-center text-muted-foreground border border-border/10 transition-all duration-300", changed && "animate-in zoom-in duration-300 bg-primary/20 text-primary")}>{value}</span>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// React.memo — Board Card (most frequently rendered)
// ────────────────────────────────────────────────────────────────────────────

const BoardCard = memo(function BoardCard({ task, isDragging }: { task: Task; isDragging: boolean }) {
  const TypeIcon = ISSUE_TYPE_ICONS[task.issue_type] || CheckSquare
  const PriorityIcon = PRIORITY_ICONS[task.priority] || ArrowRight
  const priorityCfg = TASK_PRIORITY_CONFIG[task.priority as keyof typeof TASK_PRIORITY_CONFIG] || TASK_PRIORITY_CONFIG.medium
  const typeCfg = ISSUE_TYPE_CONFIG[task.issue_type as keyof typeof ISSUE_TYPE_CONFIG] || ISSUE_TYPE_CONFIG.task
  const initials = task.assignee ? task.assignee.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : null

  return (
    <div className={cn("bg-background border border-border/40 rounded-lg p-3.5 cursor-pointer select-none group/card", isDragging ? "shadow-xl ring-2 ring-primary/30 border-primary/40 bg-card rotate-[1deg]" : "shadow-sm hover:shadow-md hover:border-primary/40 transition-shadow transition-colors duration-200")}>
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.slice(0, 3).map((label) => (<span key={label} className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary">{label}</span>))}
        </div>
      )}
      <p className="text-[13px] text-foreground font-semibold mb-3 leading-snug group-hover/card:text-primary transition-colors line-clamp-2">{task.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tooltip><TooltipTrigger asChild><div className="h-4 w-4 flex items-center justify-center shrink-0"><TypeIcon className="h-4 w-4" style={{ color: typeCfg.hex }} /></div></TooltipTrigger><TooltipContent side="bottom" className="text-xs">{typeCfg.label}</TooltipContent></Tooltip>
          <span className="text-[10px] font-bold text-muted-foreground/70 tracking-tight uppercase">{task.issue_key || "DEV-XX"}</span>
        </div>
        <div className="flex items-center gap-2">
          {task.story_points && <span className="h-5 min-w-[20px] px-1 rounded bg-secondary/60 text-[9px] font-bold text-muted-foreground flex items-center justify-center">{task.story_points}</span>}
          {task.due_date && <Tooltip><TooltipTrigger asChild><div className="flex items-center gap-0.5"><Clock className="h-3 w-3 text-muted-foreground/50" /></div></TooltipTrigger><TooltipContent side="bottom" className="text-xs">Due: {task.due_date}</TooltipContent></Tooltip>}
          <Tooltip><TooltipTrigger asChild><div className="h-4 w-4 flex items-center justify-center"><PriorityIcon className="h-3.5 w-3.5" style={{ color: priorityCfg.hex }} /></div></TooltipTrigger><TooltipContent side="bottom" className="text-xs">{priorityCfg.label} priority</TooltipContent></Tooltip>
          {initials ? (
            <Avatar className="h-6 w-6 ring-2 ring-background border-none shadow-sm"><AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-[8px] text-white font-bold">{initials}</AvatarFallback></Avatar>
          ) : (<div className="h-6 w-6 rounded-full border-2 border-dashed border-border/40" />)}
        </div>
      </div>
    </div>
  )
})

// ────────────────────────────────────────────────────────────────────────────
// Inline Create Form
// ────────────────────────────────────────────────────────────────────────────

function InlineCreate({ inlineTitle, onInlineTitleChange, onCancel, onCreate }: { inlineTitle: string; onInlineTitleChange: (v: string) => void; onCancel: () => void; onCreate: () => void }) {
  return (
    <div className="bg-background border-2 border-primary p-3 rounded-lg shadow-2xl animate-in zoom-in-95 duration-150 ring-4 ring-primary/5">
      <textarea autoFocus value={inlineTitle} rows={2} onChange={(e) => onInlineTitleChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") onCancel(); if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onCreate() } }}
        placeholder="What needs to be done?" className="w-full bg-transparent text-sm text-foreground outline-none mb-3 resize-none font-medium placeholder:font-normal" />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2"><div className="h-5 w-5 bg-blue-600 rounded-sm flex items-center justify-center"><CheckSquare className="h-3 w-3 text-white" /></div></div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold" onClick={onCancel}>Cancel</Button>
          <Button size="sm" className="h-8 text-[11px] px-4 font-bold bg-primary text-white" onClick={onCreate}>Create</Button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Board Skeleton
// ────────────────────────────────────────────────────────────────────────────

function BoardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (<div key={i} className="w-72 flex-shrink-0 space-y-3"><Skeleton className="h-6 w-32" />{Array.from({ length: 2 + i }, (_, j) => (<Skeleton key={j} className="h-24 w-full rounded-lg" />))}</div>))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Default Export
// ────────────────────────────────────────────────────────────────────────────

export default function BoardPage() {
  return <BoardPageInner />
}
