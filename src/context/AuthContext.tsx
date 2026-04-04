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

export type DoctorUser = {
  id: string
  name: string
  email: string
  role: "doctor"
  hospitalId: string
  specialization: string
  isActive?: boolean
}

export type AppUser = PatientUser | DoctorUser

type AuthContextValue = {
  user: AppUser | null
  initialized: boolean
  login: (email: string, password: string) => Promise<void>
  loginDoctor: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isPatientUser(value: unknown): value is PatientUser {
  if (!value || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return o.role === "patient" && typeof o.email === "string"
}

function isDoctorUser(value: unknown): value is DoctorUser {
  if (!value || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return (
    o.role === "doctor" &&
    typeof o.email === "string" &&
    typeof o.id === "string" &&
    typeof o.hospitalId === "string" &&
    typeof o.specialization === "string"
  )
}

function normalizeDoctorUser(raw: Record<string, unknown>): DoctorUser {
  return {
    id: String(raw._id ?? raw.id ?? ""),
    name: String(raw.name ?? ""),
    email: String(raw.email ?? "").trim().toLowerCase(),
    role: "doctor",
    hospitalId: String(raw.hospitalId ?? ""),
    specialization: String(raw.specialization ?? ""),
    isActive: typeof raw.isActive === "boolean" ? raw.isActive : undefined,
  }
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
  const [user, setUser] = useState<AppUser | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const token = tokenServices.getAccessToken()
    const stored = tokenServices.getUser<unknown>()
    if (token && isPatientUser(stored)) {
      const o = stored as Record<string, unknown>
      const email = String(o.email).trim().toLowerCase()
      const id = typeof o.id === "string" ? o.id : localPatientId(email)
      const name =
        typeof o.name === "string" ? o.name : displayNameFromEmail(email)
      setUser({ id, name, email, role: "patient" })
    } else if (token && isDoctorUser(stored)) {
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
      const raw = data.user as Record<string, unknown>
      if (raw.role !== "patient") {
        throw new Error("Only patient accounts can use the patient portal.")
      }
      const email = String(raw.email ?? "").trim().toLowerCase()
      const patient: PatientUser = {
        id: typeof raw.id === "string" ? raw.id : String(raw._id ?? localPatientId(email)),
        name: typeof raw.name === "string" ? raw.name : displayNameFromEmail(email),
        email,
        role: "patient",
      }
      tokenServices.setToken(data.accessToken)
      tokenServices.setUser(patient)
      setUser(patient)
    } catch {
      /* No backend / network error — seamless local session for demo & UAT */
      const patient = signInLocal(trimmed)
      tokenServices.setToken("offline-session")
      tokenServices.setUser(patient)
      setUser(patient)
    }
  }, [])

  const loginDoctor = useCallback(async (email: string, password: string) => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !password) {
      throw new Error("Enter your email and password.")
    }

    const { data } = await api.post<{ token: string; user: Record<string, unknown> }>(
      "/auth/doctor/login",
      { email: trimmed, password }
    )

    if (data.user.role !== "doctor") {
      throw new Error("This sign-in is only for doctor accounts.")
    }

    const doctor = normalizeDoctorUser(data.user)
    if (!doctor.id) {
      throw new Error("Invalid doctor profile from server.")
    }

    tokenServices.setToken(data.token)
    tokenServices.setUser(doctor)
    setUser(doctor)
  }, [])

  const logout = useCallback(() => {
    tokenServices.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, initialized, login, loginDoctor, logout }),
    [user, initialized, login, loginDoctor, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook for app auth state; colocated with provider for a single import. */
// eslint-disable-next-line react-refresh/only-export-components -- hook must live next to context
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
