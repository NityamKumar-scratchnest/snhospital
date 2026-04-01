import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_TEL } from "../../lib/clinic"
import { mockVisits } from "../../data/patientPortalMock"

const STORAGE_KEY = "scratchnest_revisit_note"

export default function RevisitPage() {
  const [note, setNote] = useState("")
  const [saved, setSaved] = useState(false)
  const lastVisit = mockVisits[0]

  function submitLocal(e: React.FormEvent) {
    e.preventDefault()
    const text = note.trim() || "Follow-up requested from portal."
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ at: new Date().toISOString(), text })
    )
    setSaved(true)
    setNote("")
  }

  return (
    <div className="max-w-2xl">
      <header className="mb-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-scratch-accent">
          Follow-up care
        </p>
        <h1 className="mb-2 text-3xl font-semibold sm:text-4xl">Schedule a revisit</h1>
        <p className="text-scratch-muted">
          No backend yet — this page collects your intent on this device and shows
          the fastest ways to reach us. For urgent symptoms, call immediately.
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <motion.a
          href={CLINIC_PHONE_TEL}
          className="flex flex-col justify-between rounded-2xl border-2 border-scratch-accent bg-gradient-to-br from-scratch-accent to-teal-800 p-6 text-white shadow-lg no-underline"
          whileHover={{ y: -2 }}
          data-cursor="pointer"
        >
          <span className="text-sm font-semibold text-white/85">Call the clinic</span>
          <span className="mt-4 font-display text-2xl font-bold tracking-tight">
            {CLINIC_PHONE_DISPLAY}
          </span>
          <span className="mt-2 text-xs text-white/75">Fastest for same-week slots</span>
        </motion.a>
        <motion.div
          className="rounded-2xl border border-scratch-border bg-scratch-surface p-6 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <span className="text-sm font-semibold text-scratch-muted">Book with AI</span>
          <p className="mt-2 text-sm leading-relaxed text-scratch-text/90">
            Use the assistant on our website for timings, directions, and non-urgent
            booking requests.
          </p>
          <Link
            to={{ pathname: "/", hash: "contact" }}
            className="mt-4 inline-block text-sm font-bold text-scratch-accent no-underline hover:underline"
            data-cursor="pointer"
          >
            Go to home &amp; open chat →
          </Link>
        </motion.div>
      </div>

      {lastVisit?.revisitBy && (
        <div className="mb-8 rounded-2xl border border-dashed border-scratch-accent/40 bg-scratch-accent/5 px-5 py-4">
          <p className="text-sm font-semibold text-scratch-text">From your last visit</p>
          <p className="mt-1 text-sm text-scratch-muted">
            Dr. suggested: <span className="font-medium text-scratch-accent">{lastVisit.revisitBy}</span>
          </p>
          <Link
            to={`/portal/visits/${lastVisit.id}`}
            className="mt-2 inline-block text-sm font-bold text-scratch-accent no-underline hover:underline"
            data-cursor="pointer"
          >
            Read that visit note →
          </Link>
        </div>
      )}

      <section className="rounded-2xl border border-scratch-border bg-scratch-surface p-6 shadow-sm">
        <h2 className="mb-1 font-display text-lg font-semibold">Add a revisit request</h2>
        <p className="mb-4 text-sm text-scratch-muted">
          Tell us briefly why you’d like to return (optional). We store it only in
          this browser until your API is live.
        </p>
        <form onSubmit={submitLocal} className="space-y-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Need BP review before travel next week…"
            className="w-full resize-y rounded-xl border border-scratch-border bg-scratch-bg/40 px-4 py-3 text-sm text-scratch-text outline-none ring-scratch-accent/25 focus:ring-2"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-br from-scratch-accent to-teal-600 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-105 sm:w-auto sm:px-8"
            data-cursor="pointer"
          >
            Save request on this device
          </button>
        </form>
        <AnimatePresence>
          {saved && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
            >
              Saved. When you call or chat, mention you left a note in the portal —
              our team will match it to your file.
            </motion.p>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}
