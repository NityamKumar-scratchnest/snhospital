import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState, type ReactNode, type SVGProps } from "react"
import ChatBookingCardList from "./ChatBookingCardList"
import { useBookingChat } from "../hooks/useBookingChat"
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_TEL } from "../lib/clinic"

function PhoneGlyph({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function MessageBody({ text }: { text: string }) {
  const parts: ReactNode[] = []
  const re = /\*\*(.+?)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(text.slice(last, m.index))
    }
    parts.push(
      <strong key={k++} className="font-semibold text-scratch-text">
        {m[1]}
      </strong>
    )
    last = m.index + m[0].length
  }
  if (last < text.length) {
    parts.push(text.slice(last))
  }
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.length ? parts : text}
    </span>
  )
}

type Props = {
  open: boolean
  onClose: () => void
}

export default function ChatPanel({ open, onClose }: Props) {
  const { messages, busy, submit, reset } = useBookingChat()
  const [draft, setDraft] = useState("")

  const quickReplies = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]
      if (m.from === "ai" && m.quickReplies?.length) return m.quickReplies
    }
    return []
  }, [messages])

  useEffect(() => {
    if (!open) return
    const prevHtmlOverflow = document.documentElement.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow
      document.body.style.overflow = prevBodyOverflow
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[200] cursor-pointer border-0 bg-scratch-text/40 backdrop-blur-[2px]"
            aria-label="Close chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed bottom-0 right-0 top-0 z-[210] flex w-full max-w-[440px] flex-col border-l border-scratch-border/80 bg-scratch-surface shadow-[-24px_0_80px_rgba(18,34,30,0.12)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
            initial={{ x: "100%", opacity: 0.85 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.85 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="relative overflow-hidden border-b border-scratch-border bg-gradient-to-br from-scratch-accent/12 via-scratch-surface to-teal-50/80 px-5 pb-5 pt-6">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-scratch-accent/20 blur-3xl"
                aria-hidden
              />
              <header className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-scratch-accent">
                    Scratchnest · Book in chat
                  </p>
                  <h2 id="chat-title" className="m-0 font-display text-xl font-semibold tracking-tight">
                    Care assistant
                  </h2>
                  <p className="mt-1.5 max-w-[280px] text-sm leading-snug text-scratch-muted">
                    Book visits, see your slots, or ask about the clinic — powered by your number on
                    file.
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="flex h-11 items-center justify-center rounded-2xl border border-scratch-border/60 bg-scratch-surface/90 px-3 text-xs font-bold text-scratch-muted shadow-sm backdrop-blur-sm transition hover:bg-scratch-surface-2 hover:text-scratch-text"
                    data-cursor="pointer"
                    onClick={() => reset()}
                    aria-label="Start over"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-scratch-border/60 bg-scratch-surface/90 text-lg leading-none text-scratch-text shadow-sm backdrop-blur-sm transition hover:bg-scratch-surface-2"
                    data-cursor="pointer"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </header>
              <a
                href={CLINIC_PHONE_TEL}
                className="relative mt-4 flex items-center gap-3 rounded-2xl border border-scratch-border/70 bg-scratch-surface/90 px-4 py-3 text-sm font-semibold text-scratch-text shadow-sm no-underline backdrop-blur-sm transition hover:border-scratch-accent/40 hover:shadow-md"
                data-cursor="pointer"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-scratch-accent text-white">
                  <PhoneGlyph className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-scratch-muted">
                    Prefer calling?
                  </span>
                  {CLINIC_PHONE_DISPLAY}
                </span>
              </a>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden p-4 [scrollbar-width:thin]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.from === "ai"
                        ? "max-w-[94%] rounded-2xl border border-scratch-border/80 bg-scratch-surface-2/90 px-4 py-3.5 text-[0.9375rem] leading-relaxed text-scratch-text shadow-sm"
                        : "ml-auto max-w-[94%] rounded-2xl bg-gradient-to-br from-scratch-accent to-teal-700 px-4 py-3.5 text-[0.9375rem] leading-relaxed text-white shadow-md"
                    }
                  >
                    {m.from === "ai" ? (
                      <>
                        <MessageBody text={m.text} />
                        {m.appointmentCards && m.appointmentCards.length > 0 ? (
                          <ChatBookingCardList
                            items={m.appointmentCards}
                            banner={m.bookingBanner}
                          />
                        ) : null}
                      </>
                    ) : (
                      <span className="whitespace-pre-wrap break-words">{m.text}</span>
                    )}
                  </div>
                ))}
                {busy ? (
                  <div
                    className="flex items-center gap-2 self-start rounded-2xl border border-scratch-border/60 bg-scratch-bg/80 px-4 py-3 text-sm text-scratch-muted"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="inline-flex gap-1" aria-hidden>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-scratch-accent [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-scratch-accent [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-scratch-accent" />
                    </span>
                    Working…
                  </div>
                ) : null}
              </div>

              {quickReplies.length > 0 && !busy ? (
                <div className="shrink-0 border-t border-scratch-border/60 bg-scratch-bg/40 px-3 py-2">
                  <p className="mb-1.5 text-center text-[0.62rem] font-bold uppercase tracking-wider text-scratch-muted">
                    Quick replies
                  </p>
                  <div className="flex max-h-28 flex-wrap justify-center gap-2 overflow-y-auto">
                    {quickReplies.map((q) => (
                      <button
                        key={q.value}
                        type="button"
                        data-cursor="pointer"
                        className="rounded-full border border-scratch-border bg-scratch-surface px-3 py-1.5 text-left text-xs font-semibold text-scratch-text shadow-sm transition hover:border-scratch-accent/40 hover:bg-scratch-surface-2"
                        onClick={() => void submit(q.value)}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <form
              className="border-t border-scratch-border bg-scratch-surface/95 p-4 backdrop-blur-md"
              onSubmit={(e) => {
                e.preventDefault()
                const t = draft.trim()
                if (!t || busy) return
                void submit(t)
                setDraft("")
              }}
            >
              <p className="mb-2 text-center text-[0.7rem] font-medium uppercase tracking-wider text-scratch-muted">
                Type a message or use quick replies
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Mobile number, symptoms, date…"
                  aria-label="Message"
                  disabled={busy}
                  className="min-w-0 flex-1 rounded-xl border border-scratch-border bg-scratch-bg/50 px-4 py-3 text-[0.9375rem] font-sans text-scratch-text outline-none ring-scratch-accent/25 transition placeholder:text-scratch-muted/70 focus:border-scratch-accent/40 focus:ring-2 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={busy || !draft.trim()}
                  className="shrink-0 rounded-xl border border-transparent bg-gradient-to-br from-scratch-accent to-teal-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition hover:brightness-105 disabled:opacity-50"
                  data-cursor="pointer"
                >
                  Send
                </button>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
