import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import type { ClinicGallerySlide } from "../lib/clinicGallery"

type Props = {
  slides: ClinicGallerySlide[]
  className?: string
}

const AUTO_MS = 6500

export default function ClinicGalleryCarousel({ slides, className = "" }: Props) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const count = slides.length
  const safeIndex = count ? index % count : 0

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!count) return
      setIndex((i) => (i + dir + count) % count)
    },
    [count]
  )

  useEffect(() => {
    if (reduceMotion || count <= 1) return
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return
      setIndex((i) => (i + 1) % count)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion, count])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        go(-1)
      }
      if (e.key === "ArrowRight") {
        e.preventDefault()
        go(1)
      }
    }
    el.addEventListener("keydown", onKey)
    return () => el.removeEventListener("keydown", onKey)
  }, [go])

  if (!count) return null

  const slide = slides[safeIndex]

  return (
    <section
      ref={sectionRef}
      className={className}
      aria-roledescription="carousel"
      aria-label="Clinic and care environment"
      tabIndex={0}
    >
      <div className="relative overflow-hidden rounded-2xl border border-scratch-border/90 bg-scratch-surface shadow-[0_20px_60px_rgba(18,34,30,0.08)] sm:rounded-3xl">
        <div
          className="relative aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-[2/1]"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null
          }}
          onTouchEnd={(e) => {
            const start = touchStartX.current
            touchStartX.current = null
            if (start == null) return
            const end = e.changedTouches[0]?.clientX
            if (end == null) return
            const dx = end - start
            if (Math.abs(dx) < 48) return
            if (dx < 0) go(1)
            else go(-1)
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={safeIndex}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 72rem"
                loading={safeIndex === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-scratch-text/85 via-scratch-text/25 to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
                <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/80">
                  Scratchnest · GP OPD
                </p>
                <h3 className="font-display text-xl font-semibold text-white sm:text-2xl lg:text-3xl">
                  {slide.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
                  {slide.caption}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-scratch-border/60 bg-scratch-surface-2/80 px-3 py-3 sm:px-4 sm:py-3.5">
          <button
            type="button"
            className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-scratch-border bg-scratch-surface text-scratch-text shadow-sm transition hover:border-scratch-accent/40 hover:bg-scratch-accent/5"
            aria-label="Previous image"
            data-cursor="pointer"
            onClick={() => go(-1)}
          >
            <ChevronIcon className="h-5 w-5 rotate-180" />
          </button>

          <div
            className="flex flex-1 flex-wrap items-center justify-center gap-2"
            role="tablist"
            aria-label="Slide"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === safeIndex}
                aria-label={`Show slide ${i + 1} of ${count}`}
                className={`h-2.5 min-h-[10px] rounded-full transition-all ${
                  i === safeIndex
                    ? "w-8 bg-scratch-accent"
                    : "w-2.5 bg-scratch-border hover:bg-scratch-accent/40"
                }`}
                data-cursor="pointer"
                onClick={() => setIndex(i)}
              />
            ))}
          </div>

          <button
            type="button"
            className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-scratch-border bg-scratch-surface text-scratch-text shadow-sm transition hover:border-scratch-accent/40 hover:bg-scratch-accent/5"
            aria-label="Next image"
            data-cursor="pointer"
            onClick={() => go(1)}
          >
            <ChevronIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-[0.7rem] text-scratch-muted sm:text-xs">
        Demo photos for layout — swap in your real clinic pictures in{" "}
        <code className="rounded bg-scratch-border/50 px-1 py-0.5 text-[0.65rem] text-scratch-text">
          src/lib/clinicGallery.ts
        </code>
        .
      </p>
    </section>
  )
}

function ChevronIcon({ className }: { className?: string }) {
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
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
