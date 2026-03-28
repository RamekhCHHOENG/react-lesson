// ============================================================================
// User Service
// ============================================================================

import { api } from "@/services/api";
import type { User, UpdateProfileRequest, ChangePasswordRequest } from "@/types";

export const userService = {
  getProfile(): Promise<User> {
    return api.get<User>("/api/auth/me");
  },

  updateProfile(data: UpdateProfileRequest): Promise<User> {
    return api.put<User>("/api/auth/me", data);
  },

  changePassword(data: ChangePasswordRequest): Promise<void> {
    return api.post("/api/auth/change-password", data);
  },
};
