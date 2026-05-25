// "use client" required for dropdown open/close state and pathname-based active link styling
"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Icon } from "@/components/Icon"

const serviceItems = [
  {
    icon: "plane",
    title: "Airport Transfers",
    description: "Meet and greet, flight tracking",
    // /services/airport when PR 1.C ships
    href: "/services",
  },
  {
    icon: "user",
    title: "Chauffeur",
    description: "Point-to-point executive hire",
    // /services/chauffeur when PR 1.C ships
    href: "/services",
  },
  {
    icon: "briefcase",
    title: "Corporate",
    description: "Accounts, invoicing, teams",
    // /services/corporate when PR 1.C ships
    href: "/services",
  },
  {
    icon: "ship",
    title: "Cruise Transfers",
    description: "Port pickups and drop-offs",
    // /services/cruise when PR 1.C ships
    href: "/services",
  },
  {
    icon: "train",
    title: "Train Stations",
    description: "All major London terminals",
    // /services/train when PR 1.C ships
    href: "/services",
  },
  {
    icon: "sparkle",
    title: "University",
    description: "Student and open-day transfers",
    // /services/university when PR 1.C ships
    href: "/services",
  },
  {
    icon: "car",
    title: "Long Distance",
    description: "UK-wide executive journeys",
    // /services/longdistance when PR 1.C ships
    href: "/services",
  },
] as const

const mainLinks = [
  { label: "Home", href: "/" },
  { label: "Fleet", href: "/fleet" },
  { label: "Business", href: "/corporate" },
  { label: "About", href: "/about" },
  { label: "Drivers", href: "/drivers" },
] as const

export default function Nav() {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-[1440px] items-center gap-6 px-pad"
        style={{ height: "76px" }}
      >
        {/* Brand mark */}
        <Link
          href="/"
          className="mr-4 flex shrink-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-s"
          aria-label="London Premium Transfers — home"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink"
          >
            <em className="font-serif font-normal italic text-paper text-lg leading-none">L</em>
          </span>
          <span className="hidden sm:flex flex-col leading-none">
            <span className="text-xs font-medium tracking-tight text-ink">London Premium</span>
            <span className="text-[10px] tracking-wider text-ink-mute font-mono">Transfers · est. 2018</span>
          </span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden md:flex items-center gap-1 flex-1" role="list">
          {mainLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  "rounded-s px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
                  (isActive(link.href)
                    ? "text-ink"
                    : "text-ink-soft hover:text-ink")
                }
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Services dropdown */}
          <li className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((v) => !v)}
              onBlur={(e) => {
                // Close when focus leaves the entire dropdown subtree
                if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                  setDropdownOpen(false)
                }
              }}
              className={
                "flex items-center gap-1 rounded-s px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
                (isActive("/services") ? "text-ink" : "text-ink-soft hover:text-ink")
              }
            >
              Services
              <Icon
                name="chev"
                size={14}
                stroke={2}
                className={"transition-transform " + (dropdownOpen ? "rotate-180" : "")}
              />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-1 w-72 rounded-l border border-line bg-paper shadow-s3 focus-within:block"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                {serviceItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                    onFocus={() => setDropdownOpen(true)}
                    className="flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent first:rounded-t-l last:rounded-b-l"
                  >
                    <span className="mt-0.5 shrink-0 text-accent">
                      <Icon name={item.icon} size={16} stroke={1.5} />
                    </span>
                    <span>
                      <span className="block font-medium text-ink">{item.title}</span>
                      <span className="text-ink-mute">{item.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </li>
        </ul>

        {/* Right-side actions */}
        <div className="ml-auto flex items-center gap-3">
          {/* 24/7 phone pill */}
          <a
            href="tel:+442039833973"
            className="hidden lg:flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-ink-soft transition-colors hover:border-ink/30 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse shrink-0"
            />
            <span className="font-mono">+44 20 3983 3973</span>
          </a>

          {/* Sign in */}
          <Link
            href="/account"
            className="hidden sm:inline-flex items-center justify-center rounded-full border border-ink/20 bg-paper px-5 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/40 hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            Sign in
          </Link>

          {/* Book a ride */}
          <Link
            href="/#booking-anchor"
            className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            Book a ride
          </Link>
        </div>
      </nav>
    </header>
  )
}
