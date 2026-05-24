import Link from "next/link"
import type { Vehicle } from "@/lib/fleet/types"

const CLASS_LABELS: Record<Vehicle["vehicleClass"], string> = {
  executive: "Executive",
  business: "Business Class",
  "first-class": "First Class",
}

const CLASS_GRADIENTS: Record<Vehicle["vehicleClass"], string> = {
  executive: "from-accent to-accent-2",
  business: "from-ink-2 to-ink",
  "first-class": "from-gold to-accent",
}

interface FleetCardProps {
  vehicle: Vehicle
}

export default function FleetCard({ vehicle }: FleetCardProps) {
  const gradient = CLASS_GRADIENTS[vehicle.vehicleClass]
  const classLabel = CLASS_LABELS[vehicle.vehicleClass]

  return (
    <article className="flex flex-col overflow-hidden rounded-l border border-line bg-paper-2 shadow-s1 transition-shadow hover:shadow-s2">
      {/* CSS gradient placeholder — replaced with next/image once vehicle assets are available */}
      <div
        aria-hidden="true"
        className={`aspect-[4/3] bg-gradient-to-br ${gradient} relative flex items-center justify-center`}
      >
        <span className="font-sans text-sm font-medium uppercase tracking-[0.18em] text-paper/70">
          {classLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-mute">
          {classLabel} &middot; Up to {vehicle.capacity} passengers
        </p>
        <h2 className="mb-3 text-xl font-normal tracking-tight text-ink">
          <Link href={`/fleet/${vehicle.id}`} className="hover:underline focus-visible:outline-none focus-visible:underline">{vehicle.name}</Link>
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-ink-soft">
          {vehicle.description}
        </p>
        <ul className="mb-8 space-y-1.5" aria-label={`${vehicle.name} features`}>
          {vehicle.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-ink-soft">
              <span aria-hidden="true" className="inline-block h-1 w-1 shrink-0 rounded-full bg-accent" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <Link
            href="/book"
            aria-label={`Book the ${vehicle.name}`}
            className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Book this vehicle
          </Link>
        </div>
      </div>
    </article>
  )
}
