import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { api, clearAuthToken, getAuthToken, setAuthToken, type AuthUser } from "@/services/api"

interface AuthState {
	isAuthenticated: boolean
	isLoading: boolean
	user: AuthUser | null
}

interface AuthContextType extends AuthState {
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
	logout: () => void
}

const AUTH_STORAGE_KEY = "projecthub_auth"

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [auth, setAuth] = useState<AuthState>({
		isAuthenticated: false,
		isLoading: true,
		user: null,
	})

	useEffect(() => {
		const restoreSession = async () => {
			const token = getAuthToken()
			const stored = sessionStorage.getItem(AUTH_STORAGE_KEY)

			if (!token) {
				setAuth({ isAuthenticated: false, isLoading: false, user: null })
				return
			}

			try {
				const me = await api.auth.me()
				const nextAuth: AuthState = {
					isAuthenticated: true,
					isLoading: false,
					user: me.data,
				}
				setAuth(nextAuth)
				sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth))
			} catch {
				clearAuthToken()
				sessionStorage.removeItem(AUTH_STORAGE_KEY)
				if (stored) {
					sessionStorage.removeItem(AUTH_STORAGE_KEY)
				}
				setAuth({ isAuthenticated: false, isLoading: false, user: null })
			}
		}

		void restoreSession()
	}, [])

	const login = useCallback(async (email: string, password: string) => {
		try {
			const response = await api.auth.login(email, password)
			setAuthToken(response.data.accessToken)

			const nextAuth: AuthState = {
				isAuthenticated: true,
				isLoading: false,
				user: response.data.user,
			}

			setAuth(nextAuth)
			sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth))
			return { success: true }
		} catch (error) {
			const message = error && typeof error === "object" && "message" in error
				? String(error.message)
				: "Login failed"
			return { success: false, error: message }
		}
	}, [])

	const logout = useCallback(() => {
		clearAuthToken()
		sessionStorage.removeItem(AUTH_STORAGE_KEY)
		setAuth({ isAuthenticated: false, isLoading: false, user: null })
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
