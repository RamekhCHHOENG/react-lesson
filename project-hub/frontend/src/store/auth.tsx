import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User } from "@/types"
import { api } from "@/services/api"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("jira_token"))
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("jira_token")
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("jira_token")
      if (!storedToken) {
        setIsLoading(false)
        return
      }
      try {
        const me = await api.get<User>("/api/auth/me")
        setUser(me)
        setToken(storedToken)
      } catch {
        logout()
      } finally {
        setIsLoading(false)
      }
    }
    restoreSession()
  }, [logout])

  const login = async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; user: User }>("/api/auth/login", { email, password })
    localStorage.setItem("jira_token", res.access_token)
    setToken(res.access_token)
    setUser(res.user)
  }

  const register = async (email: string, password: string, fullName: string) => {
    const res = await api.post<{ access_token: string; user: User }>("/api/auth/register", {
      email,
      password,
      full_name: fullName,
    })
    localStorage.setItem("jira_token", res.access_token)
    setToken(res.access_token)
    setUser(res.user)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
