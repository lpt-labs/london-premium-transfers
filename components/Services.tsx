const services = [
  {
    id: "01",
    title: "Airport Transfers",
    description:
      "Meet and greet at arrivals with real-time flight monitoring and name boards. Heathrow, Gatwick, Stansted, Luton, and City Airport.",
  },
  {
    id: "02",
    title: "City Transfers",
    description:
      "Fixed-price point-to-point rides across London, between cities, and to ports or rail terminals. No surge pricing, no surprises.",
  },
  {
    id: "03",
    title: "Hourly Charter",
    description:
      "Book a driver by the hour. Ideal for back-to-back meetings, evenings out, or days where the itinerary is not fixed in advance.",
  },
  {
    id: "04",
    title: "Corporate Accounts",
    description:
      "Consolidated invoicing, passenger management, and a dedicated account team for businesses that need reliable executive travel.",
  },
] as const

export default function Services() {
  return (
    <section aria-label="Services" className="bg-paper-2">
      <div className="mx-auto max-w-[1440px] px-pad py-section">
        <header className="mb-16 max-w-xl">
          <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-mute">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            What we offer
          </p>
          <h2 className="font-sans text-4xl font-normal leading-none tracking-tight md:text-5xl">
            Every journey,{" "}
            <em className="font-serif font-normal italic">exactly right</em>
          </h2>
        </header>
        <ul
          className="grid gap-px overflow-hidden rounded-l bg-line shadow-s2 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
        >
          {services.map((service) => (
            <li key={service.id} className="bg-paper p-8">
              <p
                aria-hidden="true"
                className="mb-6 font-mono text-xs font-medium tracking-[0.18em] text-ink-mute"
              >
                {service.id}
              </p>
              <h3 className="mb-3 text-base font-medium text-ink">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-soft">
                {service.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
