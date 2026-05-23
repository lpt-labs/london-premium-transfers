# Plan: PR 13 — Booking form + quote estimator

> Issue: #33
> Branch: `feat/booking`

- **Goal:** Add a booking form at `/book` that collects pickup/dropoff zone, vehicle class, datetime, and contact details, validates them server-side, and returns an estimated quote via a deterministic zone-based pricing function. Include the dual-track Copilot artifact (dormant `cli-agent-task.yml` workflow + study guide) so the CLI-invocation pattern has a syntactically-valid reference here, with the active equivalent being the existing Claude Code GitHub App `@claude` trigger.

- **Scope (paths/files):**
  - `docs/agent-tasks/13-booking-form/plan.md` (this file)
  - `lib/booking/quote.ts` (new — pure-logic price calculation; subset of existing `lib/` patterns)
  - `lib/booking/quote.test.ts` (new — `node:test` unit tests, no new dep)
  - `lib/booking/schema.ts` (new — input validation; native checks unless the implementer concludes zod is the better trade)
  - `app/book/actions.ts` (new — server action that validates input + calls `quote()` + returns result)
  - `app/book/page.tsx` (new — server component route shell)
  - `components/BookingForm.tsx` (new — client component for interactivity)
  - `components/Hero.tsx` (small update — wire the CTA to `/book`)
  - `components/Services.tsx` (small update — wire any "book now" links to `/book`)
  - `package.json` (add `"test:quote": "node --disable-warning=ExperimentalWarning --test lib/booking/quote.test.ts"` — mirrors the pattern from `test:drift`)
  - `.github/workflows/cli-agent-task.yml` (new — dormant Copilot CLI workflow; reference shape only)
  - `docs/COPILOT_STUDY/cli-in-workflow.md` (new — study guide on the CLI invocation pattern)
  - `docs/WORKFLOWS.md` (update — add the dormant CLI workflow to the "Dormant configurations" subsection seeded in PR 11b; do not add to the flowchart since it never fires)

- **Steps:**
  1. Add this plan file.
  2. Add `lib/booking/quote.ts` — pure function `calculateQuote(input) → quote` with types. Zone model: `central` / `inner` / `outer` / `airport`. Vehicle class: `executive` / `business` / `first-class`. Base fare per pickup zone + zone-pair multiplier + vehicle multiplier + night surcharge (22:00–06:00 local = +20%). All numbers in a single top-of-`quote.ts` constants block, easy to audit. No external API calls.
  3. Add `lib/booking/quote.test.ts` — `node:test` cases: base fare matches table, vehicle multiplier scales correctly, night surcharge applies at 22:00 and 05:59 but not 06:00, identical pickup/dropoff returns minimum fare, zone-pair symmetry (central→outer == outer→central). Cap at ~10 focused cases.
  4. Add `lib/booking/schema.ts` — typed validation: zones in the enum, vehicle in the enum, datetime is a valid future ISO string within next 90 days, name non-empty, email matches a basic shape, phone matches loose international shape. Native (no zod) unless the implementer surfaces a strong reason in commit 4. Return `{ ok: true, data } | { ok: false, errors: Record<field, string> }`.
  5. Add `app/book/actions.ts` — server action with `"use server"` directive. Accepts `FormData`, runs through `schema.parse`, calls `quote()`, returns `{ ok, quote?, errors? }`. Never throws to the client; always returns a structured result. Logs the (sanitised) failure on server-side validation errors for observability.
  6. Add `app/book/page.tsx` — server component route shell. Renders `<BookingForm />` plus a short intro paragraph. Uses existing design tokens from `lib/design-tokens.ts`.
  7. Add `components/BookingForm.tsx` — client component (`"use client"` directive). Form fields per the schema; on submit, calls the server action via React's form action pattern. Displays per-field errors and the returned quote (or "fix the highlighted fields" message). Fully keyboard-accessible: labels associated with inputs, error messages announced via `aria-describedby`, focus management on submit.
  8. Wire the homepage CTAs (`Hero`, `Services`) to `/book` — single-line `<Link>` substitutions per file. Don't restyle, don't refactor surrounding code.
  9. Add `.github/workflows/cli-agent-task.yml` — dormant Copilot CLI workflow. Trigger `workflow_dispatch` with `issue` input. Single job, pinned `actions/checkout` + `actions/setup-node` (first-party, `@v6` major-version tags OK). Step that would invoke `npx @github/copilot-cli -p "..." --no-ask-user` with `COPILOT_GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`. Top-of-file comment marks the file DORMANT (no Copilot CLI license in CI) and points at `docs/COPILOT_STUDY/cli-in-workflow.md`.
  10. Add `docs/COPILOT_STUDY/cli-in-workflow.md` — in your own words, explain: what each line of the YAML does; `COPILOT_GITHUB_TOKEN` semantics (read scope inherits from `GITHUB_TOKEN`; doesn't trigger downstream workflows — see `AGENT_PLAYBOOK.md` "GitHub token semantics" for the gotcha and the App-token fix); `--no-ask-user` behavior (agent proceeds without prompting for confirmation; meant for non-interactive runners); expected PR outcome (a branch + PR opened by the bot, gated by all the same CI as a human PR); comparison to the Claude Code GitHub App `@claude` trigger (the active equivalent we already use — same intent, different ecosystem).
  11. Update `docs/WORKFLOWS.md` — add `cli-agent-task.yml` to the "Dormant configurations" subsection added in PR 11b. Do not add it to the flowchart. Same-PR-or-it-rots invariant applies even for dormant files in `.github/workflows/`.

- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, `agent-ci`, `agent-artifact-check`).
  - [ ] `pnpm test:quote` passes locally with all cases green; `pnpm test:drift` still passes.
  - [ ] `/book` route loads in the Vercel preview, form submits, quote returns. (Manually verified — capture the preview URL in the PR Evidence section.)
  - [ ] Server-side validation rejects bad input with field-level errors; client never sees a thrown error.
  - [ ] Eval scorecard on this PR: Lighthouse Accessibility ≥ 95, axe-core 0 critical/serious violations, broken-link count 0, type-coverage stays ≥ 95%.
  - [ ] Drift check shows "no drift" — every changed file is in the Scope above.
  - [ ] `.github/workflows/cli-agent-task.yml` parses as valid YAML (`yq eval . .github/workflows/cli-agent-task.yml`).
  - [ ] `docs/COPILOT_STUDY/cli-in-workflow.md` covers all five explanation points (line-by-line YAML; `COPILOT_GITHUB_TOKEN` semantics with the chain-of-workflows gotcha; `--no-ask-user`; expected PR outcome; comparison to `@claude`).
  - [ ] `docs/WORKFLOWS.md` "Dormant configurations" subsection lists both `daily-repo-status.md` (from PR 11b) and `cli-agent-task.yml`.
  - [ ] Non-dismissable disclaimer banner on `/book` reads: "Quotes shown are estimates from a static demo pricing model; not a booking confirmation."

