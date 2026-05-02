import type { DoctorAppointmentRow, PaymentStatus } from "../hooks/useDoctorAppointments"
import {
  formatAppointmentDateLabel,
  formatAppointmentSlot,
  statusBadgeClass,
  telHref,
} from "../lib/appointmentDisplay"

type Props = {
  appointment: DoctorAppointmentRow
  disabled?: boolean
  onPaymentSelect: (next: PaymentStatus) => void
  onMarkCompleted: () => void
  onDelete: () => void
}

/** Card body + left accent from visit status (booked / completed / cancelled). */
function cardBodyClass(a: DoctorAppointmentRow): string {
  const st = (a.status ?? "booked").toLowerCase()
  if (st === "cancelled") {
    return "border-l-[3px] border-l-zinc-400 bg-linear-to-br from-zinc-100/85 via-scratch-surface to-zinc-50/40"
  }
  if (st === "completed") {
    return "border-l-[3px] border-l-emerald-600 bg-linear-to-br from-emerald-50/95 via-teal-50/35 to-white"
  }
  /* booked — soft teal base; warmer wash if payment still pending */
  if (a.paymentStatus === "pending") {
    return "border-l-[3px] border-l-amber-400 bg-linear-to-br from-amber-50/55 via-teal-50/30 to-white"
  }
  return "border-l-[3px] border-l-teal-600 bg-linear-to-br from-teal-50/80 via-cyan-50/20 to-white"
}

function cardFooterClass(a: DoctorAppointmentRow): string {
  const st = (a.status ?? "booked").toLowerCase()
  if (st === "cancelled") {
    return "border-scratch-border bg-zinc-100/45"
  }
  if (st === "completed") {
    return "border-scratch-border bg-emerald-50/40"
  }
  if (a.paymentStatus === "pending") {
    return "border-scratch-border bg-amber-50/25"
  }
  return "border-scratch-border bg-teal-50/30"
}

const PAYMENT_OPTIONS: { id: PaymentStatus; short: string; full: string }[] = [
  { id: "pending", short: "Pending", full: "Payment pending" },
  { id: "paid", short: "Paid", full: "Payment done" },
]

export default function DoctorAppointmentCard({
  appointment: a,
  disabled,
  onPaymentSelect,
  onMarkCompleted,
  onDelete,
}: Props) {
  const name = a.patient?.name?.trim() || "Patient"
  const phone = a.patient?.phone?.trim()
  const tel = phone ? telHref(phone) : undefined
  const symptoms = a.symptoms?.trim()
  const address = a.patient?.address?.trim()
  const st = (a.status ?? "booked").toLowerCase()

  const canComplete =
    st !== "cancelled" && !(st === "completed" && a.consultStatus === "done")

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-xl border border-scratch-border shadow-sm transition hover:shadow-md ${cardBodyClass(a)}`}
    >
      <div className="px-3 pb-2.5 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="truncate font-display text-base font-semibold tracking-tight text-scratch-text">
                {name}
              </h2>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide ${statusBadgeClass(a.status)}`}
              >
                {a.status ?? "booked"}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.75rem] leading-tight">
              {phone ? (
                <a
                  href={tel}
                  className="font-semibold text-scratch-accent no-underline hover:underline"
                >
                  <span className="sr-only">Call </span>
                  {phone}
                </a>
              ) : (
                <span className="font-medium text-scratch-muted">No phone</span>
              )}
              <span className="text-scratch-muted" aria-hidden>
                ·
              </span>
              <span className="tabular-nums font-semibold text-scratch-text">
                {formatAppointmentSlot(a.slotStart)}–{formatAppointmentSlot(a.slotEnd)}
              </span>
              <span className="text-scratch-muted" aria-hidden>
                ·
              </span>
              <span className="tabular-nums text-scratch-text">
                {formatAppointmentDateLabel(a.date)}
              </span>
            </div>
          </div>
          <div
            className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-scratch-bg ring-1 ring-scratch-border/80"
            aria-hidden
          >
            <span className="text-[0.5rem] font-bold uppercase tracking-wider text-scratch-muted">
              #
            </span>
            <span className="font-display text-lg font-bold leading-none text-scratch-text">
              {a.tokenNumber}
            </span>
          </div>
        </div>

        {address ? (
          <p className="mt-1.5 line-clamp-1 text-[0.7rem] text-scratch-muted">{address}</p>
        ) : null}
        {symptoms ? (
          <p className="mt-1 line-clamp-2 text-[0.7rem] leading-snug text-scratch-text">
            <span className="font-medium text-scratch-muted">Complaint · </span>
            {symptoms}
          </p>
        ) : null}
      </div>

      <div className={`mt-auto border-t px-3 py-2.5 ${cardFooterClass(a)}`}>
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="text-[0.6rem] font-bold uppercase tracking-wider text-scratch-muted">
            Fees
          </span>
          <span
            className={`max-w-[55%] truncate rounded-md px-1.5 py-0.5 text-[0.58rem] font-bold ring-1 ring-inset ${
              a.paymentStatus === "paid"
                ? "bg-emerald-50 text-scratch-text ring-emerald-700/20"
                : "bg-amber-50 text-scratch-text ring-amber-700/20"
            }`}
          >
            {PAYMENT_OPTIONS.find((o) => o.id === a.paymentStatus)?.full ?? a.paymentStatus}
          </span>
        </div>
        <div
          className="mb-3 flex gap-0.5 rounded-lg bg-scratch-surface p-0.5 ring-1 ring-scratch-border"
          role="group"
          aria-label="Payment"
        >
          {PAYMENT_OPTIONS.map((opt) => {
            const active = a.paymentStatus === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => onPaymentSelect(opt.id)}
                className={`flex-1 rounded-md py-1.5 text-center text-[0.65rem] font-bold uppercase tracking-wide transition focus:outline-none focus-visible:ring-2 focus-visible:ring-scratch-accent disabled:cursor-not-allowed disabled:opacity-45 ${
                  active
                    ? "bg-teal-100 text-scratch-text ring-1 ring-scratch-accent"
                    : "text-scratch-muted hover:bg-scratch-bg hover:text-scratch-text"
                }`}
              >
                {opt.short}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={disabled || !canComplete}
            title={
              !canComplete
                ? st === "cancelled"
                  ? "Cancelled visits cannot be completed"
                  : "Visit already marked complete"
                : undefined
            }
            onClick={onMarkCompleted}
            className="rounded-lg border border-scratch-border bg-scratch-surface py-2 text-[0.65rem] font-bold uppercase tracking-wide text-scratch-text transition hover:border-scratch-accent/50 hover:bg-teal-50/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Completed
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="rounded-lg border border-red-200 bg-red-50/70 py-2 text-[0.65rem] font-bold uppercase tracking-wide text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
