# Plan: PR 15 (multi-agent) — /fleet catalogue feature

> Issue: [#42](https://github.com/lpt-labs/london-premium-transfers/issues/42)
> Branch: `multi-agent/42` (created by the workflow)

- **Goal:** Add the `/fleet` catalogue route — a server-rendered grid of `FleetCard`s listing the chauffeur fleet. This PR is the smoke test for PR 14's multi-agent workflow: the implementer subagent writes the feature, the a11y-reviewer subagent posts a review comment, and the handoff-log job commits the audit entry. The `conflict-detect` workflow + `WORKFLOWS.md` update + any final handoff polishing land in a separate hand-written follow-up PR (PR 15b).

- **Scope (paths/files):**
  - `docs/agent-tasks/15-fleet-multi-agent/plan.md` (this file — pre-committed via Step 0)
  - `lib/fleet/types.ts` (new — `Vehicle` type)
  - `lib/fleet/data.ts` (new — ≥6 vehicles spanning executive / business / first-class)
  - `components/FleetCard.tsx` (new — single-vehicle card; server component)
  - `app/fleet/page.tsx` (new — server-component route shell rendering the grid)
  - `public/fleet/*.svg` (new — small generic SVG placeholders)

- **Steps:**
  1. Read `AGENTS.md`, root `CLAUDE.md`, this plan, and the issue body.
  2. Study existing components for the shape to match: `Hero.tsx`, `Services.tsx`, `Fleet.tsx`, `Footer.tsx`, `BookingForm.tsx`. Same container widths, typography scale, button shapes, design-token usage from `lib/design-tokens.ts`.
  3. Add `lib/fleet/types.ts` with the `Vehicle` type.
  4. Add `lib/fleet/data.ts` with ≥6 vehicles across the three classes; constants block at the top so the table is auditable in one screen.
  5. Add small generic SVG placeholders under `public/fleet/`.
  6. Add `components/FleetCard.tsx` — server component (no `"use client"`); uses `next/image` with explicit `width`/`height`; accessible markup (`<article>`, semantic heading, alt text).
  7. Add `app/fleet/page.tsx` — server component shell; imports `vehicles`; renders a responsive grid of `FleetCard`s; page heading + short intro paragraph.

- **Success criteria (verifiable):**
  - [ ] Required CI checks pass on the bot PR (`plan-gate`, `agent-ci`, `agent-artifact-check`).
  - [ ] Drift-check shows no drift — every changed file in scope.
  - [ ] `/fleet` loads on the Vercel preview with ≥6 vehicles rendered.
  - [ ] Eval scorecard: Lighthouse Performance ≥ 90, Accessibility ≥ 95, axe-core 0 critical/serious violations.
  - [ ] `FleetCard` visually matches existing component patterns.
  - [ ] All images declare explicit `width` + `height`; no CLS warnings.
  - [ ] A11y-reviewer subagent posts a comment with marker `<!-- multi-agent:a11y-review -->`.
  - [ ] Handoff-log job commits `docs/handoffs/<date>-42-fleet-multi-agent.md` to the bot branch.

- **Risks + mitigations:**
  - *Risk:* The implementer subagent's scope excludes `docs/handoffs/`, so it can't create the handoff log entry.
    *Mitigation:* Job 3 in `multi-agent.yml` writes the handoff log automatically — verified in PR 14.
  - *Risk:* The implementer subagent will refuse if asked to touch `.github/workflows/conflict-detect.yml` or `docs/WORKFLOWS.md`.
    *Mitigation:* This plan excludes them entirely; they land in hand-written PR 15b.
  - *Risk:* The handoff-log commit is pushed by `GITHUB_TOKEN` and won't retrigger CI on the bot PR (anti-recursion semantic — see `docs/AGENT_PLAYBOOK.md`).
    *Mitigation:* If the handoff-log commit is last at review time, manually re-run required checks via the Actions tab before merging.
  - *Risk:* A11y-reviewer flags a real issue; implementer doesn't iterate automatically.
    *Mitigation:* Either push a hand-written fix to the same `multi-agent/42` branch, or re-apply the `multi-agent` label to start a fresh run (concurrency cancels and restarts).
  - *Risk:* The bot run burns Anthropic credits; runaway label loops compound.
    *Mitigation:* Workflow concurrency group keyed on issue number with `cancel-in-progress: true` — verified in PR 14. Re-labels cancel in-flight runs.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="PR 15 multi-agent /fleet feature regressed"`
  - Soft rollback: delete `app/fleet/`, `components/FleetCard.tsx`, `lib/fleet/`, `public/fleet/` in a follow-up PR.
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [x] L2 (PR + 1 review — app/components/lib only)
- [ ] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — the multi-agent workflow IS the execution pipeline; this plan lives here for the implementer subagent to read.