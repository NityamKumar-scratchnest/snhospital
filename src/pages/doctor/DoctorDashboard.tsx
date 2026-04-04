import { isAxiosError } from "axios"
import { useCallback, useMemo, useState } from "react"
import ConfirmModal from "../../components/ConfirmModal"
import DoctorAppointmentCard from "../../components/DoctorAppointmentCard"
import DoctorCreateAppointmentModal from "../../components/DoctorCreateAppointmentModal"
import DoctorScheduleFilters from "../../components/DoctorScheduleFilters"
import { useAuth } from "../../context/AuthContext"
import {
  formatAppointmentDateLabel,
  formatAppointmentSlot,
  telHref,
} from "../../lib/appointmentDisplay"
import api from "../../services/api"
import {
  DOCTOR_APPOINTMENT_DEFAULT_FILTERS,
  filterDoctorAppointments,
  isDefaultDoctorFilters,
  type DoctorAppointmentFilterState,
} from "../../lib/doctorAppointmentFilters"
import {
  type ConsultStatus,
  type PaymentStatus,
  todayLocalISODate,
  useDoctorAppointments,
} from "../../hooks/useDoctorAppointments"

const inputClass =
  "rounded-[10px] border border-scratch-border bg-scratch-surface px-3 py-2 font-sans text-sm text-scratch-text outline-none ring-scratch-accent/30 focus:ring-2"

function paymentLabel(s: PaymentStatus): string {
  return s === "paid" ? "Paid" : "Pending"
}

