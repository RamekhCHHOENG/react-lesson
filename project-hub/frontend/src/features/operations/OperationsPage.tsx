import { useMemo } from "react"
import { useAllTasks } from "@/hooks/useTasks"
import { useProjects } from "@/hooks/useProjects"
import { useActivities } from "@/hooks/useActivities"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "@/config"
import type { TaskStatus, TaskPriority } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  TrendingUp,
  Zap,
  ShieldCheck,
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

export default function OperationsPage() {
  const { data: allTasks, isLoading: tasksLoading } = useAllTasks()
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: activities, isLoading: activitiesLoading } = useActivities()

  const isLoading = tasksLoading || projectsLoading || activitiesLoading

  const metrics = useMemo(() => {
    if (!allTasks) return null

    const total = allTasks.length
    const done = allTasks.filter((t) => t.status === "done").length
    const inProgress = allTasks.filter((t) => t.status === "in-progress").length
    const overdue = allTasks.filter(
      (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
    ).length
    const highPriority = allTasks.filter(
      (t) => (t.priority === "high" || t.priority === "urgent") && t.status !== "done"
    ).length
    const bugs = allTasks.filter((t) => t.issue_type === "bug" && t.status !== "done").length

    // Velocity: tasks done in last 7 days
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const doneThisWeek = allTasks.filter(
      (t) => t.status === "done" && new Date(t.updated_at) >= weekAgo
    ).length

    // Health score
    const healthScore = Math.max(
      0,
      Math.min(
        100,
        100 - overdue * 5 - highPriority * 3 - bugs * 2 + (total > 0 ? (done / total) * 30 : 0)
      )
    )

    return { total, done, inProgress, overdue, highPriority, bugs, doneThisWeek, healthScore: Math.round(healthScore) }
  }, [allTasks])

  const recentActivities = useMemo(() => {
    if (!activities) return []
    return [...activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 12)
  }, [activities])

  const projectHealth = useMemo(() => {
    if (!projects || !allTasks) return []
    return projects.map((p) => {
      const tasks = allTasks.filter((t) => t.project_id === p.id)
      const total = tasks.length
      const done = tasks.filter((t) => t.status === "done").length
      const overdue = tasks.filter(
        (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
      ).length
      const progress = total > 0 ? Math.round((done / total) * 100) : 0
      const status = overdue > 2 ? "critical" : overdue > 0 ? "warning" : progress >= 50 ? "healthy" : "neutral"
      return { ...p, total, done, overdue, progress, status }
    })
  }, [projects, allTasks])

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-60" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-500/10">
          <Gauge className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operations</h1>
          <p className="text-sm text-muted-foreground">System health and operational metrics</p>
        </div>
      </div>

      {/* Health Score */}
      {metrics && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className={metrics.healthScore >= 70 ? "border-green-500/30" : metrics.healthScore >= 40 ? "border-yellow-500/30" : "border-red-500/30"}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    metrics.healthScore >= 70 ? "bg-green-500/10" : metrics.healthScore >= 40 ? "bg-yellow-500/10" : "bg-red-500/10"
                  }`}>
                    <ShieldCheck className={`h-5 w-5 ${
                      metrics.healthScore >= 70 ? "text-green-500" : metrics.healthScore >= 40 ? "text-yellow-500" : "text-red-500"
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.healthScore}%</p>
                    <p className="text-xs text-muted-foreground">Health Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.doneThisWeek}</p>
                    <p className="text-xs text-muted-foreground">Completed This Week</p>
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
                    <p className="text-2xl font-bold">{metrics.overdue}</p>
                    <p className="text-xs text-muted-foreground">Overdue Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Zap className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{metrics.bugs}</p>
                    <p className="text-xs text-muted-foreground">Open Bugs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Health */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Project Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectHealth.map((p) => (
                <div key={p.id} className="flex items-center gap-4">
                  <div className="w-40 shrink-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          p.status === "critical"
                            ? "bg-red-500"
                            : p.status === "warning"
                            ? "bg-yellow-500"
                            : p.status === "healthy"
                            ? "bg-green-500"
                            : "bg-slate-400"
                        }`}
                      />
                      <span className="text-sm font-medium truncate">{p.name}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Progress value={p.progress} className="h-2" />
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                    <span>{p.done}/{p.total} done</span>
                    {p.overdue > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        {p.overdue} overdue
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {projectHealth.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No projects yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-2">
                  {recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center gap-3 rounded-md border border-border/40 px-4 py-2.5"
                    >
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${
                          act.action === "created"
                            ? "text-green-400 border-green-400/30"
                            : act.action === "deleted"
                            ? "text-red-400 border-red-400/30"
                            : "text-blue-400 border-blue-400/30"
                        }`}
                      >
                        {act.action}
                      </Badge>
                      <span className="text-sm truncate flex-1">
                        {act.entity_type}: {act.entity_id}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {timeAgo(act.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
