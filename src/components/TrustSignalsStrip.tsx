import type { SVGProps } from "react"

const items: { title: string; subtitle: string; Icon: typeof ShieldIcon }[] = [
  {
    title: "NMC-registered care",
    subtitle: "Qualified GP-led OPD with clear clinical standards.",
    Icon: ShieldIcon,
  },
  {
    title: "Hygiene-first OPD",
    subtitle: "Structured cleaning, spacing, and safe waiting flow.",
    Icon: SparkleIcon,
  },
  {
    title: "Records in your portal",
    subtitle: "Labs, bills, and scripts when they’re ready — in one place.",
    Icon: FolderIcon,
  },
  {
    title: "Pricing you can ask about",
    subtitle: "Estimates for common consults — no surprise desk moments.",
    Icon: RupeeIcon,
  },
]

export default function TrustSignalsStrip({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ title, subtitle, Icon }) => (
          <li
            key={title}
            className="flex gap-3 rounded-2xl border border-scratch-border/90 bg-scratch-surface/90 p-4 shadow-sm backdrop-blur-sm"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-scratch-accent/12 text-scratch-accent">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[0.95rem] font-semibold leading-snug text-scratch-text">
                {title}
              </p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-scratch-muted sm:text-sm">
                {subtitle}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="M12 3v2M12 19v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M3 12h2M19 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function FolderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RupeeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="M6 3h12M6 8h12M10 8a4 4 0 0 1 0 8H6M14 8a4 4 0 0 0 0 8h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
