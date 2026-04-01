import { mockBills } from "../../data/patientPortalMock"

export default function BillsPage() {
  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold sm:text-4xl">Bills &amp; payments</h1>
        <p className="text-scratch-muted">
          Demo amounts in Indian rupees. Connect <code className="rounded bg-scratch-surface-2 px-1.5 py-0.5 text-sm">GET /patient/bills</code>{" "}
          when your backend is live.
        </p>
      </header>
      <ul className="flex flex-col gap-3">
        {mockBills.map((r) => (
          <li
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl border border-scratch-border bg-scratch-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <strong className="block text-scratch-text">{r.description}</strong>
              <span className="mt-1 block text-sm text-scratch-muted">{r.date}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <span className="text-lg font-bold text-scratch-text">{r.amount}</span>
              <span
                className={
                  r.status === "Paid"
                    ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800"
                    : "rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800"
                }
              >
                {r.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
