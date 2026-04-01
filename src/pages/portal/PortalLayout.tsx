import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../../context/AuthContext"

const nav = [
  { to: "/portal", end: true, label: "Overview", icon: "◆" },
  { to: "/portal/visits", end: false, label: "Visits & history", icon: "◇" },
  { to: "/portal/revisit", end: false, label: "Revisit", icon: "↻" },
  { to: "/portal/reports", end: false, label: "Reports", icon: "▤" },
  { to: "/portal/prescriptions", end: false, label: "Prescriptions", icon: "Rx" },
  { to: "/portal/bills", end: false, label: "Bills", icon: "₹" },
  { to: "/portal/appointments", end: false, label: "Appointments", icon: "◷" },
]

function navLinkClass(isActive: boolean) {
  return [
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.92rem] font-medium no-underline transition-colors",
    isActive
      ? "bg-scratch-accent/15 text-scratch-accent shadow-sm"
      : "text-scratch-text hover:bg-scratch-accent/8",
  ].join(" ")
}

export default function PortalLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="grid min-h-svh md:grid-cols-[272px_1fr]">
      <aside className="flex flex-col gap-8 border-b border-scratch-border bg-scratch-surface px-5 py-6 md:border-b-0 md:border-r">
        <div>
          <span className="font-display block text-xl font-semibold tracking-tight text-scratch-text">
            Scratchnest
          </span>
          <span className="mt-1 block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-scratch-muted">
            Patient portal
          </span>
        </div>
        <nav className="flex flex-col gap-0.5" aria-label="Portal">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => navLinkClass(isActive)}
              data-cursor="pointer"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-scratch-bg text-xs font-bold text-scratch-accent"
                aria-hidden
              >
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-scratch-border pt-5">
          <p className="m-0 truncate text-sm font-semibold text-scratch-text">{user?.name}</p>
          <p className="mb-4 truncate text-xs text-scratch-muted">{user?.email}</p>
          <button
            type="button"
            className="w-full rounded-full border border-scratch-border bg-scratch-bg py-2 text-sm font-semibold text-scratch-text transition hover:bg-scratch-surface-2"
            data-cursor="pointer"
            onClick={() => {
              logout()
              navigate("/login", { replace: true })
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 bg-scratch-bg px-5 py-8 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-3xl lg:max-w-none lg:mx-0"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
