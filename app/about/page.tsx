import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About Us — London Premium Transfers",
  description:
    "The story behind London Premium Transfers — our team, our standards, and our commitment to executive private hire across London and the UK.",
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[1440px] px-pad py-section">
      <h1 className="mb-4 font-sans text-4xl font-normal leading-none tracking-tight">
        About Us
      </h1>
      <p className="mb-8 text-ink-soft">
        The story behind London Premium Transfers. Full about page coming soon.
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
