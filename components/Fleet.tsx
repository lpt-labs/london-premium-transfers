const fleet = [
  {
    id: "business",
    tier: "Business Class",
    capacity: "Up to 3 passengers",
    examples: "Mercedes E-Class · BMW 5 Series",
    description:
      "The standard for executive travel. Immaculate vehicles, professional drivers, and on-time performance as the baseline — not the exception.",
  },
  {
    id: "first",
    tier: "First Class",
    capacity: "Up to 3 passengers",
    examples: "Mercedes S-Class · BMW 7 Series",
    description:
      "An elevated standard of refinement. A premium cabin and enhanced privacy for arrivals and departures that demand the very best.",
  },
  {
    id: "van",
    tier: "Executive Van",
    capacity: "Up to 7 passengers",
    examples: "Mercedes V-Class",
    description:
      "Group transfers without compromise. The full executive experience across your whole party — no splitting into multiple vehicles.",
  },
] as const

export default function Fleet() {
  return (
    <section aria-label="Fleet" className="bg-paper">
      <div className="mx-auto max-w-[1440px] px-pad py-section">
        <header className="mb-16 max-w-xl">
          <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-mute">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            The fleet
          </p>
          <h2 className="font-sans text-4xl font-normal leading-none tracking-tight md:text-5xl">
            The right vehicle{" "}
            <em className="font-serif font-normal italic">for every journey</em>
          </h2>
        </header>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {fleet.map((vehicle) => (
            <li
              key={vehicle.id}
              className="flex flex-col overflow-hidden rounded-l border border-line bg-paper-2 transition-shadow hover:shadow-s2"
            >
              {/* Vehicle tier placeholder — replace with next/image once assets are committed */}
              <div
                aria-hidden="true"
                className="aspect-video bg-paper-3 flex items-end p-6"
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
                  {vehicle.examples}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-8">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-ink-mute">
                  {vehicle.capacity}
                </p>
                <h3 className="mb-3 text-xl font-normal tracking-tight text-ink">
                  {vehicle.tier}
                </h3>
                <p className="text-sm leading-relaxed text-ink-soft">
                  {vehicle.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
