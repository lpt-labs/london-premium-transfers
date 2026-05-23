import FleetCard from "@/components/FleetCard"
import { vehicles } from "@/lib/fleet/data"

export const metadata = {
  title: "Our Fleet — London Premium Transfers",
  description:
    "Browse our chauffeur fleet across Executive, Business Class, and First Class categories. Fixed-price transfers with professional drivers.",
}

export default function FleetPage() {
  return (
    <main>
      <section aria-label="Fleet catalogue" className="bg-paper">
        <div className="mx-auto max-w-[1440px] px-pad py-section">
          <header className="mb-16 max-w-xl">
            <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-mute">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              The fleet
            </p>
            <h1 className="mb-6 font-sans text-4xl font-normal leading-none tracking-tight md:text-5xl">
              Choose your{" "}
              <em className="font-serif font-normal italic">vehicle</em>
            </h1>
            <p className="text-lg leading-relaxed text-ink-soft">
              Every vehicle in our fleet is maintained to the highest standard
              and driven by a licensed, experienced professional. Select the
              class that suits your journey.
            </p>
          </header>

          <ul
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
          >
            {vehicles.map((vehicle) => (
              <li key={vehicle.id}>
                <FleetCard vehicle={vehicle} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
