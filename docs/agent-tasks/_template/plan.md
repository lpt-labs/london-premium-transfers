# Plan: <one-line task summary>

<!--
  This file's section structure mirrors `.github/pull_request_template.md`
  intentionally. Copy the contents from "- **Goal:**" through the end of the
  rollback section into the `## Plan (required)` block of the PR description
  (or let the `sync-plan-to-pr.yml` workflow do it automatically by placing
  this file under `docs/agent-tasks/<task-id>/plan.md` and pushing — see
  PLAN:BEGIN / PLAN:END markers in the PR template).

  Manual paste also works as a fallback if the workflow ever fails.

  Keep this file accurate as the task evolves — it's the durable source of
  truth that drift-check (PR 10) compares against the actual diff.

  Naming convention: `<task-id>` is the issue number plus a short slug, e.g.
  `4-scaffold-nextjs`, `42-fleet-page`.
-->

> Issue: [#NN](https://github.com/lpt-labs/london-premium-transfers/issues/NN)
> Branch: `feat/<slug>` or `chore/<slug>`

- **Goal:** One sentence. What outcome are we after? (Not how.)
- **Scope (paths/files):**
  - `app/...`
  - `components/...`
  - `lib/...`
- **Steps:**
  1.
  2.
  3.
- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (plan-gate today; eval/drift/path-guard land in later PRs)
  - [ ] <feature-specific criterion 1>
  - [ ] <feature-specific criterion 2>
- **Risks + mitigations:**
  - *Risk:* …
    *Mitigation:* …
- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha>` (once the workflow exists; until then, manual `git revert <merge-sha>` on a follow-up PR).
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

From the table in `AGENTS.md`. Pick one:

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [ ] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan-first | Plan + Execution — with one-line reason. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
