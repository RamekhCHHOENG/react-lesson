// ============================================================================
// Auth Store – React Context + useReducer
// ============================================================================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@/types";
import { api, ApiRequestError } from "@/services/api";

// ── State ─────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("jira_token"),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// ── Actions ───────────────────────────────────────────────────────────────

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: User };

// ── Reducer ───────────────────────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const storedToken = localStorage.getItem("jira_token");
      if (!storedToken) {
        dispatch({ type: "LOGOUT" });
        return;
      }

      try {
        const user = await api.get<User>("/api/auth/me");
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, token: storedToken },
        });
      } catch {
        localStorage.removeItem("jira_token");
        dispatch({ type: "LOGOUT" });
      }
    };

    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await api.post<{ access_token: string; user: User }>(
        "/api/auth/login",
        { email, password },
      );
      localStorage.setItem("jira_token", res.access_token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: res.user, token: res.access_token },
      });
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.detail : "Login failed";
      localStorage.removeItem("jira_token");
      dispatch({ type: "LOGIN_FAILURE", payload: message });
      throw err;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      dispatch({ type: "LOGIN_START" });
      try {
        const res = await api.post<{ access_token: string; user: User }>(
          "/api/auth/register",
          { email, password, full_name: fullName },
        );
        localStorage.setItem("jira_token", res.access_token);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: res.user, token: res.access_token },
        });
      } catch (err) {
        const message =
          err instanceof ApiRequestError ? err.detail : "Registration failed";
        localStorage.removeItem("jira_token");
        dispatch({ type: "LOGIN_FAILURE", payload: message });
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("jira_token");
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}
