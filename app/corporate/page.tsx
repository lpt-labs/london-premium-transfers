import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Corporate Accounts — London Premium Transfers",
  description:
    "Corporate travel accounts for businesses — consolidated invoicing, passenger management, and a dedicated account team for executive travel across London and the UK.",
}

export default function CorporatePage() {
  return (
    <main className="mx-auto max-w-[1440px] px-pad py-section">
      <h1 className="mb-4 font-sans text-4xl font-normal leading-none tracking-tight">
        Corporate Accounts
      </h1>
      <p className="mb-8 text-ink-soft">
        Business travel accounts with consolidated invoicing and dedicated support. Full corporate page coming soon.
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
