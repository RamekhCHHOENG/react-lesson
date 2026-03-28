import { useProjects } from "@/hooks/useProjects"
import { useAuth } from "@/store/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  TrendingUp,
  ListTodo,
  Users,
  Zap,
  MoreHorizontal,
  ArrowRight,
  Clock,
  CheckCircle2,
  LayoutGrid
} from "lucide-react"
import { TASK_STATUS_CONFIG } from "@/config"
import { isOverdue, timeAgo, cn } from "@/lib/utils"
import type { Task } from "@/types"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: projects, isLoading } = useProjects()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
           <Skeleton className="h-[400px] lg:col-span-2" />
           <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  const allTasks: Task[] = projects?.flatMap((p) => p.tasks.map((t) => ({ ...t, project_id: p.id }))) ?? []
  const doneTasks = allTasks.filter((t) => t.status === "done").length
  const inProgressTasks = allTasks.filter((t) => t.status === "in-progress" || t.status === "review").length
  const overdueTasks = allTasks.filter((t) => t.status !== "done" && isOverdue(t.due_date)).length
  const completionRate = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0

  const recentTasks = [...allTasks]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6)

  const myTasks = allTasks
    .filter((t) => t.status !== "done" && (t.assignee === user?.full_name || t.assignee === user?.email))
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-background p-8 pb-20 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-8">
          <div className="flex items-center gap-6">
             <div className="relative group">
                <Avatar className="h-20 w-20 ring-4 ring-primary/10 transition-transform group-hover:scale-105">
                   <AvatarImage src={`https://avatar.vercel.sh/${user?.email || 'admin'}.png`} />
                   <AvatarFallback className="bg-orange-500 text-2xl font-bold text-white">RE</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-background" />
             </div>
             <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {user?.full_name?.split(" ")[0] || "Owner"}</h1>
                <p className="text-muted-foreground mt-1.5 flex items-center gap-2 font-medium">
                   <LayoutGrid className="h-4 w-4 text-primary" />
                   Managing {projects?.length || 0} active projects in your workspace
                </p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-10 text-sm font-bold rounded-[3px] border-border/60 hover:bg-secondary/50">Personal settings</Button>
             <Button onClick={() => navigate('/projects')} className="h-10 bg-primary text-white font-bold rounded-[3px] px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-all">Go to projects</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStat 
            title="Total Issues" 
            value={allTasks.length} 
            icon={ListTodo} 
            color="text-primary" 
            trend="+5% from last week"
          />
          <DashboardStat 
            title="Completed" 
            value={doneTasks} 
            icon={CheckCircle2} 
            color="text-green-500" 
            progress={completionRate}
          />
          <DashboardStat 
            title="In Progress" 
            value={inProgressTasks} 
            icon={Clock} 
            color="text-blue-400" 
          />
          <DashboardStat 
            title="Overdue" 
            value={overdueTasks} 
            icon={AlertTriangle} 
            color="text-destructive" 
            alert
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Work */}
          <Card className="lg:col-span-2 jira-panel border-none bg-secondary/10 hover:bg-secondary/20 transition-all overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-none">
              <div className="flex items-center gap-2.5">
                 <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                 </div>
                 <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Recent activity</CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border/30">
                  {recentTasks.map((task) => {
                     const statusCfg = TASK_STATUS_CONFIG[task.status]
                     return (
                        <div key={task.id} className="group flex items-center justify-between p-4 hover:bg-primary/5 transition-all cursor-pointer">
                           <div className="flex items-center gap-4 min-w-0">
                              <div className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 border border-border/20">RE</div>
                              <div className="min-w-0">
                                 <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{task.title}</p>
                                 <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{task.issue_key}</span>
                                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                    <span className="text-[10px] text-muted-foreground font-medium">{timeAgo(task.updated_at)}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4 shrink-0">
                              <Badge variant="secondary" className={cn("text-[10px] uppercase font-bold tracking-wider rounded-sm", statusCfg.bgColor, statusCfg.color)}>
                                 {statusCfg.label}
                              </Badge>
                              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                           </div>
                        </div>
                     )
                  })}
                  {recentTasks.length === 0 && (
                     <div className="py-20 text-center">
                        <TrendingUp className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">No recent tasks to show.</p>
                     </div>
                  )}
               </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
             <Card className="jira-panel border-none bg-indigo-600/5 hover:bg-indigo-600/10 transition-all">
                <CardHeader className="pb-3 border-none">
                  <div className="flex items-center gap-2.5">
                     <Users className="h-4 w-4 text-indigo-500" />
                     <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-indigo-500/80">Assigned to you</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                   {myTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-2 rounded-[3px] hover:bg-background/50 transition-all cursor-pointer group">
                         <div className="flex items-center gap-3 min-w-0">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
                         </div>
                         <span className="text-[10px] font-bold text-muted-foreground shrink-0 ml-2">{task.issue_key}</span>
                      </div>
                   ))}
                   {myTasks.length === 0 && (
                      <div className="text-center py-6">
                         <CheckCircle2 className="h-8 w-8 text-green-500/20 mx-auto mb-2" />
                         <p className="text-xs text-muted-foreground">All caught up!</p>
                      </div>
                   )}
                </CardContent>
             </Card>

             <Card className="jira-panel border-none bg-secondary/10 group">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Project health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   {projects?.slice(0, 3).map((p) => {
                      const done = p.tasks.filter(t => t.status === 'done').length
                      const total = p.tasks.length
                      const pct = total > 0 ? Math.round((done / total) * 100) : 0
                      return (
                         <div key={p.id} className="space-y-2">
                            <div className="flex items-center justify-between group-hover:opacity-100 transition-opacity">
                               <span className="text-sm font-bold text-foreground truncate">{p.name}</span>
                               <span className="text-[11px] font-bold text-primary">{pct}%</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                         </div>
                      )
                   })}
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardStat({ title, value, icon: Icon, color, trend, progress, alert }: any) {
  return (
    <Card className={cn("jira-panel border-none transition-all hover:scale-[1.02] cursor-default bg-secondary/10", alert && "bg-destructive/5 hover:bg-destructive/10")}>
       <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-lg border border-border/10">
                <Icon className={cn("h-5 w-5", color)} />
             </div>
             {trend && <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">{trend}</span>}
          </div>
          <div className="space-y-1">
             <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{title}</h3>
             <p className={cn("text-3xl font-bold tracking-tight text-foreground", alert && value > 0 && "text-destructive")}>{value}</p>
          </div>
          {progress !== undefined && (
             <div className="mt-4 space-y-1.5">
                <Progress value={progress} className="h-1 bg-background" />
             </div>
          )}
       </CardContent>
    </Card>
  )
}
