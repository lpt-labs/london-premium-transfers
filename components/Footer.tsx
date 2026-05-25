import Link from "next/link"
import { Icon } from "@/components/Icon"

const servicesLinks = [
  // /services/airport when PR 1.C ships
  { label: "Airport Transfers", href: "/services" },
  // /services/chauffeur when PR 1.C ships
  { label: "Chauffeur Hire", href: "/services" },
  // /services/corporate when PR 1.C ships
  { label: "Corporate Accounts", href: "/services" },
  // /services/cruise when PR 1.C ships
  { label: "Cruise Transfers", href: "/services" },
  // /services/train when PR 1.C ships
  { label: "Train Stations", href: "/services" },
  // /services/university when PR 1.C ships
  { label: "University Transfers", href: "/services" },
  // /services/longdistance when PR 1.C ships
  { label: "Long Distance", href: "/services" },
] as const

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Fleet", href: "/fleet" },
  { label: "Corporate", href: "/corporate" },
  { label: "Drivers", href: "/drivers" },
] as const

const helpLinks = [
  { label: "FAQ", href: "#" },
  { label: "Contact Us", href: "#" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
] as const

const socialLinks = [
  { icon: "insta" as const, label: "Instagram", href: "#" },
  { icon: "x" as const, label: "X (Twitter)", href: "#" },
  { icon: "li" as const, label: "LinkedIn", href: "#" },
  { icon: "fb" as const, label: "Facebook", href: "#" },
] as const

export default function Footer() {
  return (
    <footer aria-label="Site footer" className="bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] px-pad pt-section pb-12">
        {/* 4-column grid */}
        <div className="grid gap-12 border-b border-paper/10 pb-12 md:grid-cols-4">
          {/* Column 1 — brand + contact */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-s"
              aria-label="London Premium Transfers — home"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/10"
              >
                <em className="font-serif font-normal italic text-paper text-lg leading-none">L</em>
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-sm font-medium text-paper">London Premium</span>
                <span className="text-xs text-paper/40 font-mono">Transfers</span>
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-paper/50">
              Executive chauffeur and private hire across London and the United
              Kingdom. Available around the clock, every day of the year.
            </p>
            <address className="not-italic space-y-2">
              <a
                href="tel:+442039833973"
                className="flex items-center gap-2 text-sm text-paper/60 transition-colors hover:text-paper focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper/50 rounded-s"
              >
                <Icon name="phone" size={14} stroke={1.5} color="currentColor" />
                <span className="font-mono">+44 20 3983 3973</span>
              </a>
              <a
                href="https://wa.me/442039833973"
                className="flex items-center gap-2 text-sm text-paper/60 transition-colors hover:text-paper focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-paper/50 rounded-s"
              >
                <Icon name="wa" size={14} stroke={1.5} color="currentColor" />
                WhatsApp
              </a>
            </address>
          </div>

          {/* Column 2 — Services */}
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-paper/40">
              Services
            </p>
            <ul className="space-y-3">
              {servicesLinks.map((link) => (
                <li key={link.label}>
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

          {/* Column 3 — Company */}
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-paper/40">
              Company
            </p>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
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

          {/* Column 4 — Help */}
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-paper/40">
              Help
            </p>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
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
        </div>

        {/* Giant word mark */}
        <div className="border-b border-paper/10 py-10 overflow-hidden">
          <p
            className="font-sans font-normal leading-none tracking-tight text-paper/10 select-none whitespace-nowrap"
            style={{ fontSize: "clamp(48px, 10vw, 144px)" }}
            aria-hidden="true"
          >
            London{" "}
            <em className="font-serif font-normal italic">Premium</em>
          </p>
        </div>

        {/* Bottom legal row */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-8">
          <p className="text-xs text-paper/40">
            &copy; {new Date().getFullYear()} London Premium Transfers Ltd. All rights reserved.
            {" "}Licensed by Transport for London.
          </p>
          {/* Social icons */}
          <ul className="flex items-center gap-4" role="list">
            {socialLinks.map((social) => (
              <li key={social.icon}>
                <a
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-paper/40 transition-colors hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                >
                  <Icon name={social.icon} size={16} stroke={1.5} color="currentColor" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
