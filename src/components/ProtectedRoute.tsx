import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute() {
  const { user, initialized } = useAuth()
  const location = useLocation()

  if (!initialized) {
    return (
      <div
        className="flex min-h-svh flex-col items-center justify-center gap-4 text-scratch-muted"
        role="status"
        aria-live="polite"
      >
        <div
          className="h-11 w-11 animate-spin rounded-full border-[3px] border-scratch-accent/20 border-t-scratch-accent"
          aria-hidden
        />
        <p>Loading Scratchnest…</p>
      </div>
    )
  }

  if (!user || user.role !== "patient") {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
