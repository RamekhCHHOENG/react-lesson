import { useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAllTasks } from "@/hooks/useTasks"
import { useAuth } from "@/store/auth"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Inbox,
  Search,
  User,
  FolderOpen,
  Clock,
} from "lucide-react"

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

type QueueTab = "all" | "assigned" | "open"

export default function QueuesPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: allTasks, isLoading } = useAllTasks()
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"updated" | "priority" | "created">("updated")

  const currentTab: QueueTab = location.pathname.includes("/assigned")
    ? "assigned"
    : location.pathname.includes("/open")
    ? "open"
    : "all"

  const handleTabChange = (tab: string) => {
    navigate(tab === "all" ? "/queues" : `/queues/${tab}`)
  }

  const filteredTasks = useMemo(() => {
    if (!allTasks) return []
    let tasks = [...allTasks]

    // Filter by tab
    if (currentTab === "assigned") {
      tasks = tasks.filter((t) => t.assignee === user?.full_name || t.assignee === user?.email)
    } else if (currentTab === "open") {
      tasks = tasks.filter((t) => t.status !== "done")
    } else {
      tasks = tasks.filter((t) => t.status !== "done")
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase()
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.issue_key.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      )
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      tasks = tasks.filter((t) => t.priority === priorityFilter)
    }

    // Sort
    tasks.sort((a, b) => {
      if (sortBy === "priority") {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 }
        return (order[a.priority] ?? 9) - (order[b.priority] ?? 9)
      }
      if (sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

    return tasks
  }, [allTasks, currentTab, search, priorityFilter, sortBy, user])

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-orange-500/10">
          <Inbox className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Queues</h1>
          <p className="text-sm text-muted-foreground">Manage and triage incoming tasks</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all" className="gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" />
            All Open
          </TabsTrigger>
          <TabsTrigger value="assigned" className="gap-1.5">
            <User className="h-3.5 w-3.5" />
            Assigned to Me
          </TabsTrigger>
          <TabsTrigger value="open" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Open Tasks
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "updated" | "priority" | "created")}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="created">Newest First</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Task Table */}
      {filteredTasks.length > 0 ? (
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="w-[100px]">Key</TableHead>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead className="w-[120px]">Assignee</TableHead>
                <TableHead className="w-[100px]">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-secondary/20 transition-colors"
                >
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
                        borderColor: TASK_STATUS_CONFIG[task.status]?.hex + "40",
                      }}
                    >
                      {TASK_STATUS_CONFIG[task.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px]"
                      style={{ color: TASK_PRIORITY_CONFIG[task.priority]?.hex }}
                    >
                      {TASK_PRIORITY_CONFIG[task.priority]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {task.assignee || "Unassigned"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {timeAgo(task.updated_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">
            {search ? "No tasks match your search" : "Queue is empty. All caught up!"}
          </p>
        </div>
      )}
    </div>
  )
}
