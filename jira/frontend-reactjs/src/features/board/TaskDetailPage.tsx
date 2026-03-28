import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useProject } from "@/hooks/useProjects"
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks"
import { useSprints } from "@/hooks/useSprints"
import { useEpics } from "@/hooks/useEpics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ArrowLeft, Calendar, Clock, Trash2, User, Zap, Milestone } from "lucide-react"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import { formatDate, timeAgo, getInitials, isOverdue } from "@/lib/utils"
import { CommentsList } from "@/features/board/components/CommentsList"
import { SubtasksList } from "@/features/board/components/SubtasksList"
import { LinkedIssues } from "@/features/board/components/LinkedIssues"
import { ActivityTimeline } from "@/components/shared/ActivityTimeline"
import type { TaskStatus, TaskPriority } from "@/types"

export default function TaskDetailPage() {
  const { projectId, taskId } = useParams()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(projectId)
  const { data: sprints = [] } = useSprints(projectId)
  const { data: epics = [] } = useEpics(projectId)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const [showDelete, setShowDelete] = useState(false)

  const task = project?.tasks.find((t) => t.id === taskId)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!task || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">Task not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    )
  }

  const typeConfig = task.issue_type ? ISSUE_TYPE_CONFIG[task.issue_type] : null

  const handleStatusChange = (status: TaskStatus) => {
    updateTask.mutate({ projectId: project.id, taskId: task.id, data: { status } })
  }

  const handlePriorityChange = (priority: TaskPriority) => {
    updateTask.mutate({ projectId: project.id, taskId: task.id, data: { priority } })
  }

  const handleSprintChange = (sprintId: string) => {
    const value = sprintId === "none" ? null : sprintId
    updateTask.mutate({ projectId: project.id, taskId: task.id, data: { sprint_id: value } as any })
  }

  const handleEpicChange = (epicId: string) => {
    const value = epicId === "none" ? null : epicId
    updateTask.mutate({ projectId: project.id, taskId: task.id, data: { epic_id: value } as any })
  }

  const handleDelete = async () => {
    await deleteTask.mutateAsync({ projectId: project.id, taskId: task.id })
    navigate(`/projects/${project.id}`)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/projects" className="hover:text-foreground">Projects</Link>
        <span>/</span>
        <Link to={`/projects/${project.id}`} className="hover:text-foreground">{project.name}</Link>
        <span>/</span>
        <span className="text-foreground font-mono">{task.issue_key}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {typeConfig && (
              <Badge variant="secondary" className={`${typeConfig.bgColor} ${typeConfig.color}`}>
                {typeConfig.label}
              </Badge>
            )}
            <span className="text-sm font-mono text-muted-foreground">{task.issue_key}</span>
          </div>
          <h1 className="text-xl font-bold mt-1">{task.title}</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Tabs: Comments + Activity + Subtasks */}
          <Tabs defaultValue="comments">
            <TabsList>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <CommentsList taskId={task.id} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="subtasks" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Subtasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <SubtasksList projectId={project.id} taskId={task.id} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <ActivityTimeline taskId={task.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Status */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        <span className={cfg.color}>{cfg.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">Priority</p>
                <Select value={task.priority || ""} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Set priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        {cfg.icon} {cfg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sprint */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Sprint
                </p>
                <Select value={task.sprint_id || "none"} onValueChange={handleSprintChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="No sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No sprint</SelectItem>
                    {sprints.filter((s) => s.status !== "completed").map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} {s.status === "active" ? "(Active)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Epic */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <Milestone className="h-3 w-3" /> Epic
                </p>
                <Select value={task.epic_id || "none"} onValueChange={handleEpicChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="No epic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No epic</SelectItem>
                    {epics.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Assignee */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">Assignee</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {task.assignee ? getInitials(task.assignee) : <User className="h-3 w-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assignee || "Unassigned"}</span>
                </div>
              </div>

              {/* Reporter */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">Reporter</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {task.reporter ? getInitials(task.reporter) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.reporter || "Unknown"}</span>
                </div>
              </div>

              <Separator />

              {/* Project */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">Project</p>
                <Link to={`/projects/${project.id}`} className="text-sm text-primary hover:underline">
                  {project.name} ({project.key})
                </Link>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">Due Date</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className={task.due_date && task.status !== "done" && isOverdue(task.due_date) ? "text-destructive" : ""}>
                    {formatDate(task.due_date)}
                  </span>
                </div>
              </div>

              {/* Story Points */}
              {task.story_points !== null && task.story_points !== undefined && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Story Points</p>
                  <Badge variant="outline">{task.story_points}</Badge>
                </div>
              )}

              <Separator />

              {/* Linked Issues */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">Linked Issues</p>
                <LinkedIssues projectId={project.id} taskId={task.id} />
              </div>

              <Separator />

              {/* Dates */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">Created</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo(task.created_at)}
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase">Updated</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo(task.updated_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task {task.issue_key}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{task.title}" and all its comments. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
