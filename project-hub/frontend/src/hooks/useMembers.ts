import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { ProjectMember, MemberRole } from "@/types"
import { toast } from "sonner"

export function useMembers(projectId: string | undefined) {
  return useQuery<ProjectMember[]>({
    queryKey: ["members", projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/members`),
    enabled: !!projectId,
  })
}

export function useAddMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, userId, role }: { projectId: string; userId: string; role: MemberRole }) =>
      api.post(`/api/projects/${projectId}/members`, { user_id: userId, role }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["members", projectId] })
      toast.success("Member added")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, memberId, role }: { projectId: string; memberId: string; role: MemberRole }) =>
      api.put(`/api/projects/${projectId}/members/${memberId}`, { role }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["members", projectId] })
      toast.success("Role updated")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
      api.delete(`/api/projects/${projectId}/members/${memberId}`),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["members", projectId] })
      toast.success("Member removed")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
