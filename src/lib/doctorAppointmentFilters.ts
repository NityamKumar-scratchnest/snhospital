import type { DoctorAppointmentRow } from "../hooks/useDoctorAppointments"

export type BookingStatusFilter = "all" | "booked" | "completed" | "cancelled"

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

export function normalizeBookingStatus(a: DoctorAppointmentRow): string {
  return (a.status ?? "booked").toLowerCase().trim()
}

function matchesBooking(a: DoctorAppointmentRow, booking: BookingStatusFilter): boolean {
  if (booking === "all") return true
  return normalizeBookingStatus(a) === booking
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
    state.booking === "all" &&
    state.payment === "all" &&
    state.consult === "all" &&
    !state.followUpOnly
  )
}
