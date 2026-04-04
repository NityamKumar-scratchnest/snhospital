import { Outlet, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../../context/AuthContext"

export default function DoctorLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const doctor = user?.role === "doctor" ? user : null

  return (
    <div className="flex min-h-svh flex-col md:h-svh md:flex-row md:overflow-hidden">
      <aside className="flex w-full shrink-0 flex-col gap-6 overflow-y-auto border-b border-scratch-border bg-scratch-surface px-5 py-5 md:h-full md:w-[272px] md:border-b-0 md:border-r md:py-6">
        <div>
          <span className="font-display block text-xl font-semibold tracking-tight text-scratch-text">
            Scratchnest
          </span>
          <span className="mt-1 block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-scratch-muted">
            Doctor
          </span>
        </div>
        <nav className="flex flex-col gap-0.5" aria-label="Doctor portal">
          <span className="rounded-xl bg-scratch-accent/15 px-3 py-2.5 text-[0.92rem] font-medium text-scratch-accent">
            Dashboard
          </span>
        </nav>
        <div className="mt-auto border-t border-scratch-border pt-5">
          <p className="m-0 truncate text-sm font-semibold text-scratch-text">
            {doctor?.name}
          </p>
          <p className="mb-1 truncate text-xs text-scratch-muted">{doctor?.specialization}</p>
          <p className="mb-4 truncate text-xs text-scratch-muted">{doctor?.email}</p>
          <button
            type="button"
            className="w-full rounded-full border border-scratch-border bg-scratch-bg py-2 text-sm font-semibold text-scratch-text transition hover:bg-scratch-surface-2"
            data-cursor="pointer"
            onClick={() => {
              logout()
              navigate("/doctor/login", { replace: true })
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-scratch-bg px-5 py-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto w-full max-w-7xl lg:mx-0 xl:max-w-none"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
