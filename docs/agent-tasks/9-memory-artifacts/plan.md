# Plan: PR 9 — Durable agent memory artifacts

> Issue: N/A (self-implemented infra; no tracking issue)
> Branch: `feat/memory-artifacts`

- **Goal:** Make agent-authored PRs traceable to a durable `plan.md` by enforcing the `docs/agent-tasks/<task-id>/plan.md` convention via CI, and document the memory tiers that govern how those artifacts evolve.

- **Scope (paths/files):**
  - `docs/agent-tasks/9-memory-artifacts/plan.md` (this file)
  - `docs/MEMORY_POLICY.md` (new)
  - `.github/workflows/agent-artifact-check.yml` (new)
  - `docs/WORKFLOWS.md` (update: per-workflow table row + flowchart node)
  - `docs/AGENT_PLAYBOOK.md` (optional cross-reference to MEMORY_POLICY)

- **Steps:**
  1. Add this plan file under `docs/agent-tasks/9-memory-artifacts/plan.md`.
  2. Add `docs/MEMORY_POLICY.md` documenting short-term (PR description), long-term (`decisions.md`, retained), and external (linked artifacts) memory tiers, plus the pruning rule for `memory.md` when a task closes.
  3. Add `.github/workflows/agent-artifact-check.yml` — fails a PR if the author is agent-shaped (branch matches `claude/**` or `agent/**`, OR the PR carries the `agent-task` label) and the PR neither adds/modifies a `docs/agent-tasks/<task-id>/plan.md` file nor references one in its body. Exempts `dependabot[bot]`. Least-privilege permissions; `workflow_dispatch` re-run supported.
  4. Update `docs/WORKFLOWS.md` (per-workflow table row, flowchart node, sequence diagram if it fires on PR events) to reflect the new workflow.
  5. Cross-reference `MEMORY_POLICY.md` from `docs/AGENT_PLAYBOOK.md` (one-line link under a new "Memory" section heading).

- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, `agent-ci`).
  - [ ] `agent-artifact-check.yml` validates as well-formed YAML and is documented in `docs/WORKFLOWS.md`.
  - [ ] An agent-shaped PR (branch `claude/**` / `agent/**` or `agent-task`-labeled) without a `docs/agent-tasks/<task-id>/plan.md` fails the new check.
  - [ ] A Dependabot PR is skipped by the new check (no failure).
  - [ ] A non-agent PR (no agent branch, no `agent-task` label) is skipped by the new check.
  - [ ] `docs/MEMORY_POLICY.md` exists and is linked from `docs/AGENT_PLAYBOOK.md`.

- **Risks + mitigations:**
  - *Risk:* The "agent-shaped PR" detector is wrong — false positives block legitimate human PRs; false negatives let agent PRs slip the check.
    *Mitigation:* Detector is narrow (branch glob + explicit label only). Workflow stays informational (not promoted to required status check) until it's been green on a few real agent PRs.
  - *Risk:* `docs/WORKFLOWS.md` drifts from the workflow's actual triggers/permissions.
    *Mitigation:* Same-PR update is mandatory per AGENTS.md "Documentation invariants". Reviewer checks the table row matches the YAML.
  - *Risk:* `<task-id>` naming convention isn't enforceable from CI (the workflow can't know what task-id an agent should use).
    *Mitigation:* MEMORY_POLICY documents the convention (`<issue-number>-<slug>`). The check only requires *some* `docs/agent-tasks/*/plan.md` is added or referenced; the reviewer judges whether the task-id is well-formed.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="PR 9 artifact-check workflow blocked legitimate PRs"`
  - Soft rollback: delete `agent-artifact-check.yml` in a follow-up PR (the check is informational on day one).
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — change is reversible (workflow can be deleted), no production traffic affected, and reviewing the workflow YAML alongside this plan is cheaper than two review rounds. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.