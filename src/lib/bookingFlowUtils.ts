export type WebhookDoctor = { id: string; name: string; specialization: string }

const START = "__start_booking__"
const STATUS = "__status__"
export const QUICK_START = START
export const QUICK_STATUS = STATUS
export const INTENT_FOLLOW = "__intent_follow__"
export const INTENT_NEW = "__intent_new__"

export function isQuickToken(s: string) {
  return (
    s === START ||
    s === STATUS ||
    s === INTENT_FOLLOW ||
    s === INTENT_NEW ||
    s.startsWith("__doc__")
  )
}

export function parseDoctorPick(s: string): string | null {
  if (!s.startsWith("__doc__")) return null
  return s.slice("__doc__".length) || null
}

/** Keep last 10 digits for Indian numbers */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "")
  if (digits.length >= 10) return digits.slice(-10)
  return null
}

export function todayISODate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function parseUserDate(input: string): string | null {
  const t = input.trim()
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(t)) {
    const [y, mo, da] = t.split("-").map(Number)
    const d = new Date(y, mo - 1, da)
    if (!Number.isNaN(d.getTime())) {
      return `${y}-${String(mo).padStart(2, "0")}-${String(da).padStart(2, "0")}`
    }
  }
  const m2 = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/.exec(t)
  if (m2) {
    const da = Number(m2[1])
    const mo = Number(m2[2])
    const y = Number(m2[3])
    const d = new Date(y, mo - 1, da)
    if (!Number.isNaN(d.getTime())) {
      return `${y}-${String(mo).padStart(2, "0")}-${String(da).padStart(2, "0")}`
    }
  }
  if (/^tomorrow$/i.test(t)) {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }
  if (/^today$/i.test(t)) return todayISODate()
  return null
}

/** Lightweight triage when backend LLM is not wired — picks a sensible default doctor. */
export function suggestDoctor(symptoms: string, doctors: WebhookDoctor[]): WebhookDoctor | null {
  if (!doctors.length) return null
  const s = symptoms.toLowerCase()
  const child =
    /\b(baby|babies|infant|toddler|child|children|kid|kids|pediatric|paediatric|vaccin)\b/i.test(
      s
    ) || /बच्च|शिशु|बच्चे/.test(s)
  if (child) {
    const hit = doctors.find((d) => /child|pediatric|paed/i.test(d.specialization))
    if (hit) return hit
  }
  const gp = doctors.find((d) => /general|physician|gp|family/i.test(d.specialization))
  return gp ?? doctors[0]
}

export function formatSlotDisplay(raw: string): string {
  const x = raw.trim()
  if (/^\d{4}$/.test(x)) return `${x.slice(0, 2)}:${x.slice(2)}`
  return x
}

export type PatientBookingCard = {
  id: string
  date: string
  token: string
  status: string
  time: string
  doctor: { name: string; specialization: string } | null
  symptoms: string
}

/** Normalizes webhook `appointments[]` (API cards or legacy lean rows). */
export function normalizePatientBookingCards(raw: unknown): PatientBookingCard[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item: Record<string, unknown>) => {
    const doctorRaw = item.doctor
    const doctor =
      doctorRaw && typeof doctorRaw === "object" && !Array.isArray(doctorRaw)
        ? {
            name: String((doctorRaw as { name?: string }).name ?? "Doctor"),
            specialization: String(
              (doctorRaw as { specialization?: string }).specialization ?? "General"
            ),
          }
        : null

    let time = typeof item.time === "string" ? item.time : ""
    if (!time && item.slotStart != null && item.slotEnd != null) {
      time = `${formatSlotDisplay(String(item.slotStart))} – ${formatSlotDisplay(String(item.slotEnd))}`
    }

    return {
      id: String(item.id ?? item._id ?? ""),
      date: String(item.date ?? ""),
      token: String(item.token ?? item.tokenNumber ?? ""),
      status: String(item.status ?? "booked"),
      time,
      doctor,
      symptoms: typeof item.symptoms === "string" ? item.symptoms : "",
    }
  })
}

export function bookingBannerFromApi(data: {
  patient?: { name?: string; phone?: string }
  total?: number
  appointments?: unknown[]
}): string | undefined {
  const n = data.patient?.name
  const p = data.patient?.phone
  const total =
    typeof data.total === "number"
      ? data.total
      : Array.isArray(data.appointments)
        ? data.appointments.length
        : 0
  if (!n && !p) return undefined
  const head = [n, p].filter(Boolean).join(" · ")
  return `${head} · ${total} booking${total === 1 ? "" : "s"}`
}

type LeanDoc = { _id?: unknown; name?: string }
type ApptRow = {
  date?: string
  tokenNumber?: string
  slotStart?: string
  slotEnd?: string
  symptoms?: string
  status?: string
  doctor?: LeanDoc | string
}

export function formatAppointmentListForChat(appointments: ApptRow[]): string {
  if (!appointments.length) return "No appointments on file for this mobile number."
  const lines = appointments.slice(0, 8).map((a, i) => {
    const doc =
      a.doctor && typeof a.doctor === "object"
        ? String((a.doctor as LeanDoc).name ?? "Doctor")
        : "Doctor"
    const slot =
      a.slotStart && a.slotEnd
        ? `${formatSlotDisplay(String(a.slotStart))}–${formatSlotDisplay(String(a.slotEnd))}`
        : ""
    const sym = a.symptoms?.trim() ? ` · ${a.symptoms.trim()}` : ""
    const st = a.status ? ` (${a.status})` : ""
    return `${i + 1}. ${a.date ?? "?"}${slot ? ` · ${slot}` : ""} · Token ${a.tokenNumber ?? "?"} · ${doc}${sym}${st}`
  })
  return `Here are your recent bookings:\n\n${lines.join("\n")}\n\nNeed a new visit? Tap **Book a visit** or say “book”.`
}

export function intentLooksLikeStatus(text: string): boolean {
  return /\b(status|appointments?|booking|token|slot|when is my|मेरा अपॉइंटमेंट)\b/i.test(
    text
  )
}

export function intentLooksLikeFollowUp(text: string): boolean {
  return /\b(follow[\s-]?up|same doctor|my doctor|दोबारा|फॉलो)\b/i.test(text)
}

export function intentLooksLikeNew(text: string): boolean {
  return /\b(new (visit|consult)|different doctor|दूसरा डॉक्टर|नई बुकिंग)\b/i.test(text)
}
