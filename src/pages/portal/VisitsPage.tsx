import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { mockVisits } from "../../data/patientPortalMock"

const typeStyles: Record<string, string> = {
  OPD: "bg-slate-100 text-slate-800",
  "Follow-up": "bg-teal-100 text-teal-900",
  Acute: "bg-amber-100 text-amber-900",
}

export default function VisitsPage() {
  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-scratch-accent">
          Clinical timeline
        </p>
        <h1 className="mb-2 text-3xl font-semibold sm:text-4xl">Visit history</h1>
        <p className="max-w-xl text-scratch-muted">
          Every OPD note in one place — what you came for, what we found, the plan,
          and when to come back. Open a visit for full reports and prescriptions
          from that day.
        </p>
      </header>

      <ol className="relative space-y-0 border-l-2 border-scratch-border pl-8">
        {mockVisits.map((v, i) => (
          <motion.li
            key={v.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative pb-10 last:pb-0"
          >
            <span
              className="absolute -left-[calc(0.5rem+1px)] top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-scratch-surface bg-scratch-accent"
              aria-hidden
            />
            <div className="rounded-2xl border border-scratch-border bg-scratch-surface p-5 shadow-sm transition hover:border-scratch-accent/30 hover:shadow-md">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${typeStyles[v.type] ?? "bg-scratch-surface-2"}`}
                >
                  {v.type}
                </span>
                <time className="text-sm font-semibold text-scratch-text">{v.date}</time>
              </div>
              <h2 className="mb-1 font-display text-xl font-semibold text-scratch-text">
                {v.chiefComplaint}
              </h2>
              <p className="mb-3 text-sm text-scratch-muted">
                {v.doctor} · {v.doctorQuals}
              </p>
              <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-scratch-text/90">
                <span className="font-semibold text-scratch-accent">Assessment: </span>
                {v.assessment}
              </p>
              {v.revisitBy && (
                <p className="mb-4 rounded-xl bg-scratch-accent/10 px-3 py-2 text-sm font-medium text-scratch-accent">
                  Next review: {v.revisitBy}
                </p>
              )}
              <Link
                to={`/portal/visits/${v.id}`}
                className="inline-flex text-sm font-bold text-scratch-accent no-underline hover:underline"
                data-cursor="pointer"
              >
                View full visit →
              </Link>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
