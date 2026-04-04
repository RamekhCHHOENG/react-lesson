import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { toast } from "sonner"

export interface Attachment {
  id: string
  taskId: string
  filename: string
  originalName: string
  contentType: string
  size: number
  createdAt: string
  user: { id: string; email: string; name: string } | null
}

export function useAttachments(taskId: string | undefined) {
  return useQuery<Attachment[]>({
    queryKey: ["attachments", taskId],
    queryFn: () => api.get<Attachment[]>(`/api/tasks/${taskId}/attachments`),
    enabled: !!taskId,
  })
}

export function useUploadAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      api.upload<Attachment>(`/api/tasks/${taskId}/attachments`, file),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["attachments", taskId] })
      toast.success("File uploaded")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Upload failed")
    },
  })
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, attachmentId }: { taskId: string; attachmentId: string }) =>
      api.delete(`/api/tasks/${taskId}/attachments/${attachmentId}`),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["attachments", taskId] })
      toast.success("Attachment deleted")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Delete failed")
    },
  })
}
