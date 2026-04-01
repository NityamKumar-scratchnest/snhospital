import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../../context/AuthContext"
import {
  mockAppointments,
  mockReports,
  mockVisits,
} from "../../data/patientPortalMock"

const shortcuts = [
  {
    to: "/portal/visits",
    title: "Visit history",
    desc: "Problems, doctors’ notes, plans, and follow-up dates.",
    accent: "from-teal-600/20 to-scratch-surface",
  },
  {
    to: "/portal/revisit",
    title: "Book a revisit",
    desc: "Call, AI chat, or leave a note for the front desk.",
    accent: "from-scratch-accent/25 to-scratch-surface",
  },
  {
    to: "/portal/reports",
    title: "Lab & imaging",
    desc: "CBC, lipids, and more — tied to your visits.",
    accent: "from-emerald-600/15 to-scratch-surface",
  },
  {
    to: "/portal/prescriptions",
    title: "Prescriptions",
    desc: "Active medicines and how to take them.",
    accent: "from-cyan-600/15 to-scratch-surface",
  },
  {
    to: "/portal/bills",
    title: "Bills",
    desc: "Consults and lab charges in ₹.",
    accent: "from-slate-500/15 to-scratch-surface",
  },
  {
    to: "/portal/appointments",
    title: "Appointments",
    desc: "What’s coming up at the clinic.",
    accent: "from-violet-500/15 to-scratch-surface",
  },
]

export default function PortalHome() {
  const { user } = useAuth()
  const latest = mockVisits[0]
  const nextAppt = mockAppointments[0]
  const openReports = mockReports.length

  return (
    <div className="max-w-4xl">
      <header className="mb-10">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-scratch-accent">
          Your health file
        </p>
        <h1 className="mb-2 text-3xl font-semibold sm:text-4xl">
          Hello, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="max-w-xl text-scratch-muted">
          You’re signed in with offline demo data — when your API is ready, the same
          screens will fill from your real records. Everything here is structured
          like a top-tier hospital portal, tuned for a GP clinic.
        </p>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <motion.div
          className="rounded-2xl border border-scratch-border bg-scratch-surface p-5 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-scratch-muted">
            Last visit
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-scratch-text">
            {latest?.date ?? "—"}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-scratch-muted">
            {latest?.chiefComplaint ?? "No visits yet"}
          </p>
          {latest && (
            <Link
              to={`/portal/visits/${latest.id}`}
              className="mt-3 inline-block text-sm font-bold text-scratch-accent no-underline hover:underline"
              data-cursor="pointer"
            >
              Open note →
            </Link>
          )}
        </motion.div>
        <motion.div
          className="rounded-2xl border border-scratch-border bg-scratch-surface p-5 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-scratch-muted">
            Next appointment
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-scratch-text">
            {nextAppt?.when?.includes("·")
              ? nextAppt.when.split("·")[0]?.trim()
              : (nextAppt?.when ?? "—")}
          </p>
          <p className="mt-1 text-sm text-scratch-muted">{nextAppt?.reason}</p>
          <Link
            to="/portal/appointments"
            className="mt-3 inline-block text-sm font-bold text-scratch-accent no-underline hover:underline"
            data-cursor="pointer"
          >
            View schedule →
          </Link>
        </motion.div>
        <motion.div
          className="rounded-2xl border border-scratch-border bg-scratch-surface p-5 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-scratch-muted">
            Reports on file
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-scratch-accent">
            {openReports}
          </p>
          <p className="mt-1 text-sm text-scratch-muted">Released to your portal</p>
          <Link
            to="/portal/reports"
            className="mt-3 inline-block text-sm font-bold text-scratch-accent no-underline hover:underline"
            data-cursor="pointer"
          >
            Browse →
          </Link>
        </motion.div>
      </div>

      <h2 className="mb-4 font-display text-xl font-semibold">Quick links</h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {shortcuts.map((c, i) => (
          <motion.li
            key={c.to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04 }}
          >
            <Link
              to={c.to}
              className={`block h-full rounded-2xl border border-scratch-border bg-gradient-to-br ${c.accent} p-5 shadow-sm no-underline transition hover:-translate-y-0.5 hover:border-scratch-accent/25 hover:shadow-md`}
              data-cursor="pointer"
            >
              <h3 className="mb-1 font-display text-lg font-semibold text-scratch-text">
                {c.title}
              </h3>
              <p className="text-sm text-scratch-muted">{c.desc}</p>
              <span className="mt-4 inline-block text-sm font-bold text-scratch-accent">
                Open →
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
