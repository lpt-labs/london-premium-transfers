# Plan: site-constants-verification — multi-agent calibration check

> Issue: [#48](https://github.com/lpt-labs/london-premium-transfers/issues/48)
> Branch: `multi-agent/48` (created by the workflow)

- **Goal:** Add a single new file `lib/site/constants.ts` with three named exports (`SITE_TITLE`, `BOOKING_EMAIL_DEFAULT`, `PRIMARY_PHONE`). The point of this task is small but real — its purpose is to verify that PR #47's multi-agent orchestration calibration works end-to-end: all three jobs (implementer → a11y-reviewer → handoff-log) complete cleanly, the bot PR passes `plan-gate` first time, and the run produces the expected audit artefacts.

- **Scope (paths/files):**
  - `docs/agent-tasks/site-constants-verification/plan.md` (this file — pre-committed via Step 0)
  - `lib/site/constants.ts` (new — three named exports)

- **Steps:**
  1. Read `AGENTS.md`, root `CLAUDE.md`, this plan, and the issue body.
  2. Skim `lib/design-tokens.ts` and `lib/booking/quote.ts`'s pricing-table block for the named-export-with-typed-constants pattern in use elsewhere.
  3. Add `lib/site/constants.ts` with three exports:
     - `SITE_TITLE` = `"London Premium Transfers"`
     - `BOOKING_EMAIL_DEFAULT` = `"bookings@londonpremiumtransfers.example"`
     - `PRIMARY_PHONE` = `"+44 20 0000 0000"`
     Use explicit type annotations or `as const` — implementer picks. Leaf module: no imports.

- **Success criteria (verifiable):**
  - [ ] Required CI passes on the bot PR (`plan-gate`, `agent-ci`, `agent-artifact-check`).
  - [ ] Drift-check shows no drift.
  - [ ] Exactly one new file: `lib/site/constants.ts`.
  - [ ] `pnpm test:drift` and `pnpm test:quote` still pass.
  - [ ] **All three multi-agent jobs complete with `success` — none skip.** (Primary calibration check.)
  - [ ] `<!-- multi-agent:a11y-review -->` comment posted (expected content: "no a11y surface in this PR" or equivalent — verifies the reviewer handles no-UI tasks gracefully).
  - [ ] Handoff log file committed at `docs/handoffs/<date>-48-site-constants-verification.md`.

- **Risks + mitigations:**
  - *Risk:* The a11y-reviewer subagent's prompt may not have a clean path for "no a11y surface" and could produce a forced/awkward comment.
    *Mitigation:* Acceptable. The subagent's contract permits short comments and explicit "nothing to flag" responses. This is a useful test of how the reviewer handles the empty case.
  - *Risk:* PR #47's prompt-format guidance still under-specifies and the bot writes a non-compliant PR body.
    *Mitigation:* `plan-gate` is the source of truth — a failure here triggers another small calibration fix. Each iteration tightens the prompt.

- **Rollback / escalation plan:**
  - Revert via `.github/workflows/agent-rollback.yml` with the merge commit SHA.
  - Soft rollback: delete `lib/site/constants.ts` in a follow-up PR.
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [x] L2 (PR + 1 review — single file in `lib/**`)
- [ ] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — the multi-agent workflow IS the execution pipeline.
