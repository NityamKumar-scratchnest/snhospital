/** `tel:` link for Indian 10-digit or other digit-only numbers. */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10) return `tel:+91${digits}`
  return `tel:+${digits}`
}

/** Format API slot like `1020` → `10:20`. */
export function formatAppointmentSlot(raw: string): string {
  const s = raw.trim()
  if (/^\d{4}$/.test(s)) {
    return `${s.slice(0, 2)}:${s.slice(2)}`
  }
  return s
}

/** Parse loose ISO dates e.g. `2026-04-4` from the API. */
function parseAppointmentDate(s: string): Date | null {
  const t = s.trim()
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (!y || !mo || !d) return null
  const date = new Date(y, mo - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Short label e.g. `Apr 5, 2026` */
export function formatAppointmentDateLabel(isoDate: string): string {
  const parsed = parseAppointmentDate(isoDate)
  if (!parsed) return isoDate
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function statusBadgeClass(status: string | undefined): string {
  const s = (status ?? "booked").toLowerCase()
  if (s === "completed")
    return "bg-emerald-200 text-scratch-text ring-1 ring-emerald-700/35"
  if (s === "cancelled")
    return "bg-zinc-200 text-scratch-text ring-1 ring-zinc-600/30"
  /* Light mint chip + dark body text — never white-on-mint on white backgrounds */
  return "bg-teal-200 text-scratch-text ring-1 ring-teal-700/35"
}
