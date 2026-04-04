import { useState } from "react"
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/useComments"
import { useAuth } from "@/store/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Loader2, Trash2, Send } from "lucide-react"
import { getInitials, timeAgo } from "@/lib/utils"

interface CommentsListProps {
  taskId: string
}

export function CommentsList({ taskId }: CommentsListProps) {
  const { user } = useAuth()
  const { data: comments, isLoading } = useComments(taskId)
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()

  const [content, setContent] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    await createComment.mutateAsync({ taskId, content: content.trim() })
    setContent("")
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteComment.mutateAsync({ commentId: deleteId, taskId })
    setDeleteId(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {user ? getInitials(user.full_name) : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!content.trim() || createComment.isPending}>
              {createComment.isPending ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Send className="mr-2 h-3 w-3" />
              )}
              Comment
            </Button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">
                {comment.user ? getInitials(comment.user.full_name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.user?.full_name ?? "Unknown"}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
              </div>
              <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">{comment.content}</p>
              {comment.user_id === user?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteId(comment.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
        {comments?.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">No comments yet. Be the first to comment.</p>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
