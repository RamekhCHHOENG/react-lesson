import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { Label, LabelFormData } from "@/types"
import { toast } from "sonner"

export function useLabels() {
  return useQuery<Label[]>({
    queryKey: ["labels"],
    queryFn: () => api.get("/api/labels"),
  })
}

export function useCreateLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LabelFormData) => api.post<Label>("/api/labels", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] })
      toast.success("Label created")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ labelId, data }: { labelId: string; data: Partial<LabelFormData> }) =>
      api.put<Label>(`/api/labels/${labelId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] })
      toast.success("Label updated")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (labelId: string) => api.delete(`/api/labels/${labelId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels"] })
      toast.success("Label deleted")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
