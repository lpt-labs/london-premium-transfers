import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Services — London Premium Transfers",
  description:
    "Our full range of executive transfer services: airport transfers, chauffeur hire, corporate accounts, cruise, train station, university, and long distance journeys.",
}

export default function ServicesPage() {
  return (
    <main className="mx-auto max-w-[1440px] px-pad py-section">
      <h1 className="mb-4 font-sans text-4xl font-normal leading-none tracking-tight">
        Services
      </h1>
      <p className="mb-8 text-ink-soft">
        Our full range of executive transfer services. Full service pages coming soon.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-accent hover:text-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-s"
      >
        ← Back to home
      </Link>
    </main>
  )
}
