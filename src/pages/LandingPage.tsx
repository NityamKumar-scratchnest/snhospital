import { useEffect, useRef, useState, type SVGProps } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import ChatPanel from "../components/ChatPanel"
import ClinicGalleryCarousel from "../components/ClinicGalleryCarousel"
import TrustSignalsStrip from "../components/TrustSignalsStrip"
import { useAuth } from "../context/AuthContext"
import { CLINIC_GALLERY_SLIDES } from "../lib/clinicGallery"
import {
  CLINIC_ADDRESS_LINE,
  CLINIC_HOURS,
  CLINIC_PHONE_DISPLAY,
  CLINIC_PHONE_TEL,
} from "../lib/clinic"

gsap.registerPlugin(ScrollTrigger)

function PhoneIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
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

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-gradient-to-br from-scratch-accent to-teal-600 px-5 py-2.5 text-[0.95rem] font-semibold text-white shadow-lg shadow-teal-800/20 no-underline transition hover:brightness-105"
const btnPrimaryLg = `${btnPrimary} px-7 py-3.5 text-base`
const btnGhost =
  "inline-flex items-center justify-center rounded-full border border-transparent px-4 py-2 text-[0.95rem] font-semibold text-scratch-text no-underline transition hover:bg-scratch-accent/10"
const btnPhone =
  "inline-flex items-center justify-center gap-2 rounded-full border border-scratch-border bg-scratch-surface px-4 py-2 text-[0.95rem] font-bold tracking-tight text-scratch-text shadow-sm no-underline transition hover:border-scratch-accent/35 hover:shadow-md"

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        y: 48,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
      })

      gsap.utils.toArray<HTMLElement>(".scroll-rise").forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          y: 56,
          opacity: 0,
          duration: 0.75,
          ease: "power2.out",
        })
      })

      gsap.utils.toArray<HTMLElement>(".parallax-soft").forEach((el) => {
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
          y: -40,
          ease: "none",
        })
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} className="min-w-0 max-w-full">
      {/* Top strip — number always visible */}
      <div className="border-b border-scratch-border/80 bg-gradient-to-r from-scratch-surface via-scratch-surface-2/90 to-scratch-surface px-4 py-2.5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 sm:flex-row sm:gap-4">
          <p className="m-0 text-center text-[0.8rem] font-medium text-scratch-muted sm:text-left">
            <span className="font-semibold text-scratch-text">General Physician (GP) OPD</span>
            <span className="mx-2 hidden text-scratch-border sm:inline">|</span>
            <span className="block sm:inline">{CLINIC_HOURS}</span>
          </p>
          <a
            href={CLINIC_PHONE_TEL}
            className="inline-flex items-center gap-2 rounded-full bg-scratch-accent px-4 py-1.5 text-sm font-bold text-white shadow-md shadow-teal-900/15 no-underline transition hover:brightness-110"
            data-cursor="pointer"
          >
            <PhoneIcon className="h-4 w-4 shrink-0 text-white" aria-hidden />
            Call {CLINIC_PHONE_DISPLAY}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-scratch-border/90 bg-scratch-bg/85 px-4 py-3 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="font-display text-xl font-semibold text-scratch-text no-underline hover:text-scratch-accent"
            data-cursor="pointer"
          >
            Scratchnest
          </Link>
          <a
            href={CLINIC_PHONE_TEL}
            className="order-last flex w-full items-center justify-center rounded-2xl border border-scratch-accent/25 bg-scratch-surface px-4 py-2.5 font-display text-lg font-bold tracking-tight text-scratch-accent no-underline shadow-sm sm:order-none sm:w-auto sm:rounded-full sm:px-5 sm:py-2 sm:text-base"
            data-cursor="pointer"
          >
            {CLINIC_PHONE_DISPLAY}
          </a>
          <nav
            className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2"
            aria-label="Primary"
          >
            <button
              type="button"
              className={btnPrimary}
              data-cursor="pointer"
              onClick={() => setChatOpen(true)}
            >
              Book with AI
            </button>
            <a className={btnPhone} href={CLINIC_PHONE_TEL} data-cursor="pointer">
              Call clinic
            </a>
            <Link
              className={btnGhost}
              to={user ? "/portal" : "/login"}
              data-cursor="pointer"
            >
              {user ? "Portal" : "Log in"}
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-4 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-12">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div>
            <p className="hero-reveal mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-scratch-accent">
              NMC-registered · evidence-led GP care · India
            </p>
            <h1 className="hero-reveal mb-4 text-[2rem] leading-[1.12] sm:text-5xl lg:text-[3.15rem]">
              Thoughtful{" "}
              <span className="bg-gradient-to-r from-scratch-accent to-scratch-accent-2 bg-clip-text text-transparent">
                general physician
              </span>{" "}
              care — online, on call, and in-clinic.
            </h1>
            <p className="hero-reveal mb-8 max-w-xl text-lg leading-relaxed text-scratch-muted">
              Scratchnest is a compact GP clinic built the Indian way: clear
              communication, respectful queues, fair pricing, and follow-ups that
              actually happen. Book your visit through our AI assistant (it learns
              your preferred language and slot), or simply call us — no forms, no
              friction.
            </p>
            <div className="hero-reveal mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <motion.button
                type="button"
                className={btnPrimaryLg}
                data-cursor="pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setChatOpen(true)}
              >
                Book with AI assistant
              </motion.button>
              <motion.a
                href={CLINIC_PHONE_TEL}
                className={`${btnPhone} px-7 py-3.5 text-base`}
                data-cursor="pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Call {CLINIC_PHONE_DISPLAY}
              </motion.a>
            </div>
            <ul className="hero-reveal flex flex-col gap-2 text-sm text-scratch-muted sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
              {[
                "Same doctor continuity — your file stays consistent",
                "Chronic care (diabetes, BP, thyroid) with structured reviews",
                "Fever, infections, and everyday complaints — same day when possible",
              ].map((t) => (
                <li key={t} className="relative pl-4 sm:max-w-[280px]">
                  <span
                    className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-scratch-accent-2"
                    aria-hidden
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <motion.div
            className="parallax-soft flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="relative w-full max-w-[380px] overflow-hidden rounded-3xl border border-scratch-border/80 bg-scratch-surface p-7 shadow-[0_24px_80px_rgba(18,34,30,0.1)]">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-scratch-accent/15 blur-3xl"
                aria-hidden
              />
              <p className="relative mb-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-scratch-muted">
                How we treat patients
              </p>
              <p className="relative font-display text-2xl font-semibold text-scratch-text">
                Listen first. Explain clearly. Document accurately.
              </p>
              <p className="relative mt-3 text-sm leading-relaxed text-scratch-muted">
                Every consult is time-boxed but unhurried: history, vitals when
                needed, examination, and a written plan you can follow — including
                when to escalate or return.
              </p>
              <div className="relative mt-6 flex flex-wrap gap-2">
                {["OPD", "Lab tie-ups", "E-prescription", "Portal records"].map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-scratch-accent/20 bg-scratch-accent/10 px-3 py-1.5 text-xs font-bold text-scratch-accent"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="scroll-rise border-y border-scratch-border/70 bg-scratch-surface-2/40 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
          <div className="mb-8 max-w-2xl lg:mb-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-scratch-accent">
              See the clinic
            </p>
            <h2 className="mb-3 text-2xl leading-tight sm:text-4xl">
              Real spaces, clear standards — before you book
            </h2>
            <p className="text-base leading-relaxed text-scratch-muted sm:text-lg">
              Photos help you picture the visit: calm waiting, organised front desk, and
              consult rooms where we take time to explain. Scroll or swipe on your phone;
              use arrows or dots to explore on any device.
            </p>
          </div>
          <ClinicGalleryCarousel slides={CLINIC_GALLERY_SLIDES} className="mb-8 lg:mb-10" />
          <TrustSignalsStrip />
        </div>
      </section>

      <section className="scroll-rise mx-auto max-w-6xl px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="mb-3 text-3xl sm:text-4xl">Why families trust Scratchnest</h2>
          <p className="text-scratch-muted">
            A general physician clinic should feel dependable — not flashy. We focus
            on consistency of care, clean handoffs between visits, and digital tools
            that reduce repeat paperwork (UHID, past prescriptions, and lab trends
            in your portal).
          </p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              t: "Transparent billing (₹)",
              d: "Printed estimates for consults and common panels — ask at the desk or in chat.",
            },
            {
              t: "Labs & imaging, coordinated",
              d: "We work with accredited partners; results sync to your portal when released.",
            },
            {
              t: "Prescriptions you can trust",
              d: "Generic options discussed where appropriate; clear duration and review dates.",
            },
          ].map((f) => (
            <li
              key={f.t}
              className="rounded-2xl border border-scratch-border/90 bg-scratch-surface p-6 shadow-sm"
            >
              <h3 className="mb-2 text-lg font-semibold">{f.t}</h3>
              <p className="text-sm leading-relaxed text-scratch-muted">{f.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="scroll-rise border-y border-scratch-border bg-gradient-to-b from-scratch-surface-2 via-scratch-bg to-scratch-surface-2 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
          <div className="mb-12 max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-scratch-accent">
              AI + human front desk
            </p>
            <h2 className="mb-3 text-3xl sm:text-4xl">Fast answers. Real clinicians.</h2>
            <p className="text-scratch-muted">
              Our assistant is trained on Scratchnest policies — not random internet
              advice. It helps you book GP slots, understand what to bring, and route
              urgent symptoms. For diagnosis or treatment, you speak with our doctor.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              className="relative overflow-hidden rounded-3xl border border-scratch-border bg-scratch-surface p-8 shadow-lg"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(15,118,110,0.14),transparent_55%)]"
                aria-hidden
              />
              <h3 className="relative mb-2 font-display text-2xl font-semibold">
                Chat to book
              </h3>
              <p className="relative mb-6 text-sm leading-relaxed text-scratch-muted">
                Open the AI desk — share your preferred day, morning vs evening, and
                language. We confirm by call or WhatsApp where permitted.
              </p>
              <button
                type="button"
                className={`${btnPrimaryLg} relative w-full sm:w-auto`}
                data-cursor="pointer"
                onClick={() => setChatOpen(true)}
              >
                Open AI assistant
              </button>
            </motion.div>
            <motion.a
              href={CLINIC_PHONE_TEL}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-scratch-accent/35 bg-gradient-to-br from-scratch-accent to-teal-800 p-8 text-white shadow-xl shadow-teal-950/25 no-underline"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              data-cursor="pointer"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
                aria-hidden
              />
              <div className="relative">
                <h3 className="mb-2 font-display text-2xl font-semibold text-white">
                  Call the clinic
                </h3>
                <p className="text-sm leading-relaxed text-white/85">
                  Speak directly with our coordinator for appointments, reports
                  pickup, or to reach the duty doctor for urgent guidance.
                </p>
              </div>
              <p className="relative mt-8 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {CLINIC_PHONE_DISPLAY}
              </p>
              <span className="relative mt-2 text-sm font-semibold text-white/80">
                Tap to dial · {CLINIC_ADDRESS_LINE.split("·")[0].trim()}
              </span>
            </motion.a>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-rise relative mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:px-12 lg:py-24"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(100%,48rem)] -translate-x-1/2 rounded-full bg-scratch-accent/5 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="mb-3 text-3xl sm:text-4xl">Contact Scratchnest</h2>
          <p className="mb-10 text-scratch-muted">
            No contact forms — just conversation. Use the AI desk for structured
            booking and FAQs, or call us for anything that needs a human voice.
          </p>
          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <motion.button
              type="button"
              className={`${btnPrimaryLg} min-h-[3.5rem] w-full sm:w-auto`}
              data-cursor="pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setChatOpen(true)}
            >
              Chat with AI
            </motion.button>
            <motion.a
              href={CLINIC_PHONE_TEL}
              className={`${btnPhone} min-h-[3.5rem] w-full px-8 py-3.5 text-base sm:w-auto`}
              data-cursor="pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Call {CLINIC_PHONE_DISPLAY}
            </motion.a>
          </div>
        </div>
      </section>

      <section className="scroll-rise mx-auto max-w-6xl px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="mb-3 text-3xl sm:text-4xl">People behind your care</h2>
          <p className="text-scratch-muted">
            A small, senior-led team — so you see familiar faces and consistent
            clinical standards visit after visit.
          </p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-3">
          {[
            { name: "Dr. Ananya Krishnan", role: "MBBS, MD (General Medicine)" },
            { name: "Sister Meera Joseph", role: "OPD & vaccination lead" },
            { name: "Rahul Verma", role: "Patient care coordinator" },
          ].map((m) => (
            <li
              key={m.name}
              className="rounded-2xl border border-scratch-border bg-scratch-surface p-6 text-center shadow-sm"
            >
              <div
                className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-scratch-accent/25 to-teal-100"
                aria-hidden
              />
              <p className="mb-1 font-semibold text-scratch-text">{m.name}</p>
              <p className="text-sm text-scratch-muted">{m.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="scroll-rise mx-auto mt-6 max-w-6xl border-t border-scratch-border px-4 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <strong className="font-display text-lg text-scratch-text">
              Scratchnest General Physician Clinic
            </strong>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-scratch-muted">
              {CLINIC_ADDRESS_LINE}
              <br />
              {CLINIC_HOURS}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <a
              href={CLINIC_PHONE_TEL}
              className="font-display text-xl font-bold text-scratch-accent no-underline hover:underline"
              data-cursor="pointer"
            >
              {CLINIC_PHONE_DISPLAY}
            </a>
            <Link
              to="/login"
              className="text-sm font-semibold text-scratch-muted no-underline hover:text-scratch-accent"
              data-cursor="pointer"
            >
              Patient portal →
            </Link>
          </div>
        </div>
      </footer>

      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}
