import { useState, useMemo, useCallback, memo, useRef, useEffect } from "react"
import {
  Minus, Plus, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Filter as FilterIcon, Settings2, MoreHorizontal, Search, Zap,
  CheckSquare, Bug, BookOpen, GitBranch, GripVertical,
} from "lucide-react"
import { JiraWorkspaceFrame } from "@/components/jira/JiraWorkspaceFrame"
import { useProjectContext } from "@/store/project-context"
import { useSprints } from "@/hooks/useSprints"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useDebounce } from "@/hooks/useDebounce"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TASK_STATUS_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import { cn } from "@/lib/utils"
import type { Task } from "@/types"

// ────────────────────────────────────────────────────────────────────────────
// Types & Constants
// ────────────────────────────────────────────────────────────────────────────

type ZoomLevel = "weeks" | "months" | "quarters"

const ZOOM_LEVELS: ZoomLevel[] = ["weeks", "months", "quarters"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const ISSUE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  epic: Zap, story: BookOpen, task: CheckSquare, bug: Bug, subtask: GitBranch,
}

const BAR_COLORS = [
  "from-purple-500 to-purple-600", "from-blue-500 to-blue-600", "from-green-500 to-green-600",
  "from-orange-500 to-orange-600", "from-pink-500 to-pink-600", "from-cyan-500 to-cyan-600",
]

