import { useMemo, useState } from "react"
import { useAllTasks } from "@/hooks/useTasks"
import { useProjects } from "@/hooks/useProjects"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import type { TaskStatus, TaskPriority, IssueType } from "@/types"
import { useAuth } from "@/store/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Filter,
  Search,
  Star,
  X,
  SlidersHorizontal,
} from "lucide-react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface SavedFilter {
  id: string
  name: string
  status: string
  priority: string
  type: string
  project: string
  starred: boolean
}

export default function FiltersPage() {
  const { data: allTasks, isLoading: tasksLoading } = useAllTasks()
  const { data: projects } = useProjects()
  const { user } = useAuth()

  const [savedFilters, setSavedFilters] = useLocalStorage<SavedFilter[]>("projecthub-saved-filters", [
    { id: "1", name: "My Open Tasks", status: "todo", priority: "all", type: "all", project: "all", starred: true },
    { id: "2", name: "High Priority Bugs", status: "all", priority: "high", type: "bug", project: "all", starred: true },
    { id: "3", name: "In Review", status: "review", priority: "all", type: "all", project: "all", starred: false },
  ])

  const [activeFilterId, setActiveFilterId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // Active filter form
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [filterName, setFilterName] = useState("")

  const applyFilter = (filter: SavedFilter) => {
    setActiveFilterId(filter.id)
    setStatusFilter(filter.status)
    setPriorityFilter(filter.priority)
    setTypeFilter(filter.type)
    setProjectFilter(filter.project)
  }

  const clearFilters = () => {
    setActiveFilterId(null)
    setStatusFilter("all")
    setPriorityFilter("all")
    setTypeFilter("all")
    setProjectFilter("all")
    setSearch("")
  }

  const saveFilter = () => {
    if (!filterName.trim()) return
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      status: statusFilter,
      priority: priorityFilter,
      type: typeFilter,
      project: projectFilter,
      starred: false,
    }
    setSavedFilters([...savedFilters, newFilter])
    setFilterName("")
    setActiveFilterId(newFilter.id)
  }

  const toggleStar = (filterId: string) => {
    setSavedFilters(
      savedFilters.map((f) =>
        f.id === filterId ? { ...f, starred: !f.starred } : f
      )
    )
  }

  const deleteFilter = (filterId: string) => {
    setSavedFilters(savedFilters.filter((f) => f.id !== filterId))
    if (activeFilterId === filterId) clearFilters()
  }

  const filteredTasks = useMemo(() => {
    if (!allTasks) return []
    let tasks = [...allTasks]

    if (statusFilter !== "all") tasks = tasks.filter((t) => t.status === statusFilter)
    if (priorityFilter !== "all") tasks = tasks.filter((t) => t.priority === priorityFilter)
    if (typeFilter !== "all") tasks = tasks.filter((t) => t.issue_type === typeFilter)
    if (projectFilter !== "all") tasks = tasks.filter((t) => t.project_id === projectFilter)
    if (search) {
      const q = search.toLowerCase()
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.issue_key.toLowerCase().includes(q)
      )
    }

    return tasks.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [allTasks, statusFilter, priorityFilter, typeFilter, projectFilter, search])

  const hasActiveFilters = statusFilter !== "all" || priorityFilter !== "all" || typeFilter !== "all" || projectFilter !== "all"

  if (tasksLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-60" />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cyan-500/10">
          <Filter className="h-5 w-5 text-cyan-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Filters</h1>
          <p className="text-sm text-muted-foreground">Save and apply custom task filters</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar - Saved Filters */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Saved Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {savedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className={`flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-colors text-sm ${
                    activeFilterId === filter.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary/30"
                  }`}
                  onClick={() => applyFilter(filter)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStar(filter.id)
                      }}
                      className="shrink-0"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          filter.starred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                    <span className="truncate">{filter.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFilter(filter.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save New Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Save Current Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Filter name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === "Enter" && saveFilter()}
              />
              <Button
                size="sm"
                className="w-full h-8 text-xs"
                onClick={saveFilter}
                disabled={!filterName.trim() || !hasActiveFilters}
              >
                Save Filter
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Filter Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {(Object.keys(TASK_STATUS_CONFIG) as TaskStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{TASK_STATUS_CONFIG[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {(Object.keys(TASK_PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                  <SelectItem key={p} value={p}>{TASK_PRIORITY_CONFIG[p].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(Object.keys(ISSUE_TYPE_CONFIG) as IssueType[]).map((t) => (
                  <SelectItem key={t} value={t}>{ISSUE_TYPE_CONFIG[t].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-xs">
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
            <Badge variant="outline" className="text-xs ml-auto">
              {filteredTasks.length} result{filteredTasks.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Results Table */}
          {filteredTasks.length > 0 ? (
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                    <TableHead className="w-[100px]">Key</TableHead>
                    <TableHead className="w-[80px]">Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[90px]">Priority</TableHead>
                    <TableHead className="w-[100px]">Assignee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.slice(0, 50).map((task) => (
                    <TableRow key={task.id} className="hover:bg-secondary/20">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {task.issue_key}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{
                            color: ISSUE_TYPE_CONFIG[task.issue_type]?.hex,
                            borderColor: ISSUE_TYPE_CONFIG[task.issue_type]?.hex + "40",
                          }}
                        >
                          {ISSUE_TYPE_CONFIG[task.issue_type]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium max-w-[300px] truncate">
                        {task.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-[10px]"
                          style={{
                            backgroundColor: TASK_STATUS_CONFIG[task.status]?.hex + "20",
                            color: TASK_STATUS_CONFIG[task.status]?.hex,
                          }}
                        >
                          {TASK_STATUS_CONFIG[task.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]" style={{ color: TASK_PRIORITY_CONFIG[task.priority]?.hex }}>
                          {TASK_PRIORITY_CONFIG[task.priority]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {task.assignee || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Filter className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">No tasks match the current filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
