import { useMemo } from "react"
import {
  CheckCircle2,
  Clock,
  History,
  MoreHorizontal,
  PlusCircle,
  Zap,
  CheckSquare,
  Bug,
  BookOpen,
  GitBranch,
  TrendingUp
} from "lucide-react"
import { JiraWorkspaceFrame } from "@/components/jira/JiraWorkspaceFrame"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProjectContext } from "@/store/project-context"
import { cn, timeAgo } from "@/lib/utils"
import { Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js"
import { Skeleton } from "@/components/ui/skeleton"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

export default function SummaryPage() {
  const { selectedProject, projects, isLoading } = useProjectContext()
  const project = selectedProject ?? projects[0] ?? null

  const stats = useMemo(() => {
    if (!project) return null
    const tasks = project.tasks
    return {
      total: tasks.length,
      done: tasks.filter((t) => t.status === "done").length,
      updated: tasks.filter((t) => {
        const updated = new Date(t.updated_at)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return updated > sevenDaysAgo
      }).length,
      dueSoon: tasks.filter((t) => {
        if (!t.due_date) return false
        const due = new Date(t.due_date)
        const now = new Date()
        const threeDays = new Date()
        threeDays.setDate(now.getDate() + 3)
        return due > now && due < threeDays
      }).length,
      recent: [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5),
    }
  }, [project])

  const chartData = useMemo(() => {
    if (!project) return null
    const tasks = project.tasks
    const todo = tasks.filter((t) => t.status === "todo").length
    const inProgress = tasks.filter((t) => t.status === "in-progress" || t.status === "review").length
    const done = tasks.filter((t) => t.status === "done").length

    return {
      labels: ["Done", "In progress", "To do"],
      datasets: [
        {
          data: [done, inProgress, todo],
          backgroundColor: ["#36B37E", "#0052CC", "#8590A2"],
          hoverBackgroundColor: ["#2c9468", "#0047b3", "#717d91"],
          borderWidth: 0,
          cutout: "80%",
        },
      ],
    }
  }, [project])

  const chartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    maintainAspectRatio: false,
  }

  if (isLoading) {
    return (
      <JiraWorkspaceFrame tab="summary">
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-[350px] lg:col-span-2" />
              <Skeleton className="h-[350px]" />
           </div>
        </div>
      </JiraWorkspaceFrame>
    )
  }

  if (!project) return null

  return (
    <JiraWorkspaceFrame tab="summary">
      <div className="space-y-8 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Done"
            value={stats!.done}
            total={stats!.total}
            icon={CheckCircle2}
            color="text-green-500"
            bgColor="bg-green-500/10"
          />
          <StatCard
            title="Updated"
            value={stats!.updated}
            total={stats!.total}
            icon={History}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
            subtitle="In the last 7 days"
          />
          <StatCard
            title="Created"
            value={stats!.total}
            icon={PlusCircle}
            color="text-purple-500"
            bgColor="bg-purple-500/10"
            subtitle="Total issues"
          />
          <StatCard
            title="Due soon"
            value={stats!.dueSoon}
            icon={Clock}
            color="text-orange-500"
            bgColor="bg-orange-500/10"
            subtitle="In the next 3 days"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="jira-panel lg:col-span-1 min-h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Status overview</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              <div className="relative h-48 w-48 mb-8">
                <Doughnut data={chartData!} options={chartOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">{stats!.total}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Total items</span>
                </div>
              </div>
              <div className="w-full space-y-3">
                <StatusLegend label="Done" count={chartData!.datasets[0].data[0] as number} color="bg-[#36B37E]" percentage={Math.round((chartData!.datasets[0].data[0] as number / stats!.total) * 100) || 0} />
                <StatusLegend label="In progress" count={chartData!.datasets[0].data[1] as number} color="bg-[#0052CC]" percentage={Math.round((chartData!.datasets[0].data[1] as number / stats!.total) * 100) || 0} />
                <StatusLegend label="To do" count={chartData!.datasets[0].data[2] as number} color="bg-[#8590A2]" percentage={Math.round((chartData!.datasets[0].data[2] as number / stats!.total) * 100) || 0} />
              </div>
            </CardContent>
          </Card>

          <Card className="jira-panel lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recent activity</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary">View all</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats!.recent.map((task, i) => (
                  <ActivityItem 
                    key={task.id} 
                    task={task} 
                    projectKey={project.key} 
                    isLast={i === stats!.recent.length - 1} 
                  />
                ))}
                {stats!.recent.length === 0 && (
                   <div className="py-20 text-center">
                      <TrendingUp className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No recent activity to show.</p>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </JiraWorkspaceFrame>
  )
}

function StatCard({ title, value, total, icon: Icon, color, bgColor, subtitle }: any) {
  return (
    <Card className="jira-panel border-none bg-secondary/20 hover:bg-secondary/40 transition-all group overflow-hidden relative">
       <div className={cn("absolute top-0 left-0 w-1 h-full", color.replace('text-', 'bg-'))} />
       <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
          <div className={cn("rounded-sm p-1.5 transition-transform group-hover:scale-110", bgColor)}>
            <Icon className={cn("h-4 w-4", color)} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
           <span className="text-2xl font-bold text-foreground">{value}</span>
           {total && <span className="text-xs text-muted-foreground">/ {total}</span>}
        </div>
        {subtitle && <p className="mt-1 text-[10px] font-medium text-muted-foreground/60">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

function StatusLegend({ label, count, color, percentage }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-secondary/50 p-1.5 rounded-sm transition-all">
      <div className="flex items-center gap-2.5">
        <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
        <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
         <span className="text-[11px] font-bold text-muted-foreground">{count}</span>
         <span className="text-[11px] font-bold text-muted-foreground/40 min-w-[30px] text-right">{percentage}%</span>
      </div>
    </div>
  )
}

function ActivityItem({ task, projectKey, isLast }: { task: any; projectKey: string; isLast: boolean }) {
  const TypeIcon = task.issue_type === 'bug' ? Bug : task.issue_type === 'story' ? BookOpen : folderIcon(task.issue_type)
  
  return (
    <div className={cn("flex gap-3 py-3 group hover:bg-secondary/30 rounded-lg px-2 transition-all cursor-pointer", !isLast && "border-b border-border/30")}>
       <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:scale-105 transition-transform">
          <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">RE</div>
       </div>
       <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground/90 leading-snug">
             <span className="font-bold">Ramekh RE</span> updated the status to <span className="px-1.5 py-0.5 rounded-sm bg-secondary text-[10px] font-bold uppercase tracking-wider">{task.status.replace('-', ' ')}</span>
          </p>
          <div className="mt-1.5 flex items-center gap-2">
             <div className="flex items-center gap-1.5 min-w-0">
                <TypeIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors tracking-tighter shrink-0">{task.issue_key || `${projectKey}-NUM`}</span>
                <span className="text-[11px] text-muted-foreground truncate">{task.title}</span>
             </div>
             <span className="h-1 w-1 rounded-full bg-muted-foreground/30 shrink-0" />
             <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(task.updated_at)}</span>
          </div>
       </div>
    </div>
  )
}

function folderIcon(type: string) {
   switch(type) {
      case 'task': return CheckSquare
      case 'subtask': return GitBranch
      case 'epic': return Zap
      default: return CheckSquare
   }
}