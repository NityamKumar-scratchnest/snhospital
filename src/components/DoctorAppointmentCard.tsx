import type {
  ConsultStatus,
  DoctorAppointmentRow,
  PaymentStatus,
} from "../hooks/useDoctorAppointments"
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
  onConsultSelect: (next: ConsultStatus) => void
  onDelete: () => void
}

/** Consultation drives the card wash; payment drives the left accent bar. */
function cardStateClasses(payment: PaymentStatus, consult: ConsultStatus): string {
  const payBorder = payment === "pending" ? "border-l-amber-400" : "border-l-emerald-500"

  let body = "from-white via-white to-white"
  if (consult === "queue") {
    body =
      payment === "pending"
        ? "from-amber-50/90 via-teal-50/25 to-white"
        : "from-teal-50/70 via-cyan-50/20 to-white"
  } else if (consult === "visit") {
    body =
      payment === "pending"
        ? "from-amber-50/85 via-sky-100/45 to-sky-50/35"
        : "from-sky-50/80 via-sky-100/35 to-blue-50/25"
  } else {
    body =
      payment === "pending"
        ? "from-amber-50/80 via-emerald-50/40 to-emerald-50/25"
        : "from-emerald-50/75 via-teal-50/35 to-green-50/20"
  }

  return `border-l-[5px] ${payBorder} bg-linear-to-b ${body}`
}

function footerTint(payment: PaymentStatus, consult: ConsultStatus): string {
  if (consult === "visit") return "bg-sky-50/60"
  if (consult === "done") return "bg-emerald-50/50"
  if (payment === "pending") return "bg-amber-50/35"
  return "bg-teal-50/40"
}

