import { statusBadgeClass } from "../lib/appointmentDisplay"
import type { PatientBookingCard } from "../lib/bookingFlowUtils"

type Props = {
  items: PatientBookingCard[]
  banner?: string
}

export default function ChatBookingCardList({ items, banner }: Props) {
  if (!items.length) return null

  return (
    <div className="mt-3 space-y-2.5">
      {banner ? (
        <p className="rounded-xl border border-scratch-border/80 bg-scratch-bg/60 px-3 py-2 text-center text-[0.72rem] font-semibold text-scratch-text/90">
          {banner}
        </p>
      ) : null}
      <div className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
        {items.map((a) => (
          <article
            key={a.id || `${a.date}-${a.token}`}
            className="rounded-xl border border-scratch-border/90 bg-white/90 px-3 py-2.5 shadow-sm ring-1 ring-black/4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-display text-base font-bold text-scratch-text">
                    {a.date}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide ${statusBadgeClass(a.status)}`}
                  >
                    {a.status}
                  </span>
                </div>
                <p className="mt-0.5 text-[0.72rem] font-semibold tabular-nums text-scratch-text/85">
                  {a.time}
                </p>
                <p className="mt-1 text-[0.78rem] font-semibold leading-snug text-scratch-text">
                  {a.doctor?.name ?? "Doctor TBD"}
                  {a.doctor?.specialization ? (
                    <span className="block text-[0.68rem] font-medium text-scratch-muted">
                      {a.doctor.specialization}
                    </span>
                  ) : null}
                </p>
                {a.symptoms.trim() ? (
                  <p className="mt-1.5 line-clamp-2 text-[0.68rem] leading-snug text-scratch-text/80">
                    <span className="font-semibold text-scratch-muted">Note · </span>
                    {a.symptoms.trim()}
                  </p>
                ) : null}
              </div>
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-teal-100 ring-1 ring-teal-700/25">
                <span className="text-[0.5rem] font-bold uppercase text-scratch-text/45">
                  #
                </span>
                <span className="font-display text-lg font-bold leading-none text-scratch-text">
                  {a.token}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
