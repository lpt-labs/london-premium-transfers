# Plan: vehicle-detail-pages — /fleet/[id] dynamic routes

> Issue: [#57](https://github.com/lpt-labs/london-premium-transfers/issues/57)
> Branch: `multi-agent/57` (created by the workflow)

- **Goal:** Add a per-vehicle detail page at `/fleet/[id]` for each existing vehicle (6 today). Visitors clicking a card on `/fleet` land on a deeper page with a long description and recommended-use-cases section, then a CTA back to `/book`. Improves SEO surface (one indexable page per vehicle) and conversion (deep-dive content before the booking commitment).

- **Scope (paths/files):**
  - `docs/agent-tasks/vehicle-detail-pages/plan.md` (this file — pre-committed via Step 0)
  - `app/fleet/[id]/page.tsx` (new — dynamic route, server component, `generateStaticParams` for SSG)
  - `app/fleet/[id]/not-found.tsx` (new — custom 404 for unknown vehicle IDs)
  - `components/VehicleDetail.tsx` (new — full-page detail layout)
  - `components/FleetCard.tsx` (single-line update — wrap the `<h2>{vehicle.name}</h2>` in `<Link href={\`/fleet/${vehicle.id}\`}>`. Keep everything else)
  - `lib/fleet/details.ts` (new — `vehicleDetails` map keyed by every existing vehicle ID; long description + recommended-for list per vehicle)

  **Out of scope:** `lib/fleet/data.ts`, `lib/fleet/types.ts`, `package.json`, `.github/workflows/**`, `app/fleet/page.tsx` (catalogue stays unchanged — the link wire-up happens via FleetCard). The implementer subagent must refuse if asked to touch any of these.

- **Steps:**
  1. Read `AGENTS.md`, root `CLAUDE.md`, this plan, the issue body, the existing component family (`Hero.tsx`, `Services.tsx`, `Fleet.tsx`, `FleetCard.tsx`, `BookingForm.tsx`), `lib/design-tokens.ts`, and `lib/fleet/{data,types}.ts`.
  2. Add `lib/fleet/details.ts`. Export a `VehicleDetail` type (`longDescription: string`, `recommendedFor: string[]`) and a `vehicleDetails: Record<string, VehicleDetail>` map. Every ID currently in `vehicles` (`executive-sedan`, `executive-estate`, `business-saloon`, `business-suv`, `first-class-saloon`, `first-class-van`) MUST have an entry. Long descriptions ≈ 2–3 sentences each, building on the short `description` already in `data.ts`. Recommended-for = 3–5 short marketing strings ("Airport transfers", "Cross-city business trips", etc.).
  3. Add `components/VehicleDetail.tsx`. Server component (no `"use client"`). Props: `{ vehicle: Vehicle, detail: VehicleDetail }`. Layout: page heading (`<h1>` = vehicle name), `<h2>` sections for "About this vehicle" (long description), "Features" (the existing `features` list), "Best for" (recommended-for list), and a CTA `<Link href="/book">` styled like existing buttons. Same container width + typography + design tokens as the homepage components.
  4. Add `app/fleet/[id]/page.tsx`:
     - Export `generateStaticParams() { return vehicles.map(v => ({ id: v.id })) }` so all 6 pages are SSG'd at build time.
     - Export a `metadata` function or object: `{ title: \`${vehicle.name} — London Premium Transfers\`, description: vehicle.description }`.
     - Page component signature uses Next.js 16 async params: `async function Page({ params }: { params: Promise<{ id: string }> })` then `const { id } = await params`.
     - Look up `vehicle` from `vehicles.find(v => v.id === id)` and `detail` from `vehicleDetails[id]`. If either is undefined, call `notFound()` from `next/navigation`.
     - Render `<main><VehicleDetail vehicle={vehicle} detail={detail} /></main>`.
  5. Add `app/fleet/[id]/not-found.tsx`. Short page — `<h1>Vehicle not found</h1>` + 1–2 sentences explaining the URL doesn't match a vehicle in the catalogue + a `<Link href="/fleet">Back to the fleet</Link>`. Same container width + typography as the rest of the site.
  6. Update `components/FleetCard.tsx`. Replace `<h2>{vehicle.name}</h2>` with `<h2><Link href={\`/fleet/${vehicle.id}\`} className="hover:underline focus-visible:outline-none focus-visible:underline">{vehicle.name}</Link></h2>` (or equivalent that matches the existing focus-state pattern). Do not change the existing "Book this vehicle" Link. Do not add a second click target.

- **Success criteria (verifiable):**
  - [ ] Required CI passes on the bot PR (`plan-gate`, `agent-ci`, `agent-artifact-check`).
  - [ ] Drift-check shows no drift — every changed file in scope above.
  - [ ] `/fleet/executive-sedan`, `/fleet/executive-estate`, `/fleet/business-saloon`, `/fleet/business-suv`, `/fleet/first-class-saloon`, `/fleet/first-class-van` all load on the Vercel preview.
  - [ ] `/fleet/nonexistent-id` renders the custom `not-found.tsx`, not the Next.js generic 404.
  - [ ] From `/fleet`, clicking a vehicle name navigates to its detail page; keyboard-accessible (Tab to the heading link, Enter to follow).
  - [ ] `pnpm build` succeeds — verifies `generateStaticParams`, type checks, and that all 6 ID entries exist in `details.ts`.
  - [ ] Eval scorecard on the bot PR: Lighthouse Performance ≥ 90, Accessibility ≥ 95, axe-core 0 critical/serious violations on the new detail pages.
  - [ ] All three multi-agent jobs (implementer → a11y-reviewer → handoff-log) complete with `success`. A11y-reviewer's comment is substantive — the new pages have real UI surface (heading structure, link semantics, list patterns) to engage with.

- **Risks + mitigations:**
  - *Risk:* `details.ts` missing an ID entry — request-time `notFound()` instead of a real page.
    *Mitigation:* Step 2 spells out all 6 IDs explicitly. Reviewer can `diff <(jq -r '.[].id' lib/fleet/data.ts) <(grep -oE '"[a-z-]+":' lib/fleet/details.ts | tr -d '":')` style check, or just read the file.
  - *Risk:* The `FleetCard` heading-as-link change introduces a focus-ring regression (no visible focus on the linked heading text).
    *Mitigation:* The proposed Link adds `focus-visible:underline` so keyboard users see the focus. A11y-reviewer will flag if the implementation drops this.
  - *Risk:* Next.js 16 App Router async-params typing trips up the implementer.
    *Mitigation:* Step 4 spells out the signature explicitly (`params: Promise<{ id: string }>` + `await params`). The build step catches type mismatches.
  - *Risk:* `generateStaticParams` doesn't actually statically render the pages (e.g., missing `dynamicParams = false` or some other config).
    *Mitigation:* Default behaviour is to statically render the returned IDs; dynamic IDs still work via runtime SSR + `notFound()`. Both behaviours are acceptable here; the success-criteria preview test catches a broken implementation.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="vehicle detail pages regressed"`
  - Soft rollback: delete `app/fleet/[id]/`, `components/VehicleDetail.tsx`, `lib/fleet/details.ts` in a follow-up PR; revert the one-line `FleetCard` change.
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [x] L2 (PR + 1 review — single feature in `app/**`, `components/**`, `lib/**`)
- [ ] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — the multi-agent workflow IS the execution pipeline; this plan lives here for the implementer subagent to read.
