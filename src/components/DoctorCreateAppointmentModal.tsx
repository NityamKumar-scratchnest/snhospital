import { useState } from "react"
import { webhookClient } from "../services/webhookClient"

const inputClass =
  "w-full rounded-[10px] border border-scratch-border bg-scratch-bg px-3 py-2 text-sm text-scratch-text outline-none ring-scratch-accent/25 focus:ring-2"

type Props = {
  open: boolean
  doctorId: string
  onClose: () => void
  onCreated: () => void
}

export default function DoctorCreateAppointmentModal({
  open,
  doctorId,
  onClose,
  onCreated,
}: Props) {
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [date, setDate] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (!open) return null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const p = phone.replace(/\D/g, "").slice(-10)
    if (p.length !== 10) {
      setError("Enter a valid 10-digit mobile number.")
      return
    }
    if (!name.trim() || !address.trim() || !date.trim()) {
      setError("Name, address, and date are required.")
      return
    }
    setPending(true)
    try {
      const { data } = await webhookClient.post("/webhook/create-appointment", {
        phone: p,
        name: name.trim(),
        address: address.trim(),
        doctorId,
        date: date.trim(),
        symptoms: symptoms.trim(),
      })
      if (data?.error) {
        setError(typeof data.error === "string" ? data.error : "Could not create appointment.")
        return
      }
      setPhone("")
      setName("")
      setAddress("")
      setDate("")
      setSymptoms("")
      onCreated()
      onClose()
    } catch {
      setError("Request failed. Check the API and try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[280] flex items-center justify-center bg-scratch-text/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-appt-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-scratch-border bg-scratch-surface p-6 shadow-xl">
        <h2 id="create-appt-title" className="font-display text-xl font-semibold text-scratch-text">
          New appointment
        </h2>
        <p className="mt-1 text-sm text-scratch-muted">
          Creates patient if needed and books this doctor via the clinic webhook.
        </p>
        <form className="mt-5 flex flex-col gap-3" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-scratch-muted">Phone</span>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile"
              inputMode="numeric"
              autoComplete="tel"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-scratch-muted">Name</span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Patient name"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-scratch-muted">Address</span>
            <input
              className={inputClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Area / city"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-scratch-muted">Date</span>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-scratch-muted">Symptoms (optional)</span>
            <textarea
              className={`${inputClass} min-h-[72px] resize-y`}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. fever"
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="rounded-full border border-scratch-border px-4 py-2 text-sm font-semibold text-scratch-text hover:bg-scratch-bg"
              data-cursor="pointer"
              disabled={pending}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-scratch-accent px-4 py-2 text-sm font-bold text-white hover:brightness-105 disabled:opacity-50"
              data-cursor="pointer"
            >
              {pending ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
