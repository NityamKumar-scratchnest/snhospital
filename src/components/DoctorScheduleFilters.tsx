import { useState } from "react"
import {
  type ConsultFilter,
  type DoctorAppointmentFilterState,
  getScheduleViewPreset,
  type PaymentFilter,
  type ScheduleViewPreset,
  schedulePresetToFilters,
} from "../lib/doctorAppointmentFilters"

type Props = {
  filters: DoctorAppointmentFilterState
  onChange: (next: DoctorAppointmentFilterState) => void
  onReset: () => void
  isDefault: boolean
  /** When true, no outer card (parent provides border/surface). */
  embedded?: boolean
}

const presetOrder: ScheduleViewPreset[] = [
  "incomplete",
  "active_day",
  "cancelled",
  "everything",
]

const presetLabel: Record<ScheduleViewPreset, string> = {
  incomplete: "Incomplete",
  active_day: "Active day",
  cancelled: "Cancelled",
  everything: "Everything",
}

const presetHint: Record<ScheduleViewPreset, string> = {
  incomplete: "Payment or consult still open (non-cancelled only)",
  active_day: "Every non-cancelled visit for this load",
  cancelled: "Cancelled visits only",
  everything: "All statuses including cancelled",
}

function ChipRow<T extends string>({
  value,
  options,
  onSelect,
  ariaLabel,
}: {
  value: T
  options: { id: T; short: string }[]
  onSelect: (id: T) => void
  ariaLabel: string
}) {
  return (
    <div
      className="flex flex-wrap gap-1"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const on = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(opt.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              on
                ? "bg-scratch-accent text-white"
                : "bg-scratch-bg text-scratch-muted ring-1 ring-scratch-border/90 hover:bg-scratch-surface-2 hover:text-scratch-text"
            }`}
          >
            {opt.short}
          </button>
        )
      })}
    </div>
  )
}

const paymentOptions: { id: PaymentFilter; short: string }[] = [
  { id: "all", short: "All" },
  { id: "pending", short: "Pending" },
  { id: "paid", short: "Paid" },
]

const consultOptions: { id: ConsultFilter; short: string }[] = [
  { id: "all", short: "All" },
  { id: "open", short: "In progress" },
  { id: "queue", short: "Queue" },
  { id: "visit", short: "Visit" },
  { id: "done", short: "Done" },
]

export default function DoctorScheduleFilters({
  filters,
  onChange,
  onReset,
  isDefault,
  embedded,
}: Props) {
  const preset = getScheduleViewPreset(filters)
  const showRefine = filters.payment !== "all" || filters.consult !== "all"
  const [refineOpen, setRefineOpen] = useState(showRefine)

  const shell = embedded
    ? "space-y-3"
    : "mb-5 space-y-3 rounded-xl border border-scratch-border bg-scratch-surface p-4 sm:p-5"

  return (
    <section className={shell} aria-label="Schedule filters">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-scratch-muted">
            View
          </h2>
          {preset === "custom" ? (
            <span className="text-[0.65rem] text-scratch-muted">· custom mix</span>
          ) : null}
        </div>
        {!isDefault ? (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 text-xs font-medium text-scratch-accent hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>

      <div className="-mx-1 overflow-x-auto pb-0.5">
        <div
          className="flex min-w-min border-b border-scratch-border px-1"
          role="tablist"
          aria-label="Schedule view"
        >
          {presetOrder.map((key) => {
            const selected = preset === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                title={presetHint[key]}
                onClick={() => onChange(schedulePresetToFilters(key))}
                className={`shrink-0 border-b-2 px-3 py-2.5 text-left text-xs font-semibold transition sm:px-4 sm:text-[0.8125rem] ${
                  selected
                    ? "-mb-px border-scratch-accent text-scratch-text"
                    : "-mb-px border-transparent text-scratch-muted hover:border-scratch-border hover:text-scratch-text"
                }`}
              >
                {presetLabel[key]}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setRefineOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 rounded-lg py-1.5 text-left text-xs font-medium text-scratch-muted transition hover:text-scratch-text sm:w-auto sm:justify-start"
          aria-expanded={refineOpen}
        >
          <span>
            Payment & consult
            {showRefine ? (
              <span className="ml-1.5 font-normal text-scratch-accent">· filtered</span>
            ) : null}
          </span>
          <span className="tabular-nums text-scratch-muted sm:ml-1" aria-hidden>
            {refineOpen ? "−" : "+"}
          </span>
        </button>

        {refineOpen ? (
          <div className="mt-3 space-y-3 border-t border-scratch-border/80 pt-3">
            <div className="space-y-1.5">
              <span className="text-[0.65rem] font-medium uppercase tracking-wide text-scratch-muted">
                Payment
              </span>
              <ChipRow
                ariaLabel="Payment"
                value={filters.payment}
                options={paymentOptions}
                onSelect={(payment) => onChange({ ...filters, payment })}
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[0.65rem] font-medium uppercase tracking-wide text-scratch-muted">
                Consult
              </span>
              <ChipRow
                ariaLabel="Consult"
                value={filters.consult}
                options={consultOptions}
                onSelect={(consult) => onChange({ ...filters, consult })}
              />
            </div>
            {showRefine ? (
              <button
                type="button"
                className="text-xs font-medium text-scratch-accent hover:underline"
                onClick={() =>
                  onChange({
                    ...filters,
                    payment: "all",
                    consult: "all",
                  })
                }
              >
                Clear payment & consult filters
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
