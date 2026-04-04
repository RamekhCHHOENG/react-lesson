import { useMemo, useState } from "react"
import { useProjects } from "@/hooks/useProjects"
import { useAllTasks } from "@/hooks/useTasks"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "@/config"
import type { TaskStatus, TaskPriority } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LayoutPanelLeft,
  ListTodo,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts"

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "#9ca3af",
  "in-progress": "#3b82f6",
  review: "#eab308",
  done: "#22c55e",
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  urgent: "#ef4444",
}

export default function DashboardsPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: allTasks, isLoading: tasksLoading } = useAllTasks()
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")

  const isLoading = projectsLoading || tasksLoading

  const tasks = useMemo(() => {
    if (!allTasks) return []
    if (selectedProjectId === "all") return allTasks
    return allTasks.filter((t) => t.project_id === selectedProjectId)
  }, [allTasks, selectedProjectId])

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.status === "done").length
    const inProgress = tasks.filter((t) => t.status === "in-progress").length
    const overdue = tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
    ).length
    const highPriority = tasks.filter((t) => t.priority === "high" || t.priority === "urgent").length
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, inProgress, overdue, highPriority, completionRate }
  }, [tasks])

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      name: TASK_STATUS_CONFIG[status as TaskStatus]?.label ?? status,
      value: count,
      color: STATUS_COLORS[status as TaskStatus] ?? "#9ca3af",
    }))
  }, [tasks])

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      counts[t.priority] = (counts[t.priority] || 0) + 1
    })
    return Object.entries(counts).map(([priority, count]) => ({
      name: TASK_PRIORITY_CONFIG[priority as TaskPriority]?.label ?? priority,
      value: count,
      color: PRIORITY_COLORS[priority as TaskPriority] ?? "#9ca3af",
    }))
  }, [tasks])

  const weeklyTrend = useMemo(() => {
    const weeks: { week: string; created: number; completed: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i * 7)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)
      const label = `W${Math.ceil((weekStart.getDate()) / 7)}`
      const created = tasks.filter((t) => {
        const c = new Date(t.created_at)
        return c >= weekStart && c < weekEnd
      }).length
      const completed = tasks.filter((t) => {
        const u = new Date(t.updated_at)
        return t.status === "done" && u >= weekStart && u < weekEnd
      }).length
      weeks.push({ week: label, created, completed })
    }
    return weeks
  }, [tasks])

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 8)
  }, [tasks])

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <LayoutPanelLeft className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboards</h1>
            <p className="text-sm text-muted-foreground">Project analytics and insights</p>
          </div>
        </div>
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <ListTodo className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No tasks yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                No tasks yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Weekly Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <Tooltip />
              <Area type="monotone" dataKey="created" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Created" />
              <Area type="monotone" dataKey="completed" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recently Updated Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length > 0 ? (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-md border border-border/50 px-4 py-3 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {task.issue_key}
                    </Badge>
                    <span className="text-sm truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      className="text-[10px]"
                      style={{
                        backgroundColor: STATUS_COLORS[task.status] + "20",
                        color: STATUS_COLORS[task.status],
                        borderColor: STATUS_COLORS[task.status] + "40",
                      }}
                    >
                      {TASK_STATUS_CONFIG[task.status]?.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px]"
                      style={{ color: PRIORITY_COLORS[task.priority] }}
                    >
                      {TASK_PRIORITY_CONFIG[task.priority]?.label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No tasks found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
