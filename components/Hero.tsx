import Link from "next/link"
import { Icon } from "@/components/Icon"
import BookingWidget from "@/components/BookingWidget"

const chips = [
  {
    icon: null,
    label: "TfL Licensed · Operator 12345",
    dot: true,
  },
  {
    icon: "star" as const,
    label: "4.96 / 5 on 8,400+ rides",
    dot: false,
  },
  {
    icon: "leaf" as const,
    label: "Carbon-offset, every ride",
    dot: false,
  },
] as const

const airports = ["LHR", "LGW", "STN", "LTN", "LCY", "FAB", "SOU", "MAN"] as const

export default function Hero() {
  return (
    <section aria-label="Introduction" className="bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] px-pad pt-section pb-0">
        {/* Chips row */}
        <div className="mb-8 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-paper/20 px-3 py-1 text-xs font-medium text-paper/70"
            >
              {chip.dot && (
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-ok"
                />
              )}
              {chip.icon && (
                <Icon name={chip.icon} size={12} stroke={1.5} color="currentColor" />
              )}
              {chip.label}
            </span>
          ))}
        </div>

        {/* Editorial headline */}
        <h1 className="mb-8 max-w-4xl font-sans text-5xl font-normal leading-none tracking-tight md:text-7xl">
          Executive private hire, across{" "}
          <em className="font-serif font-normal italic">London</em>
          {" "}& the{" "}
          <em className="font-serif font-normal italic">United Kingdom</em>.
        </h1>

        {/* CTA row */}
        <div className="mb-12 flex flex-wrap items-center gap-4">
          <Link
            href="#booking-anchor"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-paper px-8 py-4 text-sm font-medium text-ink transition-colors hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Get an instant fare
            <Icon name="arrow" size={16} stroke={2} color="currentColor" />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-paper/20 px-8 py-4 text-sm font-medium text-paper transition-colors hover:border-paper/40 hover:bg-paper/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Explore services
          </Link>
          <span className="flex items-center gap-2 text-sm text-paper/50">
            <Icon name="headset" size={16} stroke={1.5} color="currentColor" />
            <span>24/7 dispatch</span>
            <a
              href="tel:+442039833973"
              className="font-mono text-paper/70 hover:text-paper transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper/50 rounded-s"
            >
              +44 20 3983 3973
            </a>
          </span>
        </div>

        {/* Hero photo */}
        <div className="relative w-full overflow-hidden rounded-l" style={{ aspectRatio: "21/10" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image migration is deferred to PR 1.E per plan */}
          <img
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1400&q=80&auto=format"
            alt="Executive chauffeur vehicle in London"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {/* Bottom overlay row */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 pointer-events-none">
            {/* Chauffeur card */}
            <div className="flex items-center gap-3 rounded-xl bg-ink/80 px-4 py-3 backdrop-blur-sm">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper"
              >
                <em className="font-serif font-normal italic text-ink text-xl leading-none">J</em>
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-medium text-paper">James T.</span>
                <span className="block text-xs text-paper/60">Senior Chauffeur</span>
              </span>
            </div>
            {/* ETA chip */}
            <div className="flex items-center gap-2 rounded-full bg-ink/80 px-4 py-2.5 backdrop-blur-sm">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-ok animate-pulse shrink-0"
              />
              <span className="text-xs font-medium text-paper">En route · ETA 8 min</span>
            </div>
          </div>
        </div>

        {/* Booking widget — overlaps photo on md: and above */}
        <BookingWidget />

        {/* Airports strip */}
        <div className="mt-8 border-t border-paper/10 pb-section">
          <p className="mb-4 pt-6 text-[10px] font-medium uppercase tracking-[0.22em] text-paper/30">
            We serve all major UK airports
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2" role="list">
            {airports.map((code) => (
              <li
                key={code}
                className="font-mono text-sm font-medium tracking-widest text-paper/50"
              >
                {code}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
