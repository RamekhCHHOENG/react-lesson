import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { Comment } from "@/types"
import { toast } from "sonner"

export function useComments(taskId: string | undefined) {
  return useQuery<Comment[]>({
    queryKey: ["comments", taskId],
    queryFn: () => api.get(`/api/tasks/${taskId}/comments`),
    enabled: !!taskId,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      api.post<Comment>(`/api/tasks/${taskId}/comments`, { content }),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      toast.success("Comment added")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; taskId: string; content: string }) =>
      api.put<Comment>(`/api/comments/${commentId}`, { content }),
    onSuccess: (_, { taskId: tid }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", tid] })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; taskId: string }) =>
      api.delete(`/api/comments/${commentId}`),
    onSuccess: (_, { taskId: tid }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", tid] })
      toast.success("Comment deleted")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