function SegmentedRow<T extends string>({
  label,
  options,
  value,
  onChange,
  variant,
  disabled,
}: {
  label: string
  options: { id: T; short: string; full: string }[]
  value: T
  onChange: (id: T) => void
  variant: "payment" | "consult"
  disabled?: boolean
}) {
  const baseBtn =
    "relative flex-1 rounded-lg px-1.5 py-2 text-center text-[0.65rem] font-bold uppercase tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-scratch-accent disabled:cursor-not-allowed disabled:opacity-45 sm:px-2 sm:text-[0.68rem]"

  const inactive =
    "text-scratch-text/[0.82] hover:bg-white/95 hover:text-scratch-text"

  const paymentActive =
    "z-[1] bg-teal-100 text-scratch-text shadow-sm ring-2 ring-scratch-accent"
  const consultActive =
    "z-[1] bg-teal-100 text-scratch-text shadow-sm ring-2 ring-teal-700"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-scratch-text/[0.78]">
          {label}
        </span>
        <span
          className={`max-w-[58%] truncate rounded-md px-2 py-0.5 text-left text-[0.6rem] font-bold leading-tight ring-1 ring-inset sm:max-w-[55%] sm:text-[0.62rem] ${
            variant === "payment"
              ? value === "paid"
                ? "bg-emerald-100 text-scratch-text ring-emerald-700/30"
                : "bg-amber-100 text-scratch-text ring-amber-700/30"
              : value === "done"
                ? "bg-emerald-100 text-scratch-text ring-emerald-700/30"
                : value === "visit"
                  ? "bg-sky-100 text-scratch-text ring-sky-700/30"
                  : "bg-teal-100 text-scratch-text ring-teal-700/30"
          }`}
        >
          {options.find((o) => o.id === value)?.full ?? value}
        </span>
      </div>
      <div
        className="flex gap-0.5 rounded-xl bg-scratch-text/[0.06] p-1 ring-1 ring-scratch-border"
        role="group"
        aria-label={label}
      >
        {options.map((opt) => {
          const active = value === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              data-cursor="pointer"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange(opt.id)}
              className={`${baseBtn} ${
                active
                  ? variant === "payment"
                    ? paymentActive
                    : consultActive
                  : inactive
              }`}
            >
              {opt.short}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const PAYMENT_OPTIONS: { id: PaymentStatus; short: string; full: string }[] = [
  { id: "pending", short: "Pending", full: "Payment pending" },
  { id: "paid", short: "Paid", full: "Payment done" },
]

const CONSULT_OPTIONS: { id: ConsultStatus; short: string; full: string }[] = [
  { id: "queue", short: "Queue", full: "Consult · in queue" },
  { id: "visit", short: "Visit", full: "Consult · in visit" },
  { id: "done", short: "Done", full: "Consult · complete" },
]

export default function DoctorAppointmentCard({
  appointment: a,
  disabled,
  onPaymentSelect,
  onConsultSelect,
  onDelete,
}: Props) {
  const name = a.patient?.name?.trim() || "Patient"
  const phone = a.patient?.phone?.trim()
  const tel = phone ? telHref(phone) : undefined
  const symptoms = a.symptoms?.trim()
  const address = a.patient?.address?.trim()

  const paid = a.paymentStatus === "paid"

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-scratch-border/90 shadow-[0_12px_40px_-12px_rgba(15,40,35,0.14)] ring-1 ring-black/5 transition duration-300 hover:shadow-[0_18px_44px_-14px_rgba(15,40,35,0.18)] hover:ring-scratch-accent/15 ${cardStateClasses(a.paymentStatus, a.consultStatus)}`}
    >
      <div className="relative px-4 pb-3 pt-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-scratch-accent/25 to-transparent" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-lg font-semibold tracking-tight text-scratch-text">
                {name}
              </h2>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ${statusBadgeClass(a.status)}`}
              >
                {a.status ?? "booked"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              {phone ? (
                <a
                  href={tel}
                  className="font-semibold text-[#0a5c52] no-underline decoration-2 underline-offset-2 transition hover:underline"
                  data-cursor="pointer"
                >
                  <span className="sr-only">Call </span>
                  {phone}
                </a>
              ) : (
                <span className="font-medium text-scratch-text/[0.5]">No phone</span>
              )}
              <span className="text-scratch-text/[0.35]" aria-hidden>
                ·
              </span>
              <span className="tabular-nums font-semibold text-scratch-text">
                {formatAppointmentSlot(a.slotStart)}–{formatAppointmentSlot(a.slotEnd)}
              </span>
              <span className="text-scratch-text/[0.35]" aria-hidden>
                ·
              </span>
              <span className="tabular-nums font-medium text-scratch-text/[0.82]">
                {formatAppointmentDateLabel(a.date)}
              </span>
            </div>
          </div>
          <div
            className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-linear-to-br shadow-inner ring-1 ${
              paid
                ? "from-emerald-100 to-teal-100 ring-emerald-700/25"
                : "from-amber-100 to-orange-50 ring-amber-600/25"
            }`}
            aria-hidden
          >
            <span className="text-[0.55rem] font-bold uppercase tracking-wider text-scratch-text/[0.45]">
              #
            </span>
            <span className="font-display text-xl font-bold leading-none text-scratch-text">
              {a.tokenNumber}
            </span>
          </div>
        </div>

        {address ? (
          <p className="mt-2 line-clamp-1 text-[0.7rem] font-medium leading-snug text-scratch-text/[0.72]">
            {address}
          </p>
        ) : null}
        {symptoms ? (
          <p className="mt-1.5 line-clamp-2 rounded-lg border border-scratch-border/80 bg-white/70 px-2.5 py-1.5 text-[0.7rem] leading-snug text-scratch-text shadow-sm backdrop-blur-[2px]">
            <span className="font-semibold text-scratch-text/[0.65]">Complaint · </span>
            {symptoms}
          </p>
        ) : null}
      </div>

      <div
        className={`mt-auto flex flex-col gap-4 border-t border-scratch-border/70 px-4 py-4 ${footerTint(a.paymentStatus, a.consultStatus)}`}
      >
        <SegmentedRow
          variant="payment"
          label="Fees"
          options={PAYMENT_OPTIONS}
          value={a.paymentStatus}
          disabled={disabled}
          onChange={onPaymentSelect}
        />
        <SegmentedRow
          variant="consult"
          label="Consult"
          options={CONSULT_OPTIONS}
          value={a.consultStatus}
          disabled={disabled}
          onChange={onConsultSelect}
        />
        <button
          type="button"
          disabled={disabled}
          className="w-full rounded-xl border border-red-200 bg-red-50/80 py-2 text-xs font-bold uppercase tracking-wide text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45"
          data-cursor="pointer"
          onClick={onDelete}
        >
          Delete appointment
        </button>
      </div>
    </article>
  )
}
