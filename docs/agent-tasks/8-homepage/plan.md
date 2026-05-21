# Plan: Implement homepage — hero / services / fleet / footer

> Issue: [#25](https://github.com/lpt-labs/london-premium-transfers/issues/25)
> Branch: `feat/homepage`

- **Goal:** Replace the placeholder `app/page.tsx` with a production homepage at `/` that implements the hero, services, fleet, and footer sections using the existing design-token-driven Tailwind utilities.
- **Scope (paths/files):**
  - `app/page.tsx` (replace placeholder)
  - `components/Hero.tsx`
  - `components/Services.tsx`
  - `components/Fleet.tsx`
  - `components/Footer.tsx`
  - `docs/agent-tasks/8-homepage/plan.md` (this file)
  - `docs/agent-tasks/8-homepage/decisions.md` (non-obvious decisions)
- **Steps:**
  1. Save this plan to `docs/agent-tasks/8-homepage/plan.md`.
  2. Fetch the design source (`https://api.anthropic.com/v1/design/h/keLW2q3eaJ0TdN_OAiedcQ?open_file=index.html`) and implement the four named sections. Fall back to `~/Downloads/London Premium Transfers.html` only if the fetch fails.
  3. Implement `components/Hero.tsx` — brand wordmark (`London Premium <em>Transfers</em>`), eyebrow label, subtitle, primary CTA (Book a transfer) and secondary link (See our fleet). Dark `bg-ink` background, full-width, `py-section` vertical rhythm.
  4. Implement `components/Services.tsx` — four service cards (Airport Transfers, City Transfers, Hourly Charter, Corporate Accounts) in a responsive grid on `bg-paper-2`. Numbered indicators (`01`–`04`) in `font-mono`. Hairline-rule grid using `gap-px bg-line`.
  5. Implement `components/Fleet.tsx` — three vehicle-class cards (Business, First, Executive Van) on `bg-paper`. Each card has a placeholder image area (`bg-paper-3 aspect-video`), capacity label, tier name, and description. Replace placeholder with `next/image` once vehicle assets are committed.
  6. Implement `components/Footer.tsx` — `bg-ink` footer with brand wordmark, address/contact, Services and Company nav columns, and a legal bar with copyright and policy links.
  7. Update `app/page.tsx` to compose all four components inside `<main className="flex-1">` with `<Footer />` outside main (correct semantic structure).
  8. Run `pnpm build` locally (or verify CI passes) to confirm no TypeScript errors or build failures before opening the PR.
  9. Open PR from `feat/homepage` to `main`; paste the Goal-through-Rollback bullets between the `PLAN:BEGIN`/`PLAN:END` markers.
- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`).
  - [ ] `agent-ci` lint, typecheck, and build all pass on the PR.
  - [ ] `pnpm dev` renders the homepage at `http://localhost:3000` without console or terminal errors.
  - [ ] Vercel preview URL appears on the PR and visually matches the four target sections.
  - [ ] Every colour, font, radius, shadow, and spacing value in the new components comes from `lib/design-tokens.ts` via Tailwind utilities — no raw hex codes, no inline `style={{}}` for visual concerns.
  - [ ] Components are Server Components; no `"use client"` boundaries required.
  - [ ] Accessibility baseline met: semantic HTML, keyboard-reachable interactive elements with visible focus rings, every `<img>` has `alt`, text/background contrast ≥ AA.
  - [ ] `lib/design-tokens.ts` is NOT modified.
  - [ ] No files modified outside the scope list above.
  - [ ] Branch is `feat/homepage`; no direct pushes to `main`.
- **Risks + mitigations:**
  - *Risk:* Design source URL inaccessible at run time (network policy in CI).
    *Mitigation:* Implement from brand token documentation in `docs/agent-tasks/4-scaffold-nextjs/extracted-tokens.md` and `memory.md`. Surface in PR description; reviewer compares against the visual source.
  - *Risk:* `max-w-[1440px]` arbitrary value — `tokens.layout.maxw` is not exposed as a named Tailwind utility.
    *Mitigation:* Documented in `decisions.md`. Recommend adding `--max-w-layout: 1440px` to `app/globals.css` @theme in a follow-up task.
  - *Risk:* Fleet section lacks real vehicle images; placeholder divs ship to preview.
    *Mitigation:* Placeholder clearly labelled in code comment. A follow-up task to commit vehicle assets and wire `next/image` is the natural next step.
  - *Risk:* `text-paper/60`, `border-paper/20` opacity modifiers require CSS `color-mix()` (Baseline 2023).
    *Mitigation:* Acceptable for a modern-browser premium service site; IE/legacy support is not a stated requirement.
- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="homepage regression"`.
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [x] L2 (PR + 1 review — default for app code)
- [ ] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — app code within authorized scope, all changes reversible, no infra/secrets touched.
