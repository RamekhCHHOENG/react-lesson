import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import type { User, UpdateProfileRequest, ChangePasswordRequest } from "@/types"
import { toast } from "sonner"

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => api.put<User>("/api/auth/me", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      toast.success("Profile updated")
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => api.post("/api/auth/change-password", data),
    onSuccess: () => toast.success("Password changed successfully"),
    onError: (err: Error) => toast.error(err.message),
  })
}