- **Risks + mitigations:**
  - *Risk:* Quote logic is the most "real product" piece in the repo — wrong numbers shipped to a preview look like real prices and confuse anyone who lands on `/book`.
    *Mitigation:* A non-dismissable disclaimer banner on the `/book` page: "Quotes shown are estimates from a static demo pricing model; not a booking confirmation." Tests cover the pricing table; reviewer reads the constants block and confirms.
  - *Risk:* Form submission via React's `formAction` pattern is unfamiliar to a Python-backgrounded reviewer; subtle Next.js App Router conventions (server actions, `"use server"` directive boundaries) can cause hard-to-trace runtime errors.
    *Mitigation:* The implementer explains the server-action pattern when introducing it in commit 5 (what `"use server"` means, where the action runs, why we never throw to the client). Keep the form's data flow ≤30 lines so the path through the system is readable in one screen.
  - *Risk:* Adding `lib/booking/schema.ts` with hand-rolled validation invites edge cases (datetime parsing, email regex pitfalls).
    *Mitigation:* Validators stay deliberately loose where ambiguous (email = "has @ and dot"; phone = "≥7 digits, optional + prefix") — they're defence-in-depth, not authoritative. If the spec tightens we revisit; do not preemptively add zod for a hypothetical future schema.
  - *Risk:* The dormant CLI workflow file under `.github/workflows/` lifts the whole PR to L3 even though the bulk is L2 app code — review burden goes up.
    *Mitigation:* Accept the L3 lift; the dormant file is short (~25 lines) and the parity story is clearer when both tracks land together. Splitting into two PRs is a fine alternative if the user prefers — flag at commit 9, decide then.
  - *Risk:* The v4 plan's PR 13 acceptance includes "PR opened by the Claude Code GitHub App workflow (not a local terminal session)" — but the user is hand-writing this PR. The active-path demonstration is missing if we don't do it somewhere.
    *Mitigation:* After merging PR 13, file a small follow-up issue (e.g., "Add a `robots.txt`" or "Add favicon") and use the `@claude` mention to exercise the in-CI workflow end-to-end. That issue's PR is the live demonstration; PR 13 itself stays hand-written and tracked here. Document this hand-off explicitly in the PR description's Evidence section.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="PR 13 booking form or pricing logic regressed"`
  - Soft rollback: delete `app/book/`, `components/BookingForm.tsx`, `lib/booking/`, and the dormant workflow + study guide in a follow-up PR. Hero/Services CTAs revert to whatever they linked to before.
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — touches `.github/workflows/cli-agent-task.yml`; PR carries `infra-change`)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — the app surface is large but each commit is reversible, design tokens already exist, and the pricing logic is pure / unit-tested. Reviewing the plan + diff together is cheaper than two review rounds. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
