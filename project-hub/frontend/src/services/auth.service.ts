// ============================================================================
// Auth Service
// ============================================================================

import { api } from "@/services/api";
import type { User, AuthResponse, RegisterRequest } from "@/types";

export const authService = {
  /** Authenticate with email & password */
  login(email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>("/api/auth/login", { email, password });
  },

  /** Register a new account */
  register(data: RegisterRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>("/api/auth/register", data);
  },

  /** Fetch the currently authenticated user */
  getMe(): Promise<User> {
    return api.get<User>("/api/auth/me");
  },
};
