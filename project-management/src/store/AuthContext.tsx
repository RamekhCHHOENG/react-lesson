import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface AuthState {
 isAuthenticated: boolean
 user: { email: string; name: string } | null
}

interface AuthContextType extends AuthState {
 login: (email: string, password: string) => { success: boolean; error?: string }
 logout: () => void
}

// Static credentials — replace with real auth later
const STATIC_CREDENTIALS = {
 email: "admin@projecthub.com",
 password: "admin123",
 name: "Admin User",
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
 const [auth, setAuth] = useState<AuthState>(() => {
 const stored = sessionStorage.getItem("projecthub_auth")
 if (stored) {
 try {
 return JSON.parse(stored)
 } catch {
 return { isAuthenticated: false, user: null }
 }
 }
 return { isAuthenticated: false, user: null }
 })

 const login = useCallback((email: string, password: string) => {
 if (email === STATIC_CREDENTIALS.email && password === STATIC_CREDENTIALS.password) {
 const newAuth: AuthState = {
 isAuthenticated: true,
 user: { email: STATIC_CREDENTIALS.email, name: STATIC_CREDENTIALS.name },
 }
 setAuth(newAuth)
 sessionStorage.setItem("projecthub_auth", JSON.stringify(newAuth))
 return { success: true }
 }
 return { success: false, error: "Invalid email or password" }
 }, [])

 const logout = useCallback(() => {
 setAuth({ isAuthenticated: false, user: null })
 sessionStorage.removeItem("projecthub_auth")
 }, [])

 return (
 <AuthContext.Provider value={{ ...auth, login, logout }}>
 {children}
 </AuthContext.Provider>
 )
}

export function useAuth() {
 const ctx = useContext(AuthContext)
 if (!ctx) throw new Error("useAuth must be used within AuthProvider")
 return ctx
}
