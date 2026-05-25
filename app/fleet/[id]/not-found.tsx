import Link from "next/link"

export default function NotFound() {
  return (
    <main className="bg-paper">
      <div className="mx-auto max-w-[1440px] px-pad py-section">
        <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-mute">
          <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          The fleet
        </p>
        <h1 className="mb-6 font-sans text-4xl font-normal leading-none tracking-tight md:text-5xl">
          Vehicle not found
        </h1>
        <p className="mb-10 max-w-lg text-lg leading-relaxed text-ink-soft">
          The URL you followed does not match any vehicle in our catalogue. It
          may have been removed or the address may contain a typo.
        </p>
        <Link
          href="/fleet"
          className="inline-flex items-center rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Back to the fleet
        </Link>
      </div>
    </main>
  )
}
