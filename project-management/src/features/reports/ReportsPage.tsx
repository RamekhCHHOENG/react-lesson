import { useMemo } from "react"
import { useProjectContext } from "@/store/ProjectContext"
import { TASK_STATUS_CONFIG, PROJECT_STATUS_CONFIG, PROJECT_PRIORITY_CONFIG } from "@/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  Users,
  Target,
} from "lucide-react"

export default function ReportsPage() {
  const { state } = useProjectContext()

  const stats = useMemo(() => {
    const projects = state.projects
    const allTasks = projects.flatMap((p) => p.tasks)

    const tasksByStatus = {
      todo: allTasks.filter((t) => t.status === "todo").length,
      "in-progress": allTasks.filter((t) => t.status === "in-progress").length,
      review: allTasks.filter((t) => t.status === "review").length,
      done: allTasks.filter((t) => t.status === "done").length,
    }

    const projectsByStatus = {
      planning: projects.filter((p) => p.status === "planning").length,
      "in-progress": projects.filter((p) => p.status === "in-progress").length,
      "on-hold": projects.filter((p) => p.status === "on-hold").length,
      completed: projects.filter((p) => p.status === "completed").length,
      cancelled: projects.filter((p) => p.status === "cancelled").length,
    }

    const projectsByPriority = {
      low: projects.filter((p) => p.priority === "low").length,
      medium: projects.filter((p) => p.priority === "medium").length,
      high: projects.filter((p) => p.priority === "high").length,
      urgent: projects.filter((p) => p.priority === "urgent").length,
    }

    const totalTasks = allTasks.length
    const completedTasks = tasksByStatus.done
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const assignees = new Set(allTasks.map((t) => t.assignee).filter(Boolean))

    const today = new Date().toISOString().split("T")[0]
    const overdueTasks = allTasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.status !== "done"
    ).length

    const projectTaskCounts = projects.map((p) => ({
      name: p.name,
      total: p.tasks.length,
      done: p.tasks.filter((t) => t.status === "done").length,
      progress: p.tasks.length > 0
        ? Math.round((p.tasks.filter((t) => t.status === "done").length / p.tasks.length) * 100)
        : 0,
    }))

    return {
      totalProjects: projects.length,
      totalTasks,
      completedTasks,
      completionRate,
      overdueTasks,
      teamSize: assignees.size,
      tasksByStatus,
      projectsByStatus,
      projectsByPriority,
      projectTaskCounts,
    }
  }, [state.projects])

  const maxTaskCount = Math.max(
    stats.tasksByStatus.todo,
    stats.tasksByStatus["in-progress"],
    stats.tasksByStatus.review,
    stats.tasksByStatus.done,
    1
  )

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-orange-600">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Reports</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Overview of your project metrics and team productivity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<FolderKanban className="h-5 w-5" />}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            label="Total Projects"
            value={stats.totalProjects}
          />
          <SummaryCard
            icon={<Target className="h-5 w-5" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            label="Total Issues"
            value={stats.totalTasks}
          />
          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            label="Completion Rate"
            value={`${stats.completionRate}%`}
          />
          <SummaryCard
            icon={<AlertTriangle className="h-5 w-5" />}
            iconBg="bg-destructive/10"
            iconColor="text-destructive"
            label="Overdue Issues"
            value={stats.overdueTasks}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Distribution Chart */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm">Issue Distribution by Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => {
                  const count = stats.tasksByStatus[key as keyof typeof stats.tasksByStatus] ?? 0
                  const pct = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: config.dotColor }}
                      />
                      <span className="text-sm text-muted-foreground w-24">{config.label}</span>
                      <div className="flex-1 h-6 bg-secondary rounded-sm overflow-hidden">
                        <div
                          className="h-full rounded-sm transition-all duration-500"
                          style={{
                            width: `${(count / maxTaskCount) * 100}%`,
                            backgroundColor: config.dotColor,
                            minWidth: count > 0 ? "8px" : "0",
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-8 text-right">
                        {count}
                      </span>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Project Status Distribution */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm">Project Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {Object.entries(PROJECT_STATUS_CONFIG).map(([key, config]) => {
                  const count =
                    stats.projectsByStatus[key as keyof typeof stats.projectsByStatus] ?? 0
                  const pct =
                    stats.totalProjects > 0 ? (count / stats.totalProjects) * 100 : 0
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: config.dotColor }}
                      />
                      <span className="text-sm text-muted-foreground w-24">{config.label}</span>
                      <div className="flex-1 h-6 bg-secondary rounded-sm overflow-hidden">
                        <div
                          className="h-full rounded-sm transition-all duration-500"
                          style={{
                            width: stats.totalProjects > 0 ? `${pct}%` : "0%",
                            backgroundColor: config.dotColor,
                            minWidth: count > 0 ? "8px" : "0",
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-8 text-right">
                        {count}
                      </span>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Priority Breakdown */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm">Projects by Priority</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-end gap-6 h-40">
                {Object.entries(PROJECT_PRIORITY_CONFIG).map(([key, config]) => {
                  const count =
                    stats.projectsByPriority[key as keyof typeof stats.projectsByPriority] ?? 0
                  const maxPri = Math.max(...Object.values(stats.projectsByPriority), 1)
                  const height = (count / maxPri) * 100
                  return (
                    <div key={key} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{count}</span>
                      <div className="w-full bg-secondary rounded-t relative" style={{ height: "100%" }}>
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-t transition-all duration-500"
                          style={{
                            height: `${height}%`,
                            backgroundColor: config.dotColor,
                            minHeight: count > 0 ? "4px" : "0",
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground uppercase">
                        {config.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <QuickStat
                icon={<Users className="h-4 w-4 text-primary" />}
                label="Team Members"
                value={stats.teamSize || "\u2014"}
              />
              <QuickStat
                icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                label="Issues Completed"
                value={`${stats.completedTasks} / ${stats.totalTasks}`}
              />
              <QuickStat
                icon={<Clock className="h-4 w-4 text-orange-500" />}
                label="In Progress"
                value={stats.tasksByStatus["in-progress"]}
              />
              <QuickStat
                icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
                label="Overdue"
                value={stats.overdueTasks}
              />
              <QuickStat
                icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
                label="In Review"
                value={stats.tasksByStatus.review}
              />
            </CardContent>
          </Card>
        </div>

        {/* Project Progress Table */}
        {stats.projectTaskCounts.length > 0 && (
          <Card className="overflow-hidden">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle className="text-sm">Project Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="grid grid-cols-[1fr_80px_80px_120px_60px] gap-4 px-5 py-2.5 bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Project</span>
                  <span className="text-center">Issues</span>
                  <span className="text-center">Done</span>
                  <span>Progress</span>
                  <span className="text-right">%</span>
                </div>
                {stats.projectTaskCounts.map((p) => (
                  <div
                    key={p.name}
                    className="grid grid-cols-[1fr_80px_80px_120px_60px] gap-4 px-5 py-3 items-center hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                    <span className="text-sm text-muted-foreground text-center">{p.total}</span>
                    <span className="text-sm text-green-600 font-medium text-center">{p.done}</span>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground text-right">
                      {p.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string | number
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded ${iconBg} ${iconColor}`}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}
