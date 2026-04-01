import { Link } from "react-router-dom"
import { mockPrescriptions, mockVisits } from "../../data/patientPortalMock"

function visitLabel(visitId: string) {
  const v = mockVisits.find((x) => x.id === visitId)
  return v ? `${v.date}` : visitId
}

export default function PrescriptionsPage() {
  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold sm:text-4xl">Prescriptions</h1>
        <p className="text-scratch-muted">
          From your Scratchnest consultations — always confirm dose changes with your
          doctor or pharmacist.
        </p>
      </header>
      <ul className="flex flex-col gap-4">
        {mockPrescriptions.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-scratch-border bg-scratch-surface p-5 shadow-sm"
          >
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-scratch-text">
                {r.name}
              </h2>
              <span className="text-xs font-semibold uppercase tracking-wider text-scratch-muted">
                Since {r.startedOn}
              </span>
            </div>
            <p className="mb-2 text-sm font-medium text-scratch-text">{r.sig}</p>
            <p className="mb-3 text-sm text-scratch-muted">{r.refills}</p>
            <Link
              to={`/portal/visits/${r.visitId}`}
              className="text-sm font-bold text-scratch-accent no-underline hover:underline"
              data-cursor="pointer"
            >
              From visit {visitLabel(r.visitId)} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
