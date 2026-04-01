import { mockAppointments } from "../../data/patientPortalMock"

export default function AppointmentsPage() {
  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold sm:text-4xl">Appointments</h1>
        <p className="text-scratch-muted">
          Upcoming slots at Scratchnest. Reschedule by calling the clinic or using
          the revisit flow.
        </p>
      </header>
      <ul className="flex flex-col gap-3">
        {mockAppointments.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-scratch-border bg-scratch-surface p-5 shadow-sm"
          >
            <strong className="block font-display text-lg text-scratch-text">{r.when}</strong>
            <span className="mt-1 block text-sm text-scratch-muted">{r.reason}</span>
            <span className="mt-3 block text-sm font-semibold text-scratch-text">
              {r.with}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
