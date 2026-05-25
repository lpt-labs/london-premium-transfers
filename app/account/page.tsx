import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "My Account — London Premium Transfers",
  description:
    "Sign in to your London Premium Transfers account to manage bookings, view journey history, and update your preferences.",
}

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-[1440px] px-pad py-section">
      <h1 className="mb-4 font-sans text-4xl font-normal leading-none tracking-tight">
        My Account
      </h1>
      <p className="mb-8 text-ink-soft">
        Manage your bookings and account preferences. Sign-in page coming soon.
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
