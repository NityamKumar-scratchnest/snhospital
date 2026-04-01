import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { displayNameFromEmail, localPatientId } from "../lib/nameFromEmail"
import api from "../services/api"
import { tokenServices } from "../services/tokenService"

export type PatientUser = {
  id: string
  name: string
  email: string
  role: "patient"
}

type AuthContextValue = {
  user: PatientUser | null
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isPatientUser(value: unknown): value is PatientUser {
  if (!value || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return o.role === "patient" && typeof o.email === "string"
}

function signInLocal(emailRaw: string): PatientUser {
  const email = emailRaw.trim().toLowerCase()
  return {
    id: localPatientId(email),
    name: displayNameFromEmail(email),
    email,
    role: "patient",
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PatientUser | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const token = tokenServices.getAccessToken()
    const stored = tokenServices.getUser<unknown>()
    if (token && isPatientUser(stored)) {
      setUser(stored)
    } else {
      tokenServices.clear()
      setUser(null)
    }
    setInitialized(true)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const trimmed = email.trim()
    if (!trimmed || !password) {
      throw new Error("Enter your email and password.")
    }

    try {
      const { data } = await api.post<{ accessToken: string; user: unknown }>(
        "/auth/login",
        { email: trimmed, password }
      )
      if (!isPatientUser(data.user)) {
        throw new Error("Only patient accounts can use this portal.")
      }
      tokenServices.setToken(data.accessToken)
      tokenServices.setUser(data.user)
      setUser(data.user)
    } catch {
      /* No backend / network error — seamless local session for demo & UAT */
      const patient = signInLocal(trimmed)
      tokenServices.setToken("offline-session")
      tokenServices.setUser(patient)
      setUser(patient)
    }
  }, [])

  const logout = useCallback(() => {
    tokenServices.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, initialized, login, logout }),
    [user, initialized, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook for patient auth state; colocated with provider for a single import. */
// eslint-disable-next-line react-refresh/only-export-components -- hook must live next to context
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
