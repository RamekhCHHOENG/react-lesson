import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Bug,
  CheckSquare,
  ChevronsUp,
  GitBranch,
  Loader2,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  Zap,
} from "lucide-react"
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/useComments"
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, ISSUE_TYPE_CONFIG } from "@/config"
import { cn, formatDate, timeAgo, getInitials } from "@/lib/utils"
import type { Task, TaskStatus, TaskPriority, IssueType } from "@/types"

interface TaskDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  projectId: string
  onEdit?: (task: Task) => void
}

const ISSUE_TYPE_ICONS: Record<IssueType, typeof Bug> = {
  bug: Bug,
  story: BookOpen,
  task: CheckSquare,
  epic: Zap,
  subtask: GitBranch,
}

const PRIORITY_ICONS: Record<TaskPriority, typeof ArrowUp> = {
  urgent: ChevronsUp,
  high: ArrowUp,
  medium: ArrowRight,
  low: ArrowDown,
}

export function TaskDetailDrawer({
  open,
  onOpenChange,
  task,
  projectId,
  onEdit,
}: TaskDetailDrawerProps) {
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const { data: comments = [] } = useComments(task?.id)
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()
  const [commentText, setCommentText] = useState("")

  if (!task) return null

  const typeConfig = ISSUE_TYPE_CONFIG[task.issue_type]
  const statusConfig = TASK_STATUS_CONFIG[task!.status]
  const priorityConfig = TASK_PRIORITY_CONFIG[task!.priority]
  const TypeIcon = ISSUE_TYPE_ICONS[task!.issue_type]
  const PriorityIcon = PRIORITY_ICONS[task!.priority]

  function handleStatusChange(status: TaskStatus) {
    updateTask.mutate({ projectId, taskId: task!.id, data: { status } })
  }

  function handlePriorityChange(priority: TaskPriority) {
    updateTask.mutate({ projectId, taskId: task!.id, data: { priority } })
  }

  function handleDelete() {
    deleteTask.mutate(
      { projectId, taskId: task!.id },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  function handleAddComment() {
    if (!commentText.trim()) return
    createComment.mutate(
      { taskId: task!.id, content: commentText.trim() },
      { onSuccess: () => setCommentText("") },
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-l border-white/8 bg-[#1d2125] p-0 sm:max-w-[580px]"
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <SheetHeader className="border-b border-white/8 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className={cn("grid h-7 w-7 place-items-center rounded", typeConfig.bgColor)}>
                <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
              </div>
              <span className="text-sm font-semibold tracking-wider text-[#9fadbc]">
                {task.issue_key}
              </span>
              <Badge variant="secondary" className={cn("text-[10px]", typeConfig.bgColor, typeConfig.color)}>
                {typeConfig.label}
              </Badge>
              <div className="ml-auto flex items-center gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#9fadbc] hover:text-white"
                    onClick={() => onEdit(task)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#9fadbc] hover:text-[#f87168]"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <SheetTitle className="mt-2 text-xl font-semibold text-white">
              {task.title}
            </SheetTitle>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Status bar */}
            <div className="flex gap-3 border-b border-white/8 px-6 py-3">
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-8 w-[140px] border-white/10 bg-[#22272b] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={task.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="h-8 w-[120px] border-white/10 bg-[#22272b] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            {task.description && (
              <div className="border-b border-white/8 px-6 py-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9fadbc]">
                  Description
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#dfe1e6]">
                  {task.description}
                </p>
              </div>
            )}

            {/* Details grid */}
            <div className="border-b border-white/8 px-6 py-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9fadbc]">
                Details
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
                <span className="text-[#9fadbc]">Status</span>
                <span className={cn("font-medium", statusConfig.color)}>
                  {statusConfig.label}
                </span>

                <span className="text-[#9fadbc]">Priority</span>
                <span className="flex items-center gap-2">
                  <PriorityIcon className="h-4 w-4" style={{ color: priorityConfig.color.replace("text-", "") }} />
                  <span className="text-[#dfe1e6]">{priorityConfig.label}</span>
                </span>

                <span className="text-[#9fadbc]">Assignee</span>
                <span className="flex items-center gap-2 text-[#dfe1e6]">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-[#253247] text-[10px] font-semibold text-[#85b8ff]">
                    {getInitials(task.assignee || "Unassigned")}
                  </div>
                  {task.assignee || "Unassigned"}
                </span>

                <span className="text-[#9fadbc]">Reporter</span>
                <span className="flex items-center gap-2 text-[#dfe1e6]">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-[#253247] text-[10px] font-semibold text-[#85b8ff]">
                    {getInitials(task.reporter || "Unassigned")}
                  </div>
                  {task.reporter || "Unassigned"}
                </span>

                <span className="text-[#9fadbc]">Due date</span>
                <span className="text-[#dfe1e6]">
                  {task.due_date ? formatDate(task.due_date) : "None"}
                </span>

                <span className="text-[#9fadbc]">Story points</span>
                <span className="text-[#dfe1e6]">{task.story_points ?? "—"}</span>

                {task.labels && task.labels.length > 0 && (
                  <>
                    <span className="text-[#9fadbc]">Labels</span>
                    <div className="flex flex-wrap gap-1">
                      {task.labels.map((label) => (
                        <Badge key={label} variant="secondary" className="text-[10px]">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}

                <span className="text-[#9fadbc]">Created</span>
                <span className="text-[#dfe1e6]">{formatDate(task.created_at)}</span>

                <span className="text-[#9fadbc]">Updated</span>
                <span className="text-[#dfe1e6]">{timeAgo(task.updated_at)}</span>
              </div>
            </div>

            {/* Comments */}
            <div className="px-6 py-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9fadbc]">
                <MessageSquare className="h-3.5 w-3.5" />
                Comments ({comments.length})
              </div>

              <div className="mb-4 flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  className="min-h-[60px] border-white/10 bg-[#22272b] text-sm text-white placeholder:text-[#6b778c]"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleAddComment()
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0 bg-[#579dff] text-[#0f1419] hover:bg-[#85b8ff]"
                  onClick={handleAddComment}
                  disabled={createComment.isPending || !commentText.trim()}
                >
                  {createComment.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-[3px] border border-white/8 bg-[#22272b] p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-[#253247] text-[10px] font-semibold text-[#85b8ff]">
                          {getInitials(comment.user_id || "U")}
                        </div>
                        <span className="text-xs text-[#9fadbc]">
                          {timeAgo(comment.created_at)}
                        </span>
                        {comment.is_edited && (
                          <span className="text-[10px] italic text-[#6b778c]">edited</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-[#6b778c] hover:text-[#f87168]"
                        onClick={() =>
                          deleteComment.mutate({
                            commentId: comment.id,
                            taskId: task.id,
                          })
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-[#dfe1e6]">
                      {comment.content}
                    </p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="py-4 text-center text-sm text-[#6b778c]">
                    No comments yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
