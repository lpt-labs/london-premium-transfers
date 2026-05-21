# Plan: PR 7 — Safe execution (rollback, retries, escalation, environment gates)

<!--
  This file's section structure mirrors `.github/pull_request_template.md`.
  Paste the "- **Goal:**" through "Rollback / escalation" bullets into the
  `## Plan (required)` block of the PR description.
-->

> No tracking issue (self-implemented infra PR).
> Branch: `feat/safe-execution`

- **Goal:** Add the safe-execution layer the rest of the plan depends on: a one-click rollback workflow, a reusable retry composite action, an expanded `AGENT_PLAYBOOK.md` with the two-strike escalation policy, and a reference deploy workflow that uses the `production` environment's required-reviewer gate. After merge, every PR's `Rollback command` field in the template becomes a real, runnable command.
- **Scope (paths/files):**
  - `docs/agent-tasks/7-safe-execution/plan.md` (this file)
  - `.github/workflows/agent-rollback.yml`
  - `.github/actions/retry-step/action.yml`
  - `docs/AGENT_PLAYBOOK.md` (expand skeleton from PR 6)
  - `.github/workflows/deploy.yml` (reference workflow; `workflow_dispatch` only)
  - `docs/WORKFLOWS.md` (visual reference: Mermaid flowchart + sequence diagram + per-workflow table; covers every workflow currently in `.github/workflows/`)
  - `AGENTS.md` (add a *Documentation invariants* sub-section requiring same-PR updates to `docs/WORKFLOWS.md` whenever workflows change)
  - `.github/workflows/CLAUDE.md` (add the same-PR rule to the rules-summary)
  - `.github/instructions/workflows.instructions.md` (add a *Documentation* section + an anti-pattern bullet for the same)
- **Steps:**
  1. Save this plan as `docs/agent-tasks/7-safe-execution/plan.md` (first commit).
  2. Hand-write `.github/workflows/agent-rollback.yml`. `workflow_dispatch` input: a commit SHA + an optional reason string. Validate SHA is hex (regex), reject otherwise. Pass SHA via `env:` to shell — never `${{ }}` interpolation. Create a branch `revert/<short-sha>`, `git revert` the target commit, push, `gh pr create` against `main` with a body that references the original commit and explains the revert. Least-privilege permissions (`contents: write`, `pull-requests: write`; nothing else).
  3. Hand-write `.github/actions/retry-step/action.yml` — composite action with inputs `command`, `max-attempts` (default 3), `delay-seconds` (default 5). Bash loop: try the command, sleep, retry on failure, fail the step after max attempts with a summary annotation.
  4. Expand `docs/AGENT_PLAYBOOK.md` from skeleton: section *Two-strike safe-iteration policy* with the four-field escalation template (what-failed / what-attempted / evidence / suggested-next-step); section *Retry patterns* with the CLI retry loop and the composite-action reference; section *Rollback* with the `gh workflow run agent-rollback.yml -f sha=<sha>` command and what happens after.
  5. Hand-write `.github/workflows/deploy.yml` — `workflow_dispatch` only (no `pull_request` trigger). Single job with `environment: name: production` that pauses for the required reviewer. Inside the job: comment placeholder steps explaining that real deploys come from Vercel integration; this workflow exists to document the `environment` gate pattern.
  6. Add `docs/WORKFLOWS.md` — visual reference for every workflow currently in `.github/workflows/`. Two Mermaid diagrams: (a) trigger → workflow → outcome flowchart, (b) PR-lifecycle sequence diagram. Plus a per-workflow summary table (trigger, permissions, outputs, required-status?) and a composite-actions table. Diagrams render natively in GitHub's Markdown viewer. End with a maintenance note inside the doc itself.
  7. Add the same-PR maintenance rule to three other places so the obligation is discoverable from every relevant context: a *Documentation invariants* sub-section in `AGENTS.md` (top-level discoverability), the rules-summary in `.github/workflows/CLAUDE.md` (loaded path-scoped for Claude when editing workflows), and a *Documentation* section + anti-pattern bullet in `.github/instructions/workflows.instructions.md` (loaded path-scoped for Copilot when editing workflows).
- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, `agent-ci`).
  - [ ] `.github/workflows/agent-rollback.yml` parses and appears in the Actions tab under "Run workflow" dropdown.
  - [ ] `agent-rollback.yml` validates the SHA input as a hex regex before any shell command; rejects non-hex with an error annotation.
  - [ ] `agent-rollback.yml` passes the SHA into shell via `env:`, never via direct `${{ }}` interpolation.
  - [ ] `agent-rollback.yml` `permissions:` block contains only `contents: write` and `pull-requests: write`.
  - [ ] `.github/actions/retry-step/action.yml` is a valid composite action (testable by referencing it from a throwaway workflow step).
  - [ ] `docs/AGENT_PLAYBOOK.md` contains: *Two-strike escalation policy* with the verbatim four-field template; *Retry patterns* section; *Rollback* section with a working `gh workflow run` invocation.
  - [ ] `.github/workflows/deploy.yml` parses; triggers only on `workflow_dispatch` (no `pull_request`); references `environment: name: production`.
  - [ ] A manual `workflow_dispatch` run of `deploy.yml` from `main` pauses at the environment-approval gate.
  - [ ] `docs/WORKFLOWS.md` exists and renders both Mermaid diagrams cleanly when viewed on GitHub.
  - [ ] `docs/WORKFLOWS.md` covers every workflow currently in `.github/workflows/` (`plan-gate.yml`, `agent-ci.yml`, `claude.yml`, `claude-code-review.yml`, `preview-deploy.yml`, `agent-rollback.yml`, `deploy.yml`) plus the CodeQL Default Setup and the `retry-step` composite action.
  - [ ] `docs/WORKFLOWS.md` ends with a maintenance note stating the doc must be updated whenever a workflow is added, removed, or has its triggers/permissions changed.
  - [ ] `AGENTS.md` contains a *Documentation invariants* sub-section under Hard rules referencing the same rule.
  - [ ] `.github/workflows/CLAUDE.md` and `.github/instructions/workflows.instructions.md` both restate the rule (so it loads in path-scoped context when editing workflows).
  - [ ] `docs/WORKFLOWS.md` is agent-agnostic in its wording — references "agent mention" rather than hard-coding `@claude` (with a parenthetical noting the current trigger string).
  - [ ] No files modified outside the scope list above.
  - [ ] Third-party actions (if any) pinned to a full commit SHA; first-party (`actions/*`) may use `@v4`.
- **Risks + mitigations:**
  - *Risk:* `agent-rollback.yml` accepts a malicious SHA value that gets concatenated into a shell command → injection. *Mitigation:* hex regex validation BEFORE any shell use; SHA only ever passed via `env:`. Tested by triggering with `';rm -rf /;'` as input — should be rejected at the validation step.
  - *Risk:* the retry action silently hides real failures by retrying transient-looking errors that are actually bugs. *Mitigation:* default `max-attempts: 3`; final failure annotates the run with all three failure outputs (not just the last). Document in `AGENT_PLAYBOOK.md` when to use vs. not use retries.
  - *Risk:* `deploy.yml` could be repurposed later to actually deploy without preserving the environment gate. *Mitigation:* inline comment in the YAML explicitly says "this is a reference; do not add a `pull_request` trigger here without re-evaluating the environment gate."
  - *Risk:* Vercel's existing GitHub-integration auto-deploys conflict with `deploy.yml`. *Mitigation:* `deploy.yml` is `workflow_dispatch` only, never auto-fires; Vercel handles real deploys. The two coexist by design.
  - *Risk:* Rollback workflow creates a revert PR that itself fails `plan-gate` (no Plan section). *Mitigation:* the rollback workflow generates a PR body that includes a valid `## Plan (required)` block describing the revert (Goal = "revert commit X", Scope = file list from the original commit, Steps = "1. revert", etc.).
  - *Risk:* `docs/WORKFLOWS.md` falls out of date as workflows evolve, becoming misleading rather than helpful. *Mitigation:* explicit maintenance note inside the doc + a future-PR pattern of "if you touched `.github/workflows/`, also update `docs/WORKFLOWS.md` in the same PR." Optional follow-up: a CI check that fails when `.github/workflows/*` changes without `docs/WORKFLOWS.md` also changing — deferred to a later infra PR.
- **Rollback / escalation plan:**
  - Rollback: `git revert <merge-sha>` on a follow-up PR. Removing these workflows cleanly removes safe-execution tooling; the rest of the repo keeps working without them.
  - Escalation: add label `needs-human`, tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — L3 work, but each file is a well-known idiom (composite actions, workflow_dispatch, environments). Reviewer evaluates plan alongside the diff. If the rollback workflow's SHA-validation regex needs iteration, the implementer pauses and updates this plan before proceeding. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.