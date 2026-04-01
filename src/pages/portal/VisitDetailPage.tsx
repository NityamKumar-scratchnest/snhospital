import { Link, Navigate, useParams } from "react-router-dom"
import {
  getReportsForVisit,
  getRxForVisit,
  getVisitById,
} from "../../data/patientPortalMock"

export default function VisitDetailPage() {
  const { visitId } = useParams<{ visitId: string }>()
  const visit = visitId ? getVisitById(visitId) : undefined

  if (!visit) {
    return <Navigate to="/portal/visits" replace />
  }

  const reports = getReportsForVisit(visit.id)
  const rx = getRxForVisit(visit.id)

  return (
    <div className="max-w-3xl">
      <Link
        to="/portal/visits"
        className="mb-6 inline-block text-sm font-semibold text-scratch-accent no-underline hover:underline"
        data-cursor="pointer"
      >
        ← All visits
      </Link>

      <header className="mb-8 rounded-2xl border border-scratch-border bg-scratch-surface p-6 shadow-sm">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-scratch-muted">
          {visit.type} · {visit.date}
        </p>
        <h1 className="mb-2 font-display text-2xl font-semibold sm:text-3xl">
          {visit.chiefComplaint}
        </h1>
        <p className="text-sm text-scratch-muted">
          <span className="font-semibold text-scratch-text">{visit.doctor}</span>
          <br />
          {visit.doctorQuals}
        </p>
      </header>

      <div className="space-y-6">
        <section className="rounded-2xl border border-scratch-border bg-scratch-surface p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-scratch-accent">
            History
          </h2>
          <p className="text-sm leading-relaxed text-scratch-text/90">{visit.history}</p>
        </section>

        <section className="rounded-2xl border border-scratch-border bg-scratch-surface p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-scratch-accent">
            Vitals &amp; examination
          </h2>
          <p className="mb-3 text-sm font-medium text-scratch-text">{visit.vitals}</p>
          <p className="text-sm leading-relaxed text-scratch-text/90">{visit.examination}</p>
        </section>

        <section className="rounded-2xl border border-scratch-border bg-scratch-surface p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-scratch-accent">
            Assessment
          </h2>
          <p className="text-sm leading-relaxed text-scratch-text/90">{visit.assessment}</p>
        </section>

        <section className="rounded-2xl border border-scratch-border bg-scratch-surface p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-scratch-accent">
            Plan &amp; advice
          </h2>
          <p className="text-sm leading-relaxed text-scratch-text/90">{visit.plan}</p>
          {visit.revisitBy && (
            <p className="mt-4 rounded-xl bg-scratch-accent/10 px-4 py-3 text-sm font-semibold text-scratch-accent">
              Follow-up: {visit.revisitBy}
            </p>
          )}
        </section>

        {reports.length > 0 && (
          <section className="rounded-2xl border border-scratch-border bg-scratch-surface p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-scratch-accent">
              Reports from this visit
            </h2>
            <ul className="space-y-3">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-1 rounded-xl border border-scratch-border/80 bg-scratch-bg/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-semibold text-scratch-text">{r.title}</span>
                    <span className="mt-0.5 block text-xs text-scratch-muted">
                      {r.date} · {r.provider}
                    </span>
                  </div>
                  <Link
                    to="/portal/reports"
                    className="shrink-0 text-sm font-bold text-scratch-accent no-underline hover:underline"
                    data-cursor="pointer"
                  >
                    Open in Reports →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {rx.length > 0 && (
          <section className="rounded-2xl border border-scratch-border bg-scratch-surface p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-scratch-accent">
              Prescriptions linked
            </h2>
            <ul className="space-y-3">
              {rx.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-scratch-border/80 bg-scratch-bg/50 px-4 py-3"
                >
                  <span className="font-semibold text-scratch-text">{p.name}</span>
                  <p className="text-sm text-scratch-muted">{p.sig}</p>
                </li>
              ))}
            </ul>
            <Link
              to="/portal/prescriptions"
              className="mt-4 inline-block text-sm font-bold text-scratch-accent no-underline hover:underline"
              data-cursor="pointer"
            >
              View all prescriptions →
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
