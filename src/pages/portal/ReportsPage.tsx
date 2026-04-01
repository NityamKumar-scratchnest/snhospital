import { Link } from "react-router-dom"
import { mockReports, mockVisits } from "../../data/patientPortalMock"

function visitDateFor(id: string) {
  return mockVisits.find((v) => v.id === id)?.date
}

export default function ReportsPage() {
  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold sm:text-4xl">Lab &amp; reports</h1>
        <p className="text-scratch-muted">
          Summaries from your GP visits. PDF download will use your API later.
        </p>
      </header>
      <ul className="flex flex-col gap-4">
        {mockReports.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-scratch-border bg-scratch-surface p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-scratch-text">
                  {r.title}
                </h2>
                <p className="mt-1 text-sm text-scratch-muted">
                  {r.provider} · {r.date}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-scratch-border bg-scratch-bg px-4 py-2 text-sm font-bold text-scratch-text transition hover:bg-scratch-surface-2"
                data-cursor="pointer"
              >
                View PDF
              </button>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-scratch-text/90">{r.summary}</p>
            <Link
              to={`/portal/visits/${r.visitId}`}
              className="text-sm font-bold text-scratch-accent no-underline hover:underline"
              data-cursor="pointer"
            >
              Linked visit ({visitDateFor(r.visitId)}) →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
