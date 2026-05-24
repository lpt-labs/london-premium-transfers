import Link from "next/link"
import type { Vehicle } from "@/lib/fleet/types"
import type { VehicleDetail } from "@/lib/fleet/details"

interface VehicleDetailProps {
  vehicle: Vehicle
  detail: VehicleDetail
}

export default function VehicleDetail({ vehicle, detail }: VehicleDetailProps) {
  return (
    <section aria-label={vehicle.name} className="bg-paper">
      <div className="mx-auto max-w-[1440px] px-pad py-section">
        <header className="mb-16 max-w-xl">
          <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-mute">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            The fleet
          </p>
          <h1 className="mb-6 font-sans text-4xl font-normal leading-none tracking-tight md:text-5xl">
            {vehicle.name}
          </h1>
        </header>

        <div className="grid gap-16 lg:grid-cols-[1fr_360px]">
          <div>
            <section aria-labelledby="about-heading" className="mb-12">
              <h2
                id="about-heading"
                className="mb-4 font-sans text-2xl font-normal tracking-tight text-ink"
              >
                About this vehicle
              </h2>
              <p className="text-lg leading-relaxed text-ink-soft">
                {detail.longDescription}
              </p>
            </section>

            <section aria-labelledby="features-heading" className="mb-12">
              <h2
                id="features-heading"
                className="mb-4 font-sans text-2xl font-normal tracking-tight text-ink"
              >
                Features
              </h2>
              <ul className="space-y-2" aria-label={`${vehicle.name} features`}>
                {vehicle.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-base text-ink-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="best-for-heading">
              <h2
                id="best-for-heading"
                className="mb-4 font-sans text-2xl font-normal tracking-tight text-ink"
              >
                Best for
              </h2>
              <ul className="space-y-2" aria-label={`${vehicle.name} recommended uses`}>
                {detail.recommendedFor.map((use) => (
                  <li
                    key={use}
                    className="flex items-center gap-3 text-base text-ink-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {use}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-l border border-line bg-paper-2 p-8">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-mute">
                Capacity
              </p>
              <p className="text-lg font-normal text-ink">
                Up to {vehicle.capacity} passengers
              </p>
            </div>

            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-sm font-medium text-paper transition-colors hover:bg-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Book this vehicle
            </Link>

            <Link
              href="/fleet"
              className="inline-flex items-center justify-center rounded-full border border-line px-8 py-4 text-sm font-medium text-ink-soft transition-colors hover:border-ink/30 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
            >
              Back to the fleet
            </Link>
          </aside>
        </div>
      </div>
    </section>
  )
}
