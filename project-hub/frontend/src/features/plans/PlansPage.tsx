import { useMemo, useState } from "react"
import { useProjects } from "@/hooks/useProjects"
import { useAllTasks } from "@/hooks/useTasks"
import type { Task } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Sparkles,
  Calendar,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react"

export default function PlansPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: allTasks, isLoading: tasksLoading } = useAllTasks()
  const [view, setView] = useState<"roadmap" | "milestones">("roadmap")

  const isLoading = projectsLoading || tasksLoading

  const projectStats = useMemo(() => {
    if (!projects || !allTasks) return []
    return projects.map((p) => {
      const tasks = allTasks.filter((t) => t.project_id === p.id)
      const total = tasks.length
      const done = tasks.filter((t) => t.status === "done").length
      const inProgress = tasks.filter((t) => t.status === "in-progress").length
      const review = tasks.filter((t) => t.status === "review").length
      const todo = tasks.filter((t) => t.status === "todo").length
      const progress = total > 0 ? Math.round((done / total) * 100) : 0
      const overdue = tasks.filter(
        (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
      ).length
      return { ...p, tasks, total, done, inProgress, review, todo, progress, overdue }
    })
  }, [projects, allTasks])

  const milestones = useMemo(() => {
    if (!allTasks) return []
    const tasksByDue = allTasks
      .filter((t) => t.due_date && t.status !== "done")
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())

    const grouped: { date: string; tasks: Task[] }[] = []
    tasksByDue.forEach((task) => {
      const dateStr = new Date(task.due_date!).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      const existing = grouped.find((g) => g.date === dateStr)
      if (existing) existing.tasks.push(task)
      else grouped.push({ date: dateStr, tasks: [task] })
    })
    return grouped.slice(0, 10)
  }, [allTasks])

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-60" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-500/10">
            <Sparkles className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
            <p className="text-sm text-muted-foreground">Project roadmap and timeline overview</p>
          </div>
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "roadmap" | "milestones")}>
        <TabsList>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        {/* Roadmap View */}
        <TabsContent value="roadmap" className="space-y-4 mt-4">
          {projectStats.length > 0 ? (
            projectStats.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                        {project.key?.charAt(0) ?? project.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {project.key} · {project.total} tasks
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        project.progress >= 75
                          ? "text-green-400 border-green-400/30"
                          : project.progress >= 40
                          ? "text-yellow-400 border-yellow-400/30"
                          : "text-slate-400 border-slate-400/30"
                      }
                    >
                      {project.progress}% complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={project.progress} className="h-2" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 rounded-md border border-border/50 p-3">
                      <Circle className="h-3.5 w-3.5 text-slate-400" />
                      <div>
                        <p className="text-lg font-semibold">{project.todo}</p>
                        <p className="text-[10px] text-muted-foreground">To Do</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-md border border-border/50 p-3">
                      <Clock className="h-3.5 w-3.5 text-blue-400" />
                      <div>
                        <p className="text-lg font-semibold">{project.inProgress}</p>
                        <p className="text-[10px] text-muted-foreground">In Progress</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-md border border-border/50 p-3">
                      <ArrowUpRight className="h-3.5 w-3.5 text-yellow-400" />
                      <div>
                        <p className="text-lg font-semibold">{project.review}</p>
                        <p className="text-[10px] text-muted-foreground">In Review</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-md border border-border/50 p-3">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                      <div>
                        <p className="text-lg font-semibold">{project.done}</p>
                        <p className="text-[10px] text-muted-foreground">Done</p>
                      </div>
                    </div>
                  </div>
                  {project.overdue > 0 && (
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <Target className="h-3.5 w-3.5" />
                      {project.overdue} overdue task{project.overdue > 1 ? "s" : ""}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">No projects yet. Create a project to see your roadmap.</p>
            </div>
          )}
        </TabsContent>

        {/* Milestones View */}
        <TabsContent value="milestones" className="mt-4">
          {milestones.length > 0 ? (
            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              {milestones.map((milestone, idx) => (
                <div key={idx} className="relative pl-10 pb-6">
                  <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                  <div className="mb-2 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{milestone.date}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {milestone.tasks.length} task{milestone.tasks.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    {milestone.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 rounded-md border border-border/40 px-3 py-2 hover:bg-secondary/30 transition-colors"
                      >
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {task.issue_key}
                        </Badge>
                        <span className="text-sm truncate flex-1">{task.title}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">No upcoming milestones. Assign due dates to tasks to see them here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
