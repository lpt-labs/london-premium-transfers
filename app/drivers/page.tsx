import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Drive with Us — London Premium Transfers",
  description:
    "Join our team of professional chauffeurs. Flexible hours, premium vehicles, and competitive earnings for licensed private hire drivers in London.",
}

export default function DriversPage() {
  return (
    <main className="mx-auto max-w-[1440px] px-pad py-section">
      <h1 className="mb-4 font-sans text-4xl font-normal leading-none tracking-tight">
        Drive with Us
      </h1>
      <p className="mb-8 text-ink-soft">
        Join our team of professional chauffeurs. Driver applications page coming soon.
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
