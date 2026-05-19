# Plan: <one-line task summary>

> Copy this file to `docs/agent-tasks/<task-id>/plan.md` at the start of a task.
> `<task-id>` is usually the issue number (e.g. `42-fleet-page`).
> Keep this file accurate as the task evolves — it's the source of truth for drift detection.

## Goal

One sentence. What outcome are we after? (Not how.)

## Scope (paths/files)

The directories or files the agent is permitted to modify. Anything outside this list will be flagged by `drift-check`. Be specific.

- `app/...`
- `components/...`
- `lib/...`

## Steps

Ordered list of concrete actions the agent will take. Reviewers compare this against the eventual commits.

1.
2.
3.

## Success criteria (verifiable)

Each item must be testable by another person reading the diff or a workflow run.

- [ ] Required CI checks pass (lint, typecheck, build, plan-gate, eval, drift, path-guard).
- [ ] <feature-specific criterion 1>
- [ ] <feature-specific criterion 2>

## Risks + mitigations

- *Risk:* …
  *Mitigation:* …

## Rollback / escalation plan

- Rollback: `gh workflow run agent-rollback.yml -f sha=<merge-sha>` (once the workflow exists; until then, manual `git revert <merge-sha>` on a follow-up PR).
- Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

From the table in `AGENTS.md`. Pick one:

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [ ] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)