function apiErrMessage(e: unknown): string {
  if (isAxiosError(e)) {
    const d = e.response?.data
    if (d && typeof d === "object" && "message" in d) {
      const m = (d as { message?: unknown }).message
      if (typeof m === "string") return m
      if (Array.isArray(m)) return m.filter((x) => typeof x === "string").join(", ")
    }
    if (e.response?.status === 403) return "You are not allowed to change this appointment."
    if (e.response?.status === 404) return "Appointment was not found."
  }
  return e instanceof Error ? e.message : "Request failed."
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const doctor = user?.role === "doctor" ? user : null
  const defaultDate = useMemo(() => todayLocalISODate(), [])
  const [date, setDate] = useState(defaultDate)
  const [useDateFilter, setUseDateFilter] = useState(true)

  const {
    appointments,
    loading,
    error,
    refetch,
    liveBooking,
    dismissLiveBooking,
  } = useDoctorAppointments(doctor?.id, date, useDateFilter)

  const [mutatingId, setMutatingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [paymentConfirm, setPaymentConfirm] = useState<{
    id: string
    prev: PaymentStatus
    next: PaymentStatus
  } | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [filters, setFilters] = useState<DoctorAppointmentFilterState>(
    DOCTOR_APPOINTMENT_DEFAULT_FILTERS
  )

  const busy = mutatingId !== null

  const filteredAppointments = useMemo(
    () => filterDoctorAppointments(appointments, filters),
    [appointments, filters]
  )

  const totalLoaded = appointments.length
  const shownCount = filteredAppointments.length
  const filtersActive = !isDefaultDoctorFilters(filters)

  const handlePaymentSelect = useCallback(
    (appointmentId: string, current: PaymentStatus, next: PaymentStatus) => {
      if (next === current) return
      setActionError(null)
      setPaymentConfirm({ id: appointmentId, prev: current, next })
    },
    []
  )

  const confirmPaymentChange = useCallback(async () => {
    if (!paymentConfirm) return
    const { id, next } = paymentConfirm
    setMutatingId(id)
    setActionError(null)
    try {
      await api.patch(`/appointments/update/${id}`, { paymentStatus: next })
      await refetch()
      setPaymentConfirm(null)
    } catch (e) {
      setActionError(apiErrMessage(e))
    } finally {
      setMutatingId(null)
    }
  }, [paymentConfirm, refetch])

  const handleConsultSelect = useCallback(
    async (id: string, current: ConsultStatus, next: ConsultStatus) => {
      if (next === current) return
      setMutatingId(id)
      setActionError(null)
      try {
        await api.patch(`/appointments/update/${id}`, { consultStatus: next })
        await refetch()
      } catch (e) {
        setActionError(apiErrMessage(e))
      } finally {
        setMutatingId(null)
      }
    },
    [refetch]
  )

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirmId) return
    const id = deleteConfirmId
    setMutatingId(id)
    setActionError(null)
    try {
      await api.delete(`/appointments/delete/${id}`)
      await refetch()
      setDeleteConfirmId(null)
    } catch (e) {
      setActionError(apiErrMessage(e))
    } finally {
      setMutatingId(null)
    }
  }, [deleteConfirmId, refetch])

  if (!doctor) return null
  const livePhone = liveBooking?.phone?.trim()
  const liveTel = livePhone ? telHref(livePhone) : undefined

  const paymentBusy = paymentConfirm && mutatingId === paymentConfirm.id
  const deleteBusy = deleteConfirmId !== null && mutatingId === deleteConfirmId

  return (
    <div className="max-w-480 w-full pb-8 xl:pr-2">
      <ConfirmModal
        open={paymentConfirm !== null}
        title="Change payment status?"
        description={
          paymentConfirm
            ? `You are updating fees from ${paymentLabel(paymentConfirm.prev)} to ${paymentLabel(paymentConfirm.next)}. Continue?`
            : ""
        }
        confirmLabel={paymentBusy ? "Updating…" : "Yes, update"}
        confirmDisabled={!!paymentBusy}
        onCancel={() => {
          if (paymentBusy) return
          setPaymentConfirm(null)
        }}
        onConfirm={() => void confirmPaymentChange()}
      />
      <ConfirmModal
        open={deleteConfirmId !== null}
        variant="danger"
        title="Delete appointment?"
        description="This removes the appointment from the schedule. You cannot undo this action."
        confirmLabel={deleteBusy ? "Deleting…" : "Delete"}
        confirmDisabled={!!deleteBusy}
        onCancel={() => {
          if (deleteBusy) return
          setDeleteConfirmId(null)
        }}
        onConfirm={() => void confirmDelete()}
      />
      <DoctorCreateAppointmentModal
        open={createOpen}
        doctorId={doctor.id}
        onClose={() => setCreateOpen(false)}
        onCreated={() => void refetch()}
      />

      <header className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-scratch-text sm:text-3xl">
            Schedule
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-scratch-muted">
            Fees and consult sync with the server. Live bookings still arrive over the socket.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <button
            type="button"
            className="rounded-full bg-scratch-accent px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
            data-cursor="pointer"
            onClick={() => setCreateOpen(true)}
          >
            New appointment
          </button>
          <div className="flex gap-3 rounded-xl border border-scratch-border/80 bg-scratch-surface px-4 py-3 shadow-sm">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-scratch-muted">
                Showing
              </p>
              <p className="font-display text-2xl font-semibold leading-tight text-scratch-accent">
                {shownCount}
                {filtersActive || shownCount !== totalLoaded ? (
                  <span className="ml-1 text-base font-semibold text-scratch-muted">
                    / {totalLoaded}
                  </span>
                ) : null}
              </p>
              {filtersActive ? (
                <p className="text-[0.6rem] font-medium text-scratch-muted">Filters on</p>
              ) : null}
            </div>
            <div className="w-px bg-scratch-border" aria-hidden />
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-scratch-muted">
                Doctor
              </p>
              <p className="truncate text-sm font-semibold text-scratch-text">{doctor.name}</p>
            </div>
          </div>
        </div>
      </header>

      {liveBooking ? (
        <div
          className="mb-4 flex flex-col gap-2 rounded-xl border border-teal-500/35 bg-linear-to-r from-teal-500/10 to-scratch-surface px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-800 dark:text-teal-200">
              New booking
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-scratch-text">
              {liveBooking.patient ?? "Patient"}{" "}
              <span className="font-normal text-scratch-muted">
                · Token {liveBooking.token ?? "—"}
                {liveBooking.time
                  ? ` · ${formatAppointmentSlot(String(liveBooking.time))}`
                  : ""}
                {liveBooking.date
                  ? ` · ${formatAppointmentDateLabel(String(liveBooking.date))}`
                  : ""}
              </span>
            </p>
            {liveBooking.symptoms ? (
              <p className="mt-1 line-clamp-1 text-xs text-scratch-muted">
                {liveBooking.symptoms}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {livePhone ? (
              <a
                href={liveTel}
                className="inline-flex rounded-full bg-scratch-accent px-4 py-1.5 text-xs font-bold text-white no-underline transition hover:brightness-110"
                data-cursor="pointer"
              >
                Call {livePhone}
              </a>
            ) : null}
            <button
              type="button"
              className="rounded-full border border-scratch-border px-3 py-1.5 text-xs font-semibold text-scratch-text hover:bg-scratch-bg"
              data-cursor="pointer"
              onClick={() => dismissLiveBooking()}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <div className="mb-5 rounded-xl border border-scratch-border bg-scratch-surface p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-scratch-text">
            <input
              type="checkbox"
              checked={useDateFilter}
              onChange={(e) => setUseDateFilter(e.target.checked)}
              className="h-4 w-4 rounded border-scratch-border text-scratch-accent focus:ring-scratch-accent"
            />
            Single day
          </label>
          <label className="flex min-w-[160px] flex-1 flex-col gap-1 sm:max-w-[220px]">
            <span className="text-xs font-semibold text-scratch-muted">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={!useDateFilter}
              className={`${inputClass} disabled:opacity-45`}
            />
          </label>
        </div>
        <div className="my-4 h-px bg-scratch-border" aria-hidden />
        <DoctorScheduleFilters
          embedded
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(DOCTOR_APPOINTMENT_DEFAULT_FILTERS)}
          isDefault={!filtersActive}
        />
      </div>

      {loading && (
        <p className="text-sm text-scratch-muted" role="status">
          Syncing…
        </p>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {actionError && (
        <p className="mb-2 text-sm text-red-700" role="alert">
          {actionError}
        </p>
      )}

      {!loading &&
        !error &&
        appointments.length === 0 && (
          <p className="rounded-xl border border-dashed border-scratch-border bg-scratch-surface/50 px-4 py-8 text-center text-sm text-scratch-muted">
            No appointments for this view.
          </p>
        )}

      {!loading &&
        !error &&
        appointments.length > 0 &&
        filteredAppointments.length === 0 && (
          <p className="rounded-xl border border-dashed border-teal-300/70 bg-teal-50/40 px-4 py-8 text-center text-sm text-scratch-text dark:border-teal-800/50 dark:bg-teal-950/25">
            Nothing matches this view. Try{" "}
            <strong className="font-semibold">Active day</strong> or{" "}
            <strong className="font-semibold">Everything</strong>, or reset to the default queue.
          </p>
        )}

      <ul className="mt-4 grid list-none grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
        {filteredAppointments.map((a) => (
          <li key={a.id} className="min-w-0">
            <DoctorAppointmentCard
              appointment={a}
              disabled={busy}
              onPaymentSelect={(next) => handlePaymentSelect(a.id, a.paymentStatus, next)}
              onConsultSelect={(next) => void handleConsultSelect(a.id, a.consultStatus, next)}
              onDelete={() => setDeleteConfirmId(a.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
