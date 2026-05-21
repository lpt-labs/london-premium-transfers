import Link from "next/link"

const navColumns = [
  {
    heading: "Services",
    links: [
      { label: "Airport Transfers", href: "/services/airport" },
      { label: "City Transfers", href: "/services/city" },
      { label: "Hourly Charter", href: "/services/hourly" },
      { label: "Corporate Accounts", href: "/services/corporate" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Fleet", href: "/fleet" },
      { label: "About", href: "/about" },
      { label: "Drivers", href: "/drivers" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const

const legalLinks = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Cookies", href: "/legal/cookies" },
] as const

export default function Footer() {
  return (
    <footer aria-label="Site footer" className="bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] px-pad pb-12 pt-section">
        <div className="grid gap-12 border-b border-paper/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + contact */}
          <div className="lg:col-span-2">
            <p className="mb-3 text-xl font-normal leading-none tracking-tight">
              London Premium{" "}
              <em className="font-serif font-normal italic">Transfers</em>
            </p>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-paper/50">
              Executive chauffeur and private hire across London and the United
              Kingdom. Available around the clock, every day of the year.
            </p>
            <address className="not-italic">
              <a
                href="tel:+442012345678"
                className="block text-sm text-paper/60 transition-colors hover:text-paper focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper/50 rounded-s"
              >
                +44 20 1234 5678
              </a>
              <a
                href="mailto:bookings@londonpremiumtransfers.com"
                className="mt-1 block text-sm text-paper/60 transition-colors hover:text-paper focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper/50 rounded-s"
              >
                bookings@londonpremiumtransfers.com
              </a>
            </address>
          </div>
          {/* Nav columns */}
          {navColumns.map((column) => (
            <div key={column.heading}>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-paper/40">
                {column.heading}
              </p>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-paper/60 transition-colors hover:text-paper focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper/50 rounded-s"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Legal bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-8">
          <p className="text-xs text-paper/40">
            &copy; {new Date().getFullYear()} London Premium Transfers Ltd.
            All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-6">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs text-paper/40 transition-colors hover:text-paper/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper/50 rounded-s"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