// ────────────────────────────────────────────────────────────────────────────
// Main Component — uses useMemo, useCallback, useLocalStorage, useDebounce
// ────────────────────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const { selectedProject, projects, isLoading } = useProjectContext()
  const project = selectedProject ?? projects[0] ?? null
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { data: sprints = [] } = useSprints(project?.id)

  // Persisted preferences
  const [zoom, setZoom] = useLocalStorage<ZoomLevel>("jira-timeline-zoom", "months")
  const [collapsed, setCollapsed] = useLocalStorage<Record<string, boolean>>("jira-timeline-collapsed", {})

  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [currentOffset, setCurrentOffset] = useState(0) // month offset from current

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [setCollapsed])

  // Compute timeline data with useMemo
  const { epics, orphanTasks, timelineMonths } = useMemo(() => {
    if (!project) return { epics: [], orphanTasks: [], timelineMonths: [] }

    const tasks = project.tasks ?? []
    const q = debouncedQuery.toLowerCase()

    // Group tasks by epic
    const epicTasks = tasks.filter((t) => t.issue_type === "epic")
    const grouped = epicTasks.map((epic) => ({
      epic,
      children: tasks.filter((t) =>
        t.epic_id === epic.id && t.issue_type !== "epic" &&
        (!q || t.title.toLowerCase().includes(q) || t.issue_key?.toLowerCase().includes(q)),
      ),
    })).filter((g) => !q || g.children.length > 0 || g.epic.title.toLowerCase().includes(q))

    // Tasks not in any epic
    const epicIds = new Set(epicTasks.map((e) => e.id))
    const orphans = tasks.filter((t) =>
      t.issue_type !== "epic" && (!t.epic_id || !epicIds.has(t.epic_id)) &&
      (!q || t.title.toLowerCase().includes(q) || t.issue_key?.toLowerCase().includes(q)),
    )

    // Generate months for the timeline header
    const now = new Date()
    const monthCount = zoom === "weeks" ? 6 : zoom === "months" ? 12 : 16
    const months = Array.from({ length: monthCount }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + currentOffset + i - 2, 1)
      return { month: d.getMonth(), year: d.getFullYear(), label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` }
    })

    return { epics: grouped, orphanTasks: orphans, timelineMonths: months }
  }, [project, debouncedQuery, zoom, currentOffset])

  if (isLoading) {
    return (
      <JiraWorkspaceFrame tab="timeline">
        <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-[600px] w-full" /></div>
      </JiraWorkspaceFrame>
    )
  }

  return (
    <JiraWorkspaceFrame tab="timeline">
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative group max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timeline..."
              className="h-9 w-full rounded-md border border-border bg-input pl-10 pr-4 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <Button variant="ghost" className="h-9 text-muted-foreground font-semibold px-2 text-sm">
            <FilterIcon className="h-4 w-4 mr-2" />Filter
          </Button>
          <div className="flex-1" />

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentOffset((o) => o - 3)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs font-bold" onClick={() => setCurrentOffset(0)}>
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentOffset((o) => o + 3)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 border border-border rounded-md p-0.5 bg-secondary/20">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { const i = ZOOM_LEVELS.indexOf(zoom); if (i > 0) setZoom(ZOOM_LEVELS[i - 1]) }}>
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] font-bold text-muted-foreground px-2 min-w-[60px] text-center capitalize">{zoom}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { const i = ZOOM_LEVELS.indexOf(zoom); if (i < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[i + 1]) }}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Settings2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 border border-border/40 rounded-lg overflow-hidden bg-card flex flex-col relative min-h-[500px] shadow-sm">
          {/* Header Row */}
          <div className="flex border-b border-border/40 bg-secondary/20 text-[10px] font-black text-muted-foreground uppercase tracking-widest sticky top-0 z-20">
            <div className="w-72 shrink-0 p-3 border-r border-border/40 bg-card flex items-center justify-between">
              <span>Work</span>
              <span className="text-[9px] font-medium normal-case tracking-normal text-muted-foreground/60">
                {epics.length + orphanTasks.length} items
              </span>
            </div>
            <div className="flex-1 flex divide-x divide-border/20 overflow-hidden">
              {timelineMonths.map((m, i) => {
                const isCurrentMonth = m.month === new Date().getMonth() && m.year === new Date().getFullYear()
                return (
                  <div key={i} className={cn("flex-1 p-3 text-center min-w-[80px]", isCurrentMonth && "bg-primary/5 text-primary")}>
                    {m.label}
                    {isCurrentMonth && <div className="h-0.5 w-full bg-primary/50 mt-1 rounded-full" />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sprint bars row */}
          {sprints.length > 0 && (
            <div className="flex border-b border-border/30 bg-secondary/5">
              <div className="w-72 shrink-0 p-2.5 border-r border-border/40 bg-card text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Sprints
              </div>
              <div className="flex-1 relative h-8">
                {sprints.filter((s) => s.start_date || s.status === "active").map((sprint) => {
                  const startMonth = timelineMonths[0]
                  const totalMonthSpan = timelineMonths.length
                  const sprintStart = sprint.start_date ? new Date(sprint.start_date) : new Date()
                  const sprintEnd = sprint.end_date ? new Date(sprint.end_date) : new Date(sprintStart.getTime() + 14 * 86400000)
                  const rangeStart = new Date(startMonth.year, startMonth.month, 1)
                  const rangeEnd = new Date(timelineMonths[totalMonthSpan - 1].year, timelineMonths[totalMonthSpan - 1].month + 1, 0)
                  const totalDays = (rangeEnd.getTime() - rangeStart.getTime()) / 86400000
                  const leftDays = Math.max(0, (sprintStart.getTime() - rangeStart.getTime()) / 86400000)
                  const widthDays = Math.min(totalDays - leftDays, (sprintEnd.getTime() - sprintStart.getTime()) / 86400000)
                  const leftPct = (leftDays / totalDays) * 100
                  const widthPct = Math.max(3, (widthDays / totalDays) * 100)
                  const isActive = sprint.status === "active"
                  return (
                    <Tooltip key={sprint.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 h-5 rounded-[3px] flex items-center px-2 text-[9px] font-bold text-white truncate cursor-pointer transition-all hover:brightness-110",
                            isActive ? "bg-green-600 shadow-sm shadow-green-600/30" : "bg-teal-700/70 border border-teal-600/50",
                          )}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: "60px" }}
                        >
                          {sprint.name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-bold">{sprint.name}</p>
                        <p className="text-muted-foreground capitalize">{sprint.status}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Background grid lines */}
            <div className="absolute inset-0 flex divide-x divide-border/5 pointer-events-none" style={{ left: isMobile ? "200px" : "288px" }}>
              {timelineMonths.map((_, i) => <div key={i} className="flex-1" />)}
            </div>

            {/* Epic Groups */}
            {epics.map((group, gi) => (
              <TimelineEpicGroup
                key={group.epic.id}
                epic={group.epic}
                children={group.children}
                collapsed={collapsed[group.epic.id] ?? false}
                onToggle={() => toggleCollapse(group.epic.id)}
                colorIndex={gi}
                monthCount={timelineMonths.length}
              />
            ))}

            {/* Orphan Tasks */}
            {orphanTasks.length > 0 && (
              <div>
                <div className="flex border-b border-border/20 bg-secondary/5">
                  <div className="w-72 shrink-0 p-3 border-r border-border/40 bg-card">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Unassigned</span>
                    <span className="ml-2 text-[10px] text-muted-foreground/50">({orphanTasks.length})</span>
                  </div>
                  <div className="flex-1" />
                </div>
                {orphanTasks.map((task) => (
                  <TimelineTaskRow key={task.id} task={task} colorIndex={epics.length} monthCount={timelineMonths.length} />
                ))}
              </div>
            )}

            {/* Empty */}
            {epics.length === 0 && orphanTasks.length === 0 && (
              <div className="p-16 text-center">
                <Zap className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">No items on the timeline</p>
                <p className="text-xs text-muted-foreground/30 mt-1">Create epics or assign due dates to see them here</p>
              </div>
            )}
          </div>

          {/* Footer legend + zoom */}
          <div className="p-3 border-t border-border/40 bg-secondary/10 flex items-center justify-between z-10">
            <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase">
              <div className="flex items-center gap-2"><div className="h-3 w-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" /> Epic</div>
              <div className="flex items-center gap-2"><div className="h-3 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" /> Task / Story</div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-red-500" /> Today</div>
            </div>
            <div className="flex items-center gap-1 border border-border rounded-md p-0.5 bg-background">
              <Button variant="ghost" size="sm" className="h-7 text-[11px] font-bold px-3" onClick={() => setCurrentOffset(0)}>Today</Button>
              {ZOOM_LEVELS.map((level) => (
                <Button
                  key={level}
                  variant={zoom === level ? "outline" : "ghost"}
                  size="sm"
                  className={cn("h-7 text-[11px] font-bold px-3 capitalize", zoom === level && "bg-primary/10 text-primary border-primary/30")}
                  onClick={() => setZoom(level)}
                >{level}</Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </JiraWorkspaceFrame>
  )
}

// ── React.memo — Epic Group ────────────────────────────────────────────────

interface TimelineEpicGroupProps {
  epic: Task
  children: Task[]
  collapsed: boolean
  onToggle: () => void
  colorIndex: number
  monthCount: number
}

const TimelineEpicGroup = memo(function TimelineEpicGroup({
  epic, children, collapsed, onToggle, colorIndex, monthCount,
}: TimelineEpicGroupProps) {
  const barColor = BAR_COLORS[colorIndex % BAR_COLORS.length]
  const statusCfg = TASK_STATUS_CONFIG[epic.status as keyof typeof TASK_STATUS_CONFIG] ?? TASK_STATUS_CONFIG.todo

  return (
    <div className="border-b border-border/10">
      {/* Epic row */}
      <div className="flex group hover:bg-primary/5 transition-all cursor-pointer" onClick={onToggle}>
        <div className="w-72 shrink-0 p-3 border-r border-border/40 bg-card z-10 flex items-center gap-2">
          <button className="h-5 w-5 flex items-center justify-center rounded hover:bg-secondary transition-colors shrink-0">
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <Zap className="h-4 w-4 text-purple-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{epic.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{epic.issue_key}</span>
              <Badge className={cn("h-4 text-[8px] font-black uppercase px-1.5 border-none", statusCfg.bgColor, statusCfg.color)}>
                {statusCfg.label}
              </Badge>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground/50 font-medium shrink-0">{children.length}</span>
        </div>
        <div className="flex-1 relative p-3">
          <div
            className={cn("absolute top-1/2 -translate-y-1/2 h-7 rounded-full bg-gradient-to-r shadow-lg flex items-center px-3 transition-all hover:scale-[1.02]", barColor)}
            style={{ left: `${10 + (colorIndex * 5) % 30}%`, right: `${20 + (colorIndex * 7) % 40}%`, minWidth: "100px" }}
          >
            <span className="text-[10px] font-bold text-white/90 truncate">{epic.title}</span>
          </div>
        </div>
      </div>

      {/* Child tasks */}
      {!collapsed && children.map((task) => (
        <TimelineTaskRow key={task.id} task={task} colorIndex={colorIndex} monthCount={monthCount} indent />
      ))}
    </div>
  )
})

// ── React.memo — Task Row ─────────────────────────────────────────────────

interface TimelineTaskRowProps {
  task: Task
  colorIndex: number
  monthCount: number
  indent?: boolean
}

const TimelineTaskRow = memo(function TimelineTaskRow({ task, colorIndex, indent }: TimelineTaskRowProps) {
  const TypeIcon = ISSUE_TYPE_ICONS[task.issue_type] || CheckSquare
  const typeCfg = ISSUE_TYPE_CONFIG[task.issue_type as keyof typeof ISSUE_TYPE_CONFIG] ?? ISSUE_TYPE_CONFIG.task
  const barColor = BAR_COLORS[(colorIndex + 1) % BAR_COLORS.length]

  // Deterministic position based on task id hash
  const hash = task.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  const left = 5 + (hash % 40)
  const width = 10 + (hash % 25)

  return (
    <div className="flex group hover:bg-primary/3 transition-all">
      <div className={cn("w-72 shrink-0 py-2 border-r border-border/40 bg-card z-10 flex items-center gap-2", indent ? "pl-10 pr-3" : "px-3")}>
        {indent && <GripVertical className="h-3 w-3 text-muted-foreground/20 shrink-0" />}
        <TypeIcon className="h-3.5 w-3.5 shrink-0" style={{ color: typeCfg.hex }} />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-foreground/80 truncate group-hover:text-primary transition-colors">{task.title}</p>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter shrink-0">{task.issue_key}</span>
      </div>
      <div className="flex-1 relative py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn("absolute top-1/2 -translate-y-1/2 h-5 rounded-full bg-gradient-to-r opacity-70 hover:opacity-100 transition-all hover:scale-y-125 cursor-pointer", barColor)}
              style={{ left: `${left}%`, width: `${width}%`, minWidth: "40px" }}
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p className="font-bold">{task.title}</p>
            <p className="text-muted-foreground">{task.issue_key} · {task.status}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
})
