import Link from "next/link"

export default function Hero() {
  return (
    <section aria-label="Introduction" className="bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] px-pad py-section">
        <p className="mb-8 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-paper/50">
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          Executive private hire
        </p>
        <h1 className="mb-8 max-w-3xl font-sans text-5xl font-normal leading-none tracking-tight md:text-7xl">
          London Premium{" "}
          <em className="font-serif font-normal italic">Transfers</em>
        </h1>
        <p className="mb-12 max-w-lg text-lg leading-relaxed text-paper/60">
          Airport transfers to Heathrow, Gatwick, and Stansted. City rides,
          hourly hire, and corporate accounts — with flight tracking and
          professional drivers on every journey across London and the UK.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/book"
            className="inline-flex items-center rounded-full bg-paper px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Book a transfer
          </Link>
          <Link
            href="/fleet"
            className="inline-flex items-center rounded-full border border-paper/20 px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:border-paper/40 hover:bg-paper/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            See our fleet
          </Link>
        </div>
      </div>
    </section>
  )
}
