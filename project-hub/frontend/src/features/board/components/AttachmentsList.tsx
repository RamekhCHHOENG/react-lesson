import { useRef } from "react"
import { useAttachments, useUploadAttachment, useDeleteAttachment } from "@/hooks/useAttachments"
import type { Attachment } from "@/hooks/useAttachments"
import { Button } from "@/components/ui/button"
import { Paperclip, Upload, Trash2, FileText, Image, File, Loader2 } from "lucide-react"
import { timeAgo } from "@/lib/utils"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(contentType: string) {
  if (contentType.startsWith("image/")) return <Image className="h-4 w-4 text-blue-500" />
  if (contentType === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />
  return <File className="h-4 w-4 text-muted-foreground" />
}

interface AttachmentsListProps {
  taskId: string
}

export function AttachmentsList({ taskId }: AttachmentsListProps) {
  const { data: attachments = [], isLoading } = useAttachments(taskId)
  const uploadMutation = useUploadAttachment()
  const deleteMutation = useDeleteAttachment()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadMutation.mutate({ taskId, file })
    e.target.value = ""
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.txt,.csv,.md,.json,.zip,.gz,.doc,.docx,.xlsx,.pptx"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Attach file
        </Button>
        <span className="text-xs text-muted-foreground">Max 10 MB</span>
      </div>

      {/* Attachment list */}
      {attachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Paperclip className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No attachments yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((att: Attachment) => (
            <div
              key={att.id}
              className="flex items-center gap-3 rounded-md border border-border/50 px-3 py-2 group hover:bg-muted/30 transition-colors"
            >
              {getFileIcon(att.contentType)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{att.originalName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatFileSize(att.size)}</span>
                  <span>·</span>
                  <span>{att.user?.name || "Unknown"}</span>
                  <span>·</span>
                  <span>{timeAgo(att.createdAt)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={() => deleteMutation.mutate({ taskId, attachmentId: att.id })}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
