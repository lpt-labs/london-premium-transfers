# Plan: 60-chrome-and-hero — Top Nav + Hero refresh + BookingWidget + Footer refresh + Icon library + stub routes

> Issue: [#60](https://github.com/lpt-labs/london-premium-transfers/issues/60)
> Branch: `multi-agent/60` (created by the workflow)
> Plan reference: **PR 1.A** of the full-rebuild multi-PR plan (Track 1 — Visual layer; keystone)

- **Goal:** Land the keystone visual slice of the full rebuild — a sticky top Nav, an editorial Hero with chips + photo overlay + airports strip, a 3-tab BookingWidget that overlaps the Hero, a redesigned Footer, an inline-SVG Icon library, and stub pages for every Nav destination — so the home page matches the design's chrome end-to-end and every Nav link resolves.

- **Scope (paths/files):**
  - `docs/agent-tasks/60-chrome-and-hero/plan.md` (this file — pre-committed via Step 0)
  - `components/Icon.tsx` (new — inline SVG icon library, ~30+ named icons, server component)
  - `components/Nav.tsx` (new — sticky top nav with dropdown, server component)
  - `components/BookingWidget.tsx` (new — 3-tab booking widget overlapping the hero, `"use client"` for tab state)
  - `components/Hero.tsx` (refactor in place — chips, editorial headline, CTA row, photo overlay, airports strip; mounts BookingWidget at the bottom)
  - `components/Footer.tsx` (refactor in place — 4-column grid + giant "London Premium" word mark + socials)
  - `app/layout.tsx` (mount `<Nav />` above `{children}`)
  - `app/page.tsx` (use refactored Hero; leave existing Services + Fleet sections untouched — PR 1.B replaces them)
  - `app/services/page.tsx` (new — stub: server component + metadata + `<h1>` + "Coming soon" + `<Link>` back to `/`)
  - `app/about/page.tsx` (new — stub, same shape)
  - `app/corporate/page.tsx` (new — stub, same shape)
  - `app/drivers/page.tsx` (new — stub, same shape)
  - `app/account/page.tsx` (new — stub, same shape)

  **Out of scope:** `app/book/**`, `app/fleet/**`, `lib/**`, `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `app/globals.css`, `.github/**`. The implementer subagent must refuse if asked to touch any of these.

- **Steps:**
  1. Read `AGENTS.md`, root `CLAUDE.md`, this plan, the issue body (#60), the existing component family (`Hero.tsx`, `Services.tsx`, `Fleet.tsx`, `FleetCard.tsx`, `Footer.tsx`, `BookingForm.tsx`), `app/layout.tsx`, `app/page.tsx`, `lib/design-tokens.ts`, `lib/fleet/data.ts`, and `app/globals.css` (to confirm token names — do not modify).
  2. **`components/Icon.tsx`** — server component. Single named export `Icon`. Props: `name: string` (required), `size?: number` (default 18), `stroke?: number` (default 1.5), `color?: string` (default `"currentColor"`), `className?: string`. Each icon is an inline `<svg viewBox="0 0 24 24">` with `strokeLinecap="round"`, `strokeLinejoin="round"`. Cover at least: `arrow`, `arrowL`, `arrowUR`, `pin`, `cal`, `clock`, `user`, `users`, `luggage`, `plane`, `train`, `ship`, `briefcase`, `car`, `sparkle`, `check`, `star`, `phone`, `mail`, `wa`, `menu`, `close`, `chev`, `shield`, `gauge`, `coin`, `baby`, `leaf`, `globe`, `headset`, `fb`, `insta`, `x`, `li`. Return `null` (not a fragment) for unknown names so a typo is silent rather than crashing. No client APIs — pure markup.
  3. **5 stub pages** (`app/{services,about,corporate,drivers,account}/page.tsx`) — server components, ~15 lines each. Each exports `metadata: Metadata` with a sensible title + description, and renders a `<main>` containing `<h1>{Page name}</h1>` + a short "Coming soon" paragraph + a `<Link href="/">← Back to home</Link>`. Use the same container width pattern as `app/page.tsx` (`<main className="...">` with the existing wrap utility). Do these first so Nav links resolve when the workflow's preview deploy lands.
  4. **`components/Footer.tsx`** — refactor in place (do not delete + recreate; keep git blame). Server component. Dark background using existing tokens (`bg-ink text-paper` or equivalent classnames already wired through `globals.css`). Layout:
     - Top: 4-column grid on `md:` — column 1 is brand + tagline + two contact CTAs ("Call" + "WhatsApp" using the `Icon` component's `phone` / `wa` icons); columns 2–4 are link lists titled "Services" / "Company" / "Help" (use the same link sets as the live site Footer — services list of 7 routes including the `/services/{airport,chauffeur,corporate,cruise,train,university,longdistance}` stubs that don't exist yet, company links to `/about`, `/fleet`, `/corporate`, `/drivers`, help links can be `#` href for now). Wrap dead service-detail links as `<Link href="/services">` so every footer link resolves until PR 1.C ships the real pages.
     - Middle: giant word mark `London Premium` — `Premium` wrapped in `<em>` using `--font-serif` italic so the brand voice shows through. Font-size with `clamp()` so it scales mobile→desktop without overflow.
     - Bottom: legal row (left = copyright + TfL licence note, right = 4 social icons via `Icon` — IG / X / LI / FB).
  5. **`components/Nav.tsx`** — server component (no scroll-listener in this PR; ships with always-on hairline border). Sticky at `top: 0`, `z-index: 50`, with backdrop-blur on the paper-colour background. Inner row:
     - Left: brand mark — a 36×36 dark circle containing a serif italic "L" + a two-line text block (`London Premium` / `Transfers · est. 2018`). Wrap in `<Link href="/">`.
     - Middle: inline menu items — Home (`/`), Fleet (`/fleet`), Services▾ (dropdown), Business (`/corporate`), About (`/about`), Drivers (`/drivers`). Active state when the current pathname starts with the link's href. Hide entire menu under `md:` (mobile menu is a follow-up PR).
     - **Services dropdown**: a `<div>` positioned absolute under the trigger, listing the 7 service routes with icon + title + description per item. Trigger has `aria-haspopup="menu"`, `aria-expanded` toggled by hover/focus. Dropdown is reachable by keyboard — use `:focus-within` on the trigger's parent so the dropdown stays open while a child is focused. Items use the `Icon` component for each service's glyph (plane / user / briefcase / ship / train / sparkle / car).
     - Right: 24/7 phone pill (small live-dot indicator + `+44 20 3983 3973` formatted with the `t-mono` font utility), Sign-in button (`btn-paper btn-sm`, links to `/account`), "Book a ride" button (`btn-ink btn-sm`, links to `/#booking-anchor` — the BookingWidget anchor on the home page).
  6. **`components/BookingWidget.tsx`** — client component (`"use client"`). Render a card-shaped wrapper with `id="booking-anchor"` on its outer element. Layout:
     - Tab bar at the top — `role="tablist"`. Three tabs: "Transfer" (default), "Hourly", "Long Distance". Each tab is a `<button role="tab" aria-selected={...}>`. State held in a single `useState<"transfer" | "hourly" | "long-distance">("transfer")`.
     - Form body — a `<form method="GET" action="/book">` (not POST; we route to the existing /book page with query params). Hidden `<input name="service" value={tab}>`. Fields rendered conditionally by tab:
       - **Transfer**: pickup (text), dropoff (text), date (`<input type="date">`), time (`<input type="time">`), passengers (`<select>` 1–8), return-trip toggle (checkbox).
       - **Hourly**: pickup (text), date, time, duration (`<select>` 2 / 3 / 4 / 6 / 8 / 12 hours), passengers.
       - **Long Distance**: pickup, dropoff, date, time, passengers, luggage (`<select>` 0–8).
     - Submit button: `btn-ink btn-lg` "Get an instant fare". On submit, the browser navigates to `/book?service=…&pickup=…&dropoff=…&date=…&time=…&passengers=…&...`. The existing `/book` page does not have to consume the query params in this PR — surfacing them in the URL is enough for now; the real prefill lands when `/book` is refactored in PR 1.H.
     - Overlap behaviour: applied via Tailwind classes that produce `margin-top: -80px` on `md:` and above; on mobile drop the overlap so the widget sits below the hero photo cleanly.
  7. **`components/Hero.tsx`** — refactor in place. Server component. New shape:
     - Container row (wrap utility).
     - Chips row: three `.chip` elements — "TfL Licensed · Operator 12345" (with dot), "4.96 / 5 on 8,400+ rides" (Icon `star`), "Carbon-offset, every ride" (Icon `leaf`).
     - Single `<h1>` — editorial display heading: `Executive private hire, across <em>London</em> & the <em>United Kingdom</em>.` The two `<em>` wrappers pick up `--font-serif` italic.
     - CTA row: "Get an instant fare" button (`btn-ink btn-lg`, anchor links to `#booking-anchor`), "Explore services" button (`btn-ghost btn-lg`, links to `/services`), and an inline 24/7 phone meta line (Icon `headset` + "24/7 dispatch" + phone number in `t-mono`).
     - Hero photo: a 21:10 aspect-ratio `<div>` with a single `<img>` (plain `<img>`, lazy-loaded). Overlay at the bottom: a small chauffeur card (44×44 circle avatar with a serif italic letter + name + role) on the left, and a translucent ETA chip ("En route · ETA 8 min" with green dot) on the right.
     - Mount `<BookingWidget />` directly after the photo.
     - Hero strip: horizontal list of airport codes (LHR / LGW / STN / LTN / LCY / FAB / SOU / MAN) between two hairline borders, eyebrow style (uppercase, letter-spaced).
  8. **`app/layout.tsx`** — import the new `Nav` and mount it as the first child of `<body>` (or inside the existing body wrapper, above `{children}`). Do not change `metadata`, fonts, or anything else in this PR.
  9. **`app/page.tsx`** — replace the import of `Hero` with the refactored one (the path/name stays the same — refactor in place — so no import change should be needed). Leave the existing `<Services />` and `<Fleet />` sections in place; PR 1.B replaces them.
  10. Verify locally before pushing: `pnpm dev` then check `/`, `/services`, `/about`, `/corporate`, `/drivers`, `/account`; tab through the Nav and confirm the Services dropdown is keyboard-accessible.

- **Success criteria (verifiable):**
  - [ ] Required CI passes on the bot PR (`plan-gate`, `agent-ci`, `agent-artifact-check`).
  - [ ] `drift-check` shows ✅ No drift — every changed file in scope above.
  - [ ] Vercel preview: `/` renders the new Nav (sticky), the new Hero with photo overlay + chips + airports strip, the BookingWidget overlapping the hero on `md:`, and the new Footer.
  - [ ] Vercel preview: `/`, `/fleet`, `/services`, `/corporate`, `/about`, `/drivers`, `/account` all return HTTP 200.
  - [ ] BookingWidget submit navigates to `/book?service=…&pickup=…&…` (verify the URL changes after clicking submit on each tab).
  - [ ] Services dropdown opens on hover **and** keyboard focus; items reachable by Tab; trigger has `aria-haspopup="menu"`.
  - [ ] Heading hierarchy on `/` is sequential: a single `<h1>` (Hero) followed by `<h2>` sections — no skips.
  - [ ] `pnpm build` succeeds.
  - [ ] Eval scorecard on the bot PR: Lighthouse Performance ≥ 90, Accessibility ≥ 95, axe-core 0 critical / 0 serious, type-coverage ≥ 95%.
  - [ ] All three multi-agent jobs (implementer → a11y-reviewer → handoff-log) complete with `success`. A11y-reviewer's comment is substantive — the new Nav, dropdown, BookingWidget tabs, and Hero have real a11y surface area.

- **Risks + mitigations:**
  - *Risk:* Services dropdown is keyboard-trap or invisible to screen readers because it relies on CSS `:hover` only.
    *Mitigation:* Step 5 specifies `:focus-within` + `aria-haspopup="menu"` + `aria-expanded`. A11y-reviewer will flag any regression.
  - *Risk:* BookingWidget overlap (`margin-top: -80px`) clips on narrow viewports.
    *Mitigation:* Step 6 drops the overlap on mobile (apply via `md:`-prefixed classes).
  - *Risk:* The new Nav covers content at the top of every page (sticky + paper background + tall header).
    *Mitigation:* The existing `app/page.tsx` doesn't depend on viewport top alignment; if a stub page renders too close to the Nav, add an appropriate `padding-top` on `<main>` in the stub. Reviewer will flag if it looks cramped on `/services` etc.
  - *Risk:* Hero photo URL (`londonpremiumtransfers.co.uk` WP CDN) hot-link-protected or slow on Lighthouse runs.
    *Mitigation:* Use plain `<img loading="lazy">`; if the eval scorecard's LCP suffers, swap to an Unsplash placeholder (Anthropic's design originally fell back to Unsplash for the same reason). Document the swap in a follow-up commit on the bot's branch.
  - *Risk:* The dropdown's 6 service items link to `/services/{airport,…}` — routes that don't exist until PR 1.C.
    *Mitigation:* Step 5 says: wrap each dropdown item's `<Link>` to point to `/services` (the stub) for now, with the eventual destination commented in the JSX so PR 1.C can replace `/services` → `/services/airport` etc. in one find-and-replace pass. Lychee link-check will fail otherwise.
  - *Risk:* Refactoring `Hero.tsx` and `Footer.tsx` in place loses information from the current implementations that a future reader might want.
    *Mitigation:* The old implementations stay in `git log` — `git blame` survives the refactor. No need to keep the old code as a comment.
  - *Risk:* Implementer attempts to touch `app/globals.css` to add a token (e.g. for the dropdown shadow or airports strip border).
    *Mitigation:* Out-of-scope per the Scope block. Every visual property used in the new components must already have a matching token. If a token is genuinely missing, stop and ask — do not invent.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="PR 1.A visual regression"`
  - Soft rollback: delete `components/{Icon,Nav,BookingWidget}.tsx`, revert `components/{Hero,Footer}.tsx`, revert `app/layout.tsx`, delete the 5 stub `app/{route}/page.tsx` files.
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [x] L2 (PR + 1 review — feature work in `app/**` + `components/**` only)
- [ ] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — the multi-agent workflow IS the execution pipeline; this plan lives here for the implementer subagent to read before it writes a line of code.
