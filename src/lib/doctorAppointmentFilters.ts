import type { DoctorAppointmentRow } from "../hooks/useDoctorAppointments"

/** `active` = booked or completed (anything except cancelled). */
export type BookingStatusFilter = "all" | "active" | "booked" | "completed" | "cancelled"

export type PaymentFilter = "all" | "pending" | "paid"

/** `open` = queue or visit (consult not finished). */
export type ConsultFilter = "all" | "open" | "queue" | "visit" | "done"

export type DoctorAppointmentFilterState = {
  booking: BookingStatusFilter
  payment: PaymentFilter
  consult: ConsultFilter
  /** Payment still pending or consult not marked done (queue/visit). */
  followUpOnly: boolean
}

/** Default schedule: hide cancelled, show only visits that still need payment or consult work. */
export const DOCTOR_APPOINTMENT_DEFAULT_FILTERS: DoctorAppointmentFilterState = {
  booking: "active",
  payment: "all",
  consult: "all",
  followUpOnly: true,
}

export function normalizeBookingStatus(a: DoctorAppointmentRow): string {
  return (a.status ?? "booked").toLowerCase().trim()
}

function matchesBooking(a: DoctorAppointmentRow, booking: BookingStatusFilter): boolean {
  if (booking === "all") return true
  const bs = normalizeBookingStatus(a)
  if (booking === "active") return bs !== "cancelled"
  return bs === booking
}

function matchesPayment(a: DoctorAppointmentRow, payment: PaymentFilter): boolean {
  if (payment === "all") return true
  return a.paymentStatus === payment
}

function matchesConsult(a: DoctorAppointmentRow, consult: ConsultFilter): boolean {
  if (consult === "all") return true
  if (consult === "open") return a.consultStatus === "queue" || a.consultStatus === "visit"
  return a.consultStatus === consult
}

/** True when fees are unpaid or consult is still in queue/visit. */
export function needsFollowUp(a: DoctorAppointmentRow): boolean {
  return a.paymentStatus === "pending" || a.consultStatus !== "done"
}

export function filterDoctorAppointments(
  rows: DoctorAppointmentRow[],
  state: DoctorAppointmentFilterState
): DoctorAppointmentRow[] {
  return rows.filter((a) => {
    if (!matchesBooking(a, state.booking)) return false
    if (!matchesPayment(a, state.payment)) return false
    if (!matchesConsult(a, state.consult)) return false
    if (state.followUpOnly && !needsFollowUp(a)) return false
    return true
  })
}

export function isDefaultDoctorFilters(state: DoctorAppointmentFilterState): boolean {
  return (
    state.booking === DOCTOR_APPOINTMENT_DEFAULT_FILTERS.booking &&
    state.payment === DOCTOR_APPOINTMENT_DEFAULT_FILTERS.payment &&
    state.consult === DOCTOR_APPOINTMENT_DEFAULT_FILTERS.consult &&
    state.followUpOnly === DOCTOR_APPOINTMENT_DEFAULT_FILTERS.followUpOnly
  )
}

export type ScheduleViewPreset = "incomplete" | "active_day" | "cancelled" | "everything"

export function getScheduleViewPreset(state: DoctorAppointmentFilterState): ScheduleViewPreset | "custom" {
  const { payment, consult } = state
  if (payment !== "all" || consult !== "all") return "custom"
  if (state.booking === "active" && state.followUpOnly) return "incomplete"
  if (state.booking === "active" && !state.followUpOnly) return "active_day"
  if (state.booking === "cancelled" && !state.followUpOnly) return "cancelled"
  if (state.booking === "all" && !state.followUpOnly) return "everything"
  return "custom"
}

export function schedulePresetToFilters(preset: ScheduleViewPreset): DoctorAppointmentFilterState {
  switch (preset) {
    case "incomplete":
      return {
        booking: "active",
        payment: "all",
        consult: "all",
        followUpOnly: true,
      }
    case "active_day":
      return {
        booking: "active",
        payment: "all",
        consult: "all",
        followUpOnly: false,
      }
    case "cancelled":
      return {
        booking: "cancelled",
        payment: "all",
        consult: "all",
        followUpOnly: false,
      }
    case "everything":
      return {
        booking: "all",
        payment: "all",
        consult: "all",
        followUpOnly: false,
      }
  }
}
