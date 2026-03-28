import { useState, useMemo } from "react"
import { useProjects } from "@/hooks/useProjects"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import type { Task, TaskStatus, TaskPriority, IssueType } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FolderKanban,
  ListTodo,
  TrendingUp,
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
  Legend,
} from "recharts"
import { BurndownChart } from "@/features/reports/components/BurndownChart"
import { VelocityChart } from "@/features/reports/components/VelocityChart"
import { CumulativeFlowDiagram } from "@/features/reports/components/CumulativeFlowDiagram"

// ── Color maps ────────────────────────────────────────────────────────────────

const STATUS_CHART_COLORS: Record<TaskStatus, string> = {
  todo: "#9ca3af",
  "in-progress": "#3b82f6",
  review: "#eab308",
  done: "#22c55e",
}

const PRIORITY_CHART_COLORS: Record<TaskPriority, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  urgent: "#ef4444",
}

const TYPE_CHART_COLORS: Record<IssueType, string> = {
  epic: "#a855f7",
  story: "#22c55e",
  task: "#3b82f6",
  bug: "#ef4444",
  subtask: "#06b6d4",
}

const PROJECT_BAR_COLORS = ["#3b82f6", "#8b5cf6", "#f97316", "#22c55e", "#ef4444", "#06b6d4", "#eab308", "#ec4899"]

// ── Loading Skeleton ──────────────────────────────────────────────────────────

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { data: projects, isLoading } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")

  // Build the task dataset based on filter
  const { filteredProjects, allTasks } = useMemo(() => {
    if (!projects) return { filteredProjects: [], allTasks: [] }

    const fp =
      selectedProjectId === "all"
        ? projects
        : projects.filter((p) => p.id === selectedProjectId)

    const tasks: Task[] = fp.flatMap((p) =>
      p.tasks.map((t) => ({ ...t, project_id: p.id })),
    )

    return { filteredProjects: fp, allTasks: tasks }
  }, [projects, selectedProjectId])

  if (isLoading) return <ReportsSkeleton />

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalProjects = filteredProjects.length
  const totalTasks = allTasks.length
  const doneTasks = allTasks.filter((t) => t.status === "done").length
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const overdueTasks = allTasks.filter((t) => {
    if (t.status === "done" || !t.due_date) return false
    return new Date(t.due_date) < new Date()
  }).length

  // ── Chart data: Issues by status (pie) ────────────────────────────────────
  const statusData = (Object.keys(TASK_STATUS_CONFIG) as TaskStatus[]).map((status) => ({
    name: TASK_STATUS_CONFIG[status].label,
    value: allTasks.filter((t) => t.status === status).length,
    color: STATUS_CHART_COLORS[status],
  })).filter((d) => d.value > 0)

  // ── Chart data: Issues by project (bar) ───────────────────────────────────
  const projectData = filteredProjects.map((p) => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
    count: p.tasks.length,
  }))

  // ── Chart data: Issues by priority (bar) ──────────────────────────────────
  const priorityData = (Object.keys(TASK_PRIORITY_CONFIG) as TaskPriority[]).map((priority) => ({
    name: TASK_PRIORITY_CONFIG[priority].label,
    count: allTasks.filter((t) => t.priority === priority).length,
    fill: PRIORITY_CHART_COLORS[priority],
  }))

  // ── Chart data: Issues by type (bar) ──────────────────────────────────────
  const typeData = (Object.keys(ISSUE_TYPE_CONFIG) as IssueType[]).map((type) => ({
    name: ISSUE_TYPE_CONFIG[type].label,
    count: allTasks.filter((t) => t.issue_type === type).length,
    fill: TYPE_CHART_COLORS[type],
  }))

  // ── Project progress table data ───────────────────────────────────────────
  const projectProgressData = filteredProjects.map((project) => {
    const tasks = project.tasks ?? []
    const total = tasks.length
    const done = tasks.filter((t) => t.status === "done").length
    const inProgress = tasks.filter((t) => t.status === "in-progress").length
    const todo = tasks.filter((t) => t.status === "todo").length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    return { project, total, done, inProgress, todo, pct }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Analytics and insights across your projects</p>
        </div>
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="burndown">Burndown</TabsTrigger>
          <TabsTrigger value="velocity">Velocity</TabsTrigger>
          <TabsTrigger value="flow">Cumulative Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart: Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Issues by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={(props) =>
                      `${props.name ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart: Issues by Project */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Issues by Project</CardTitle>
          </CardHeader>
          <CardContent>
            {projectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Issues" radius={[4, 4, 0, 0]}>
                    {projectData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PROJECT_BAR_COLORS[index % PROJECT_BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart: Issues by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Issues by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {totalTasks > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Issues" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart: Issues by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Issues by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {totalTasks > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Issues" radius={[4, 4, 0, 0]}>
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {projectProgressData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead className="text-center">Total Tasks</TableHead>
                  <TableHead className="text-center">Done</TableHead>
                  <TableHead className="text-center">In Progress</TableHead>
                  <TableHead className="text-center">To Do</TableHead>
                  <TableHead className="w-[180px]">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectProgressData.map(({ project, total, done, inProgress, todo, pct }) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {project.key}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{total}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-medium">{done}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-blue-600 font-medium">{inProgress}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-gray-600 font-medium">{todo}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              No projects to display
            </div>
          )}
        </CardContent>
      </Card>

        </TabsContent>

        <TabsContent value="burndown">
          {selectedProjectId !== "all" && selectedProjectId ? (
            <BurndownChart projectId={selectedProjectId} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                Select a specific project to view burndown chart
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="velocity">
          {selectedProjectId !== "all" && selectedProjectId ? (
            <VelocityChart projectId={selectedProjectId} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                Select a specific project to view velocity chart
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="flow">
          {selectedProjectId !== "all" && selectedProjectId ? (
            <CumulativeFlowDiagram projectId={selectedProjectId} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                Select a specific project to view cumulative flow diagram
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
