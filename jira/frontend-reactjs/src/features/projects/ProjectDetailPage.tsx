import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useProject, useDeleteProject } from "@/hooks/useProjects"
import {
  PROJECT_STATUS_CONFIG,
  TASK_STATUS_CONFIG,
} from "@/config"
import { cn, formatDate, getInitials } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Trash2,
  MoreHorizontal,
  Search,
  ListTodo,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Settings,
  Star
} from "lucide-react"

import ProjectFormDialog from "@/features/projects/components/ProjectFormDialog"
import TaskFormDialog from "@/features/projects/components/TaskFormDialog"

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(projectId)
  const deleteProject = useDeleteProject()

  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [taskSearch, setTaskSearch] = useState("")

  const tasks = project?.tasks ?? []
  const filteredTasks = useMemo(() => {
    if (!taskSearch) return tasks
    const q = taskSearch.toLowerCase()
    return tasks.filter((t) => t.title.toLowerCase().includes(q) || t.issue_key?.toLowerCase().includes(q))
  }, [tasks, taskSearch])

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.status === "done").length
    const inProgress = tasks.filter((t) => t.status === "in-progress" || t.status === "review").length
    return { total, done, inProgress }
  }, [tasks])

  const progressPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
             <Skeleton className="h-8 w-64" />
             <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!project) return null

  const statusConfig = PROJECT_STATUS_CONFIG[project.status]

  return (
    <div className="min-h-screen bg-background p-8 pb-20 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-border/40 pb-8">
          <div className="flex items-start gap-6">
             <div className="h-16 w-16 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="h-10 w-10">
                   <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                </svg>
             </div>
             <div>
                <div className="flex items-center gap-3 mb-1">
                   <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
                   <Star className="h-5 w-5 text-muted-foreground/40 hover:text-yellow-500 cursor-pointer transition-colors" />
                </div>
                <div className="flex items-center gap-2">
                   <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-widest">{project.key}</Badge>
                   <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                   <p className="text-sm text-muted-foreground font-medium">Software project • Team-managed</p>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" className="h-10 font-bold rounded-[3px] border-border/60 hover:bg-secondary/50" onClick={() => setEditProjectOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
             </Button>
             <Button onClick={() => setTaskFormOpen(true)} className="h-10 bg-primary text-white font-bold rounded-[3px] px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Create issue
             </Button>
          </div>
        </div>

        {/* Project View Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-transparent border-b border-border/40 w-full justify-start rounded-none h-auto p-0 gap-8">
            <TabsTrigger value="overview" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-3 text-sm font-bold text-muted-foreground data-[state=active]:text-primary transition-all">Overview</TabsTrigger>
            <TabsTrigger value="tasks" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-3 text-sm font-bold text-muted-foreground data-[state=active]:text-primary transition-all">Issues</TabsTrigger>
            <TabsTrigger value="members" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-1 pb-3 text-sm font-bold text-muted-foreground data-[state=active]:text-primary transition-all">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 pt-4">
             <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                   <Card className="jira-panel border-none bg-secondary/10 hover:bg-secondary/20 transition-all p-6">
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">About this project</h3>
                      <p className="text-foreground leading-relaxed italic">{project.description || "Welcome to the workspace! Plan, track, and release world-class software here."}</p>
                   </Card>

                   <div className="grid gap-6 md:grid-cols-3">
                      <OverviewStat label="Completed" value={stats.done} icon={CheckCircle2} color="text-green-500" />
                      <OverviewStat label="In Progress" value={stats.inProgress} icon={Clock} color="text-blue-500" />
                      <OverviewStat label="Total Items" value={stats.total} icon={LayoutGrid} color="text-primary" />
                   </div>

                   <Card className="jira-panel border-none bg-secondary/10 p-6">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Project Progress</h3>
                         <span className="text-xl font-bold text-primary">{progressPct}%</span>
                      </div>
                      <Progress value={progressPct} className="h-3 rounded-full bg-background" />
                      <div className="flex justify-between mt-3 text-[11px] font-bold text-muted-foreground uppercase tracking-tighter">
                         <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> {stats.done} Done</span>
                         <span>{stats.total - stats.done} Remaining</span>
                      </div>
                   </Card>
                </div>

                <div className="space-y-6">
                   <Card className="jira-panel border-none bg-secondary/10 p-6">
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Details</h3>
                      <div className="space-y-4">
                         <DetailItem label="Status" value={statusConfig.label} color={statusConfig.color} bgColor={statusConfig.bgColor} />
                         <DetailItem label="Lead" value={project.owner?.full_name || "Unassigned"} isUser />
                         <DetailItem label="Timeline" value={`${formatDate(project.start_date)} - ${formatDate(project.end_date)}`} />
                      </div>
                   </Card>
                   
                   <Button variant="ghost" className="w-full h-12 text-destructive font-bold hover:bg-destructive/5" onClick={() => setDeleteProjectOpen(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete project
                   </Button>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="tasks" className="pt-4">
             <div className="jira-panel border-none bg-secondary/10 overflow-hidden">
                <div className="p-4 border-b border-border/40 flex items-center justify-between bg-card">
                   <div className="relative max-w-sm w-full">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                        placeholder="Search issues..." 
                        className="pl-10 h-10 border-none bg-secondary/50 focus-visible:ring-1" 
                      />
                   </div>
                   <div className="flex items-center gap-2">
                       <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                   </div>
                </div>
                <Table>
                   <TableHeader className="bg-secondary/20">
                      <TableRow className="hover:bg-transparent border-border/40">
                         <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-6">Key</TableHead>
                         <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Summary</TableHead>
                         <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Status</TableHead>
                         <TableHead className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pr-6 text-right">Assignee</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {filteredTasks.map(task => (
                         <TableRow key={task.id} className="group hover:bg-primary/5 cursor-pointer border-border/20 transition-all">
                            <TableCell className="pl-6 font-bold text-[11px] text-muted-foreground uppercase tracking-tighter group-hover:text-primary">{task.issue_key}</TableCell>
                            <TableCell className="font-bold text-sm text-foreground">{task.title}</TableCell>
                            <TableCell>
                               <Badge variant="secondary" className={cn("text-[10px] uppercase font-bold", TASK_STATUS_CONFIG[task.status].bgColor, TASK_STATUS_CONFIG[task.status].color)}>
                                  {TASK_STATUS_CONFIG[task.status].label}
                               </Badge>
                            </TableCell>
                            <TableCell className="pr-6 text-right">
                               <div className="flex justify-end">
                                  <Avatar className="h-6 w-6">
                                     <AvatarFallback className="bg-indigo-500 text-[8px] text-white">{getInitials(task.assignee || 'UN')}</AvatarFallback>
                                  </Avatar>
                               </div>
                            </TableCell>
                         </TableRow>
                      ))}
                      {filteredTasks.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={4} className="h-64 text-center">
                               <div className="space-y-2">
                                  <ListTodo className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                                  <p className="text-sm font-bold text-muted-foreground">No issues found</p>
                               </div>
                            </TableCell>
                         </TableRow>
                      )}
                   </TableBody>
                </Table>
             </div>
          </TabsContent>
          <TabsContent value="members" className="pt-4">
             <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                   <LayoutGrid className="h-10 w-10 text-muted-foreground/50" />
                   <h3 className="mt-4 text-base font-semibold">Coming soon</h3>
                   <p className="mt-1 text-sm text-muted-foreground">Team member management will be available in a future update.</p>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProjectFormDialog open={editProjectOpen} onOpenChange={setEditProjectOpen} project={project} />
      <TaskFormDialog open={taskFormOpen} onOpenChange={setTaskFormOpen} projectId={project.id} />
      
      <AlertDialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <AlertDialogContent className="rounded-[3px] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete {project.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium pt-2">
              This will permanently delete the project <span className="text-foreground font-bold">{project.key}</span> and all its issues. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel className="rounded-[3px] font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await deleteProject.mutateAsync(project.id); navigate('/projects'); }} className="bg-destructive text-white font-bold rounded-[3px] hover:bg-destructive/90">Delete project</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function OverviewStat({ label, value, icon: Icon, color }: any) {
   return (
      <div className="bg-background rounded-[3px] p-5 shadow-sm border border-border/40 hover:border-primary/40 transition-all group">
         <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Icon className={cn("h-4 w-4", color)} />
            </div>
         </div>
         <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
         <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
   )
}

function DetailItem({ label, value, color, bgColor, isUser }: any) {
   return (
      <div className="flex items-center justify-between">
         <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">{label}</span>
         {isUser ? (
            <div className="flex items-center gap-2">
               <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-orange-500 text-[8px] text-white">RE</AvatarFallback>
               </Avatar>
               <span className="text-xs font-bold text-foreground">{value}</span>
            </div>
         ) : color ? (
            <Badge variant="secondary" className={cn("text-[10px] uppercase font-bold", bgColor, color)}>{value}</Badge>
         ) : (
            <span className="text-xs font-bold text-foreground">{value}</span>
         )}
      </div>
   )
}
