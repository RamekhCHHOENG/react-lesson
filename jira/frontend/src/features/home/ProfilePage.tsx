import { useState, useMemo } from "react"
import { useAuth } from "@/store/auth"
import { useProjectContext } from "@/store/project-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { getInitials, cn, timeAgo } from "@/lib/utils"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import {
  User as UserIcon, Mail, Calendar, Shield, CheckSquare2,
  BarChart3, TrendingUp, Clock, Bug, BookOpen, Zap, GitBranch,
  ArrowUp, ArrowDown, ArrowRight, ChevronsUp, Activity,
} from "lucide-react"
import { toast } from "sonner"
import type { Task } from "@/types"

const ISSUE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bug: Bug, story: BookOpen, task: CheckSquare2, epic: Zap, subtask: GitBranch,
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { projects, isLoading } = useProjectContext()

  const myTasks = useMemo(() => {
    const name = user?.full_name ?? ""
    return projects.flatMap((p) =>
      p.tasks.filter((t) => t.assignee === name).map((t) => ({ ...t, projectName: p.name }))
    ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [projects, user?.full_name])

  const stats = useMemo(() => {
    const total = myTasks.length
    const done = myTasks.filter((t) => t.status === "done").length
    const inProgress = myTasks.filter((t) => t.status === "in-progress" || t.status === "review").length
    const todo = myTasks.filter((t) => t.status === "todo").length
    const highPriority = myTasks.filter((t) => t.priority === "urgent" || t.priority === "high").length
    return { total, done, inProgress, todo, highPriority, completion: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [myTasks])

  if (!user) return null

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      {/* Profile Header */}
      <Card className="mb-8 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" />
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
            <Avatar className="h-20 w-20 ring-4 ring-background border-2 border-primary/20 shadow-xl">
              <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} />
              <AvatarFallback className="bg-orange-600 text-2xl font-bold text-white">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.full_name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined {timeAgo(user.created_at)}</span>
                {user.is_superuser && (
                  <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30">
                    <Shield className="h-3 w-3 mr-1" />Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <StatCard label="Total Tasks" value={stats.total} icon={BarChart3} color="text-blue-500" />
        <StatCard label="Completed" value={stats.done} icon={CheckSquare2} color="text-green-500" />
        <StatCard label="In Progress" value={stats.inProgress} icon={TrendingUp} color="text-yellow-500" />
        <StatCard label="To Do" value={stats.todo} icon={Clock} color="text-slate-500" />
        <StatCard label="High Priority" value={stats.highPriority} icon={Zap} color="text-red-500" />
      </div>

      {/* Completion bar */}
      <Card className="mb-8">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-sm font-bold text-primary">{stats.completion}%</span>
          </div>
          <Progress value={stats.completion} className="h-2" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-1.5"><Activity className="h-4 w-4" />My Tasks ({myTasks.length})</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5"><UserIcon className="h-4 w-4" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-1">
          {myTasks.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center py-12">
              <CheckSquare2 className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-sm text-muted-foreground">No tasks assigned to you</p>
            </CardContent></Card>
          ) : (
            myTasks.slice(0, 20).map((task) => <ProfileTaskRow key={task.id} task={task} />)
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn("h-4 w-4", color)} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

function ProfileTaskRow({ task }: { task: Task & { projectName: string } }) {
  const TypeIcon = ISSUE_ICONS[task.issue_type] || CheckSquare2
  const typeCfg = ISSUE_TYPE_CONFIG[task.issue_type as keyof typeof ISSUE_TYPE_CONFIG] || ISSUE_TYPE_CONFIG.task
  const statusCfg = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-card px-4 py-3 hover:bg-accent/50 transition-all cursor-pointer">
      <TypeIcon className="h-4 w-4 shrink-0" style={{ color: typeCfg.hex }} />
      <span className="text-xs font-bold text-muted-foreground/60 w-16 shrink-0 uppercase">{task.issue_key || "—"}</span>
      <p className="text-sm font-medium truncate flex-1">{task.title}</p>
      <span className="text-xs text-muted-foreground shrink-0">{task.projectName}</span>
      {statusCfg && (
        <Badge variant="outline" className={cn("text-[10px] shrink-0", statusCfg.color, statusCfg.bgColor)}>
          {statusCfg.label}
        </Badge>
      )}
      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(task.updated_at)}</span>
    </div>
  )
}

function ProfileSettings() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")

  const handleSave = () => {
    toast.success("Profile settings saved")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <Separator />
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}
