import { useCallback, useEffect, useRef, useState } from "react"
import api from "../services/api"
import {
  type NewAppointmentSocketPayload,
  subscribeDoctorAppointmentEvents,
} from "../services/doctorSocket"

/** Safe patient fields from `GET /appointments/doctor/:doctorId` (populated `patient`). */
export type DoctorAppointmentPatient = {
  id: string
  name?: string
  phone?: string
  address?: string
}

export type PaymentStatus = "pending" | "paid"

/** Matches Mongo `consultStatus`. */
export type ConsultStatus = "queue" | "visit" | "done"

export type DoctorAppointmentRow = {
  id: string
  hospitalId?: string
  /** Doctor id when API returns a string; omitted if populated later. */
  doctorId?: string
  date: string
  tokenNumber: string
  slotStart: string
  slotEnd: string
  status?: string
  paymentStatus: PaymentStatus
  consultStatus: ConsultStatus
  symptoms?: string
  patient?: DoctorAppointmentPatient
}

function normalizePatient(raw: unknown): DoctorAppointmentPatient | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const p = raw as Record<string, unknown>
  const id = String(p._id ?? p.id ?? "")
  if (!id) return undefined
  return {
    id,
    name: typeof p.name === "string" ? p.name : undefined,
    phone: typeof p.phone === "string" ? p.phone : undefined,
    address: typeof p.address === "string" ? p.address : undefined,
  }
}

function normalizeDoctorRef(raw: unknown): string | undefined {
  if (typeof raw === "string" && raw) return raw
  if (raw && typeof raw === "object" && "_id" in (raw as object)) {
    const d = raw as Record<string, unknown>
    const id = d._id
    if (typeof id === "string") return id
  }
  return undefined
}

function compareAppointments(a: DoctorAppointmentRow, b: DoctorAppointmentRow): number {
  const dateCmp = a.date.localeCompare(b.date)
  if (dateCmp !== 0) return dateCmp
  const ta = Number.parseInt(a.tokenNumber, 10)
  const tb = Number.parseInt(b.tokenNumber, 10)
  if (!Number.isNaN(ta) && !Number.isNaN(tb)) return ta - tb
  return a.tokenNumber.localeCompare(b.tokenNumber)
}

function normalizePaymentStatus(raw: unknown): PaymentStatus {
  return raw === "paid" ? "paid" : "pending"
}

function normalizeConsultStatus(raw: unknown): ConsultStatus {
  if (raw === "visit" || raw === "done" || raw === "queue") return raw
  if (raw === "ongoing") return "visit"
  if (raw === "waiting") return "queue"
  return "queue"
}

function normalizeAppointment(raw: unknown): DoctorAppointmentRow | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const id = String(o._id ?? o.id ?? "")
  if (!id) return null
  const hospitalId = typeof o.hospitalId === "string" ? o.hospitalId : undefined
  return {
    id,
    hospitalId,
    doctorId: normalizeDoctorRef(o.doctor),
    date: String(o.date ?? ""),
    tokenNumber: String(o.tokenNumber ?? ""),
    slotStart: String(o.slotStart ?? ""),
    slotEnd: String(o.slotEnd ?? ""),
    status: typeof o.status === "string" ? o.status : undefined,
    paymentStatus: normalizePaymentStatus(o.paymentStatus),
    consultStatus: normalizeConsultStatus(o.consultStatus),
    symptoms: typeof o.symptoms === "string" ? o.symptoms : undefined,
    patient: normalizePatient(o.patient),
  }
}

export function todayLocalISODate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function useDoctorAppointments(
  doctorId: string | undefined,
  date: string | undefined,
  useDateFilter: boolean
) {
  const [appointments, setAppointments] = useState<DoctorAppointmentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [liveBooking, setLiveBooking] = useState<NewAppointmentSocketPayload | null>(null)

  const fetchAppointments = useCallback(async () => {
    if (!doctorId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<unknown[]>(`/appointments/doctor/${doctorId}`, {
        params: useDateFilter && date ? { date } : {},
      })
      const list = Array.isArray(data) ? data : []
      const rows = list
        .map(normalizeAppointment)
        .filter((r): r is DoctorAppointmentRow => r !== null)
        .sort(compareAppointments)
      setAppointments(rows)
    } catch (e) {
      setAppointments([])
      setError(e instanceof Error ? e.message : "Could not load appointments.")
    } finally {
      setLoading(false)
    }
  }, [doctorId, date, useDateFilter])

  useEffect(() => {
    void fetchAppointments()
  }, [fetchAppointments])

  const refetchRef = useRef(fetchAppointments)
  refetchRef.current = fetchAppointments

  useEffect(() => {
    if (!doctorId) return
    return subscribeDoctorAppointmentEvents(doctorId, {
      onRefetch: () => {
        void refetchRef.current()
      },
      onNewAppointment: (payload) => setLiveBooking(payload),
    })
  }, [doctorId])

  useEffect(() => {
    if (!liveBooking) return
    const t = window.setTimeout(() => setLiveBooking(null), 6500)
    return () => window.clearTimeout(t)
  }, [liveBooking])

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    liveBooking,
    dismissLiveBooking: () => setLiveBooking(null),
  }
}
