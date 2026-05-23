# Workflows reference

Visual map of every GitHub Actions workflow in this repo. Use this to understand what fires when, what gates merges, and how the agentic SDLC fits together.

If you're new to the repo, start with the "At a glance" flowchart, then read the per-workflow table for the specific workflow you care about.

## At a glance — triggers → workflows → outcomes

```mermaid
flowchart LR
    %% Triggers
    PR_OPEN([PR opened / synced / ready])
    PR_BODY_EDIT([PR description edited])
    COMMENT([Issue or PR comment])
    DISPATCH([workflow_dispatch / manual])
    DEPENDABOT([Dependabot push])
    VERCEL_DEPLOY_SUCCESS([Vercel preview live])
    LABEL_MULTI_AGENT([Issue labelled multi-agent])
    CHECK_SUITE_DONE([check_suite completed])

    %% Workflows
    PLAN_GATE[plan-gate.yml]
    ARTIFACT_CHECK[agent-artifact-check.yml]
    DRIFT[drift-check.yml]
    CONFLICT[conflict-detect.yml]
    PATH_GUARD[path-guard.yml]
    LEAST_PRIV[least-privilege.yml]
    AUTOMERGE[automerge.yml]
    EVAL[eval.yml]
    AGENT_CI[agent-ci.yml]
    CLAUDE[claude.yml]
    MULTI_AGENT[multi-agent.yml]
    CLAUDE_REVIEW[claude-code-review.yml]
    PREVIEW[preview-deploy.yml]
    ROLLBACK[agent-rollback.yml]
    DEPLOY[deploy.yml]
    CODEQL[CodeQL Default Setup<br/>no committed file]

    %% Outputs
    REQUIRED_CHECK{{Required status check}}
    REQUIRED_CHECK_PATHGUARD{{Required: path-guard<br/>post-merge promotion}}
    INFO_CHECK[Informational status check]
    PR_COMMENT[/PR comment/]
    LABEL_DRIFT[/agent-drift label/]
    LABEL_CONFLICT[/agent-conflict label/]
    ARTIFACT[/Workflow artifact<br/>logs-RUN-SHA/]
    ARTIFACT_EVAL[/Workflow artifact<br/>eval-RUN-SHA/]
    BOT_PR[/Bot creates branch + PR/]
    PR_REVIEW_COMMENT[/A11y review comment/]
    VERCEL_PREVIEW[/Vercel preview URL/]
    PROD_DEPLOY[/Production deploy<br/>via env gate/]
    REVERT_PR[/Revert PR/]
    MERGE[/Auto-merge queued<br/>fires when required checks pass/]

    %% Edges
    PR_OPEN --> PLAN_GATE --> REQUIRED_CHECK
    PR_BODY_EDIT --> PLAN_GATE
    DEPENDABOT -.exempt.-> PLAN_GATE

    PR_OPEN --> ARTIFACT_CHECK --> INFO_CHECK
    PR_BODY_EDIT --> ARTIFACT_CHECK
    DEPENDABOT -.exempt.-> ARTIFACT_CHECK

    PR_OPEN --> DRIFT
    PR_BODY_EDIT --> DRIFT
    DEPENDABOT -.exempt.-> DRIFT
    DRIFT --> INFO_CHECK
    DRIFT --> PR_COMMENT
    DRIFT --> LABEL_DRIFT

    PR_OPEN --> CONFLICT
    DEPENDABOT -.exempt.-> CONFLICT
    CONFLICT --> PR_COMMENT
    CONFLICT --> LABEL_CONFLICT

    PR_OPEN -->|agent-shaped PR| PATH_GUARD
    DEPENDABOT -.exempt.-> PATH_GUARD
    PATH_GUARD -->|today| INFO_CHECK
    PATH_GUARD -.->|after post-merge<br/>ruleset UI promotion| REQUIRED_CHECK_PATHGUARD

    PR_OPEN -->|workflow files changed| LEAST_PRIV
    DEPENDABOT -.exempt.-> LEAST_PRIV
    LEAST_PRIV --> PR_COMMENT

    PR_OPEN -->|labels: automerge-ok + agent-task| AUTOMERGE
    CHECK_SUITE_DONE --> AUTOMERGE
    DEPENDABOT -.exempt.-> AUTOMERGE
    AUTOMERGE --> MERGE

    VERCEL_DEPLOY_SUCCESS --> EVAL
    DISPATCH --> EVAL
    DEPENDABOT -.exempt.-> EVAL
    EVAL --> PR_COMMENT
    EVAL --> ARTIFACT_EVAL

    PR_OPEN --> AGENT_CI
    AGENT_CI --> INFO_CHECK
    AGENT_CI --> PR_COMMENT
    AGENT_CI --> ARTIFACT

    PR_OPEN --> CLAUDE_REVIEW --> PR_COMMENT
    PR_OPEN --> CODEQL --> INFO_CHECK

    COMMENT -->|contains agent mention| CLAUDE
    CLAUDE --> BOT_PR
    CLAUDE --> PR_COMMENT

    LABEL_MULTI_AGENT --> MULTI_AGENT
    DISPATCH --> MULTI_AGENT
    MULTI_AGENT --> BOT_PR
    MULTI_AGENT --> PR_REVIEW_COMMENT

    DISPATCH --> PREVIEW --> VERCEL_PREVIEW
    DISPATCH --> ROLLBACK --> REVERT_PR
    DISPATCH --> DEPLOY
    DEPLOY -->|environment gate<br/>requires reviewer| PROD_DEPLOY

    classDef trigger fill:#fff3c4,stroke:#a47900,color:#333
    classDef workflow fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a
    classDef output fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef gate fill:#fee2e2,stroke:#dc2626,color:#7f1d1d

    class PR_OPEN,PR_BODY_EDIT,COMMENT,DISPATCH,DEPENDABOT,VERCEL_DEPLOY_SUCCESS,LABEL_MULTI_AGENT,CHECK_SUITE_DONE trigger
    class PLAN_GATE,ARTIFACT_CHECK,DRIFT,CONFLICT,PATH_GUARD,LEAST_PRIV,AUTOMERGE,EVAL,AGENT_CI,CLAUDE,MULTI_AGENT,CLAUDE_REVIEW,PREVIEW,ROLLBACK,DEPLOY,CODEQL workflow
    class PR_COMMENT,LABEL_DRIFT,LABEL_CONFLICT,ARTIFACT,ARTIFACT_EVAL,BOT_PR,PR_REVIEW_COMMENT,VERCEL_PREVIEW,PROD_DEPLOY,REVERT_PR,INFO_CHECK,MERGE output
    class REQUIRED_CHECK,REQUIRED_CHECK_PATHGUARD gate
```

## A typical PR's lifecycle

The sequence below describes the happy-path flow when a developer (or `@claude`/`@copilot`) opens a PR against `main`.

```mermaid
sequenceDiagram
    actor Dev as Developer (or agent)
    participant GH as GitHub
    participant Gate as plan-gate.yml
    participant Artifact as agent-artifact-check.yml
    participant Drift as drift-check.yml
    participant Conflict as conflict-detect.yml
    participant PathGuard as path-guard.yml
    participant CI as agent-ci.yml
    participant Review as claude-code-review.yml
    participant CodeQL as CodeQL
    participant Vercel as Vercel integration
    participant Human as Human reviewer

    Dev->>GH: Open PR (branch feat/...)

    par Gate runs
        GH->>Gate: trigger
        Gate-->>GH: required check ✓ (Plan present + non-empty)
    and Artifact check runs
        GH->>Artifact: trigger
        Artifact-->>GH: info check ✓ (plan.md present, OR skipped for non-agent PR)
    and Drift check runs
        GH->>Drift: trigger
        Drift-->>GH: info comment (+ `agent-drift` label if changes touch paths outside Scope)
    and Conflict check runs
        GH->>Conflict: trigger
        Conflict-->>GH: info comment (+ `agent-conflict` label if files overlap with another open PR)
    and Path guard runs (agent-shaped PRs only)
        GH->>PathGuard: trigger
        PathGuard-->>GH: passes (no protected paths touched, OR `infra-change` label present); fails the run otherwise. Promotion to required status check is a post-merge UI step in the `protect-main` ruleset.
    and CI runs
        GH->>CI: trigger
        CI->>CI: lint, typecheck, build
        CI-->>GH: status checks + artifact + PR comment
    and Review posts
        GH->>Review: trigger
        Review-->>GH: review comments (if findings)
    and Security scans
        GH->>CodeQL: trigger
        CodeQL-->>GH: code-scanning alerts (if any)
    and Preview deploys
        GH->>Vercel: webhook
        Vercel-->>GH: preview URL comment
    end

    Dev->>GH: Push fix (if needed)
    GH->>Gate: re-run on edited body or new commits
    GH->>CI: re-run on synchronize

    Human->>GH: Review + approve
    Human->>GH: Merge (with `infra-change` label if touching .github/workflows/)
    GH->>Vercel: deploy to production (Vercel handles, not deploy.yml)
```

### Multi-agent run on a labelled issue

A second flow, fired when a human labels an issue `multi-agent`. Three sequential jobs in one workflow run: implementer opens a PR, reviewer comments on it, handoff-log commits the audit-trail entry to the same branch.

```mermaid
sequenceDiagram
    actor Human
    participant GH as GitHub
    participant MA as multi-agent.yml
    participant Impl as implementer subagent
    participant Rev as a11y-reviewer subagent
    participant Log as handoff-log job

    Human->>GH: Label issue `multi-agent`
    GH->>MA: trigger (issues.labeled)
    MA->>Impl: job 1 (Claude Code Action)
    Impl-->>GH: branch `multi-agent/<n>` + open PR
    MA-->>MA: capture pr_number via gh pr list --head (retry ~30s)
    MA->>Rev: job 2 (gated on pr_number != "")
    Rev-->>GH: review comment with marker `<!-- multi-agent:a11y-review -->`
    MA->>Log: job 3 (if: always() && pr_number != "")
    Log-->>GH: commit `docs/handoffs/<date>-<n>-<slug>.md` to the same branch
    Note over Log,GH: Push uses GITHUB_TOKEN — by design does NOT retrigger CI on the PR
```

## Workflow-by-workflow

| Workflow | Trigger | Permissions | What it produces | Required check? |
| --- | --- | --- | --- | --- |
| `plan-gate.yml` | PR `opened`, `edited`, `synchronize`, `reopened`, `ready_for_review` (excludes `dependabot[bot]` via `if:`) | `contents: read`, `pull-requests: read` | Status check validating the `## Plan (required)` section exists with non-empty Goal + at least one Step | ✅ Required (configured in `protect-main` ruleset) |
| `agent-artifact-check.yml` | PR `opened`, `synchronize`, `reopened`, `ready_for_review`, `edited`, `labeled`, `unlabeled` + `workflow_dispatch` (manual re-check with `pr_number` input). Skips for `dependabot[bot]` and for PRs that are neither on a `claude/**`/`agent/**` branch nor labeled `agent-task`. | `contents: read`, `pull-requests: read` | Informational status check verifying an agent-shaped PR adds or references a `docs/agent-tasks/<task-id>/plan.md` file (see `docs/MEMORY_POLICY.md`) | Informational on day one — promote to required only after a few green runs on real agent PRs |
| `drift-check.yml` | PR `opened`, `synchronize`, `reopened`, `ready_for_review`, `edited` + `workflow_dispatch` (manual re-check with `pr_number` input). Skips for `dependabot[bot]`. | Read-only `check` job: `contents: read`, `pull-requests: read`. Write-elevated `report` job: `contents: read`, `pull-requests: write`, `issues: write` (the labels API lives under issues). | Find-or-update PR comment listing files touched outside the plan's `- **Scope (paths/files):**` block; toggles the `agent-drift` label. Always exits 0. | Informational on day one — never fails the run; promote to required only after a few real PRs show the signal is reliable |
| `conflict-detect.yml` | PR `opened`, `synchronize`, `reopened`, `ready_for_review` + `workflow_dispatch` (manual re-check with `pr_number` input). Skips for `dependabot[bot]`. Concurrency group keyed on PR number with `cancel-in-progress: true`; `timeout-minutes: 5`. | Read-only `check` job: `contents: read`, `pull-requests: read`. Write-elevated `report` job: `contents: read`, `pull-requests: write`, `issues: write`. | Find-or-update PR comment with marker `<!-- conflict-detect:summary -->` listing other open PRs that touch shared files; toggles the `agent-conflict` label. Always exits 0. | Informational on day one — never fails the run; promote to required only after the signal proves reliable on a few real PRs |
| `path-guard.yml` | PR `opened`, `synchronize`, `reopened`, `ready_for_review`, `labeled`, `unlabeled` (label events flip the gate decision) + `workflow_dispatch` with `pr_number` input. Skips for `dependabot[bot]` and for non-agent-shaped PRs (branch not `claude/**` or `agent/**` AND no `agent-task` label — detector copied from `agent-artifact-check.yml`). Concurrency-keyed by PR number with `cancel-in-progress: true`. | `contents: read`, `pull-requests: read` (no write scopes). | Status check that **fails the run** when an agent-shaped PR touches a path in the protected-globs list (`.github/workflows/**`, `.github/actions/**`, `.github/hooks/**`, `.github/agents/**`, `.github/aw/**`, `next.config.ts`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `tailwind.config.ts`) without carrying the `infra-change` label. Failure message names every offending path. | Informational on day one (workflow added but not yet wired in the ruleset). **Promoted to required as a manual UI step in the `protect-main` ruleset AFTER this PR merges** — see "Required status checks" below. |
| `least-privilege.yml` | PR `opened`, `synchronize`, `reopened`, `ready_for_review` filtered to `paths: ['.github/workflows/**', '.github/actions/**']` + `workflow_dispatch` (optional `pr_number` for comment target). Skips for `dependabot[bot]`. Concurrency-keyed by PR number with `cancel-in-progress: true`. | Workflow baseline `contents: read`. Lint job elevates to `contents: read`, `pull-requests: write` (per-job — needed to post the summary comment). | Lints every `.github/workflows/*.yml` for: (1) top-level `permissions:` exists; (2) top-level `permissions.contents` is not `write`; (3) any job with `contents: write` has an `if:` gate. Findings posted as `::warning` annotations and as a find-or-update PR comment with marker `<!-- least-privilege:summary -->`. Always exits 0 (soft rollout). | Informational — never blocks merge. Escalation trigger documented in [`docs/agent-tasks/16-governance-capstone/plan.md`](agent-tasks/16-governance-capstone/plan.md): if the inline script grows past ~60 lines, extract to `scripts/lint-workflow-permissions.ts` with `node:test` cases. |
| `automerge.yml` | PR `opened`, `synchronize`, `reopened`, `ready_for_review`, `labeled` + `check_suite: types: [completed]` (PR is resolved from `head_sha` via `gh api`). Skips for `dependabot[bot]`, closed/draft PRs, and PRs missing either of the required labels. Concurrency-keyed by PR number / head sha with `cancel-in-progress: true`. | Workflow baseline `contents: read`. `automerge` job elevates to `contents: write`, `pull-requests: write` (per-job — required by `gh pr merge --auto`). | Calls `gh pr merge "$PR_NUMBER" --auto --squash --delete-branch` **only when** the PR carries both `automerge-ok` AND `agent-task` labels AND every changed file matches `docs/**` OR is a top-level `*.md` other than `README.md` / `CLAUDE.md` / `AGENTS.md`. `--auto` queues the merge; GitHub fires it once required status checks pass under branch protection. Non-eligible PRs exit 0 silently with a `::notice`. | n/a (not a status check) — eligibility is strict and opt-in; the queued merge still respects every required status check in branch protection, so this workflow cannot bypass the gate. |
| `eval.yml` | `deployment_status` events where `deployment.environment == 'Preview'` and `state == 'success'` (i.e. the Vercel preview is live), plus `workflow_dispatch` with a `pr_number` input for manual re-runs / backfills. Skips for Dependabot PRs (author lookup), for production deployment_status events, and for non-success states. | Workflow baseline `contents: read`. `resolve` job adds `pull-requests: read` for PR/deployment lookups. `summary` job elevates to `pull-requests: write` only — comment-write scope is per-job, not workflow-wide. | Find-or-update PR comment with marker `<!-- eval:scorecard -->` containing the four-tool scorecard table (Lighthouse, axe-core, lychee, type-coverage). Consolidated artifact `eval-<run-id>-<sha>` (90-day retention) bundling `lighthouseci/`, `axe.json`, `lychee.json`, `type-coverage.txt`; per-tool intermediates `eval-<tool>-<run-id>-<sha>` (14-day retention) re-uploaded into the consolidated artifact by the summary job. Always exits 0. | Informational — thresholds, the qual fidelity checklist, and the promotion path documented in [`EVAL.md`](EVAL.md) |
| `agent-ci.yml` | PR `opened` / `synchronize` on `agent/**` and `feat/**` branches | `contents: read`, `pull-requests: write` | Lint, typecheck, build status checks; PR comment summary; uploaded artifact named `logs-<run-id>-<sha>` | Informational (could be made required via ruleset) |
| `claude.yml` | Agent mention (currently the trigger string is `@claude`) in issue body/title, issue comment, PR comment, or PR review | `contents: write`, `pull-requests: write`, `issues: write`, `id-token: write`, `actions: read` | Agent runs the requested task in a runner; commits to a branch; opens/updates a PR; posts a status comment on the originating issue/PR | n/a (not a status check) |
| `multi-agent.yml` | `issues.labeled` gated on `github.event.label.name == 'multi-agent'`; plus `workflow_dispatch` with integer-validated `issue_number` input for re-runs | Workflow baseline `contents: read`. `implementer` job elevates to `contents: write`, `pull-requests: write`, `issues: write`, `id-token: write`, `actions: read`. `a11y-reviewer` job uses `contents: read`, `pull-requests: write`, `issues: read` (read-only on disk; write only for the review comment). `handoff-log` job uses `contents: write`, `pull-requests: read`, `issues: read` to commit the audit-trail file. Concurrency-keyed by issue number with `cancel-in-progress: true` to bound Anthropic credit burn. | Branch `multi-agent/<issue-number>` + PR opened by the implementer subagent; a single find-or-update PR review comment with marker `<!-- multi-agent:a11y-review -->`; a committed `docs/handoffs/<date>-<issue>-<slug>.md` entry on the same branch (push by `GITHUB_TOKEN` — by design does not retrigger CI on the PR). | n/a (not a status check) |
| `claude-code-review.yml` | PR `opened`, `synchronize`, `reopened`, `ready_for_review` | `contents: read`, `pull-requests: read`, `issues: read`, `id-token: write` | Posts review comments from the official `code-review` plugin | Informational (review comments) |
| `preview-deploy.yml` | `workflow_dispatch` only | least-privilege per step | Manually-triggered Vercel preview deploy. Real previews come from the Vercel GitHub integration; this workflow exists as a documented reference shape. | n/a |
| `agent-rollback.yml` | `workflow_dispatch` only — inputs: `sha` (40-char hex, validated), `reason` (string) | `contents: write`, `pull-requests: write` (per-job; baseline is `contents: read`) | Creates `revert/<short-sha>` branch + revert commit + PR with a Plan section so it can pass `plan-gate` on the way back in | n/a |
| `deploy.yml` | `workflow_dispatch` only, scoped to `main` (no `pull_request`) | least-privilege; the deploy job uses `environment: name: production` | Reference deploy workflow that pauses at the required-reviewer gate. Real production deploys are handled by the Vercel integration; this exists to document the `environment` gate pattern for future workflows that genuinely need it (migrations, secret rotation). | n/a |
| **CodeQL Default Setup** | Auto-managed by GitHub; runs on PR + push to `main` | platform-managed | Security alerts under the Security tab; informational status check on PRs | Informational (not added to required-status-checks list — see `docs/AGENT_PLAYBOOK.md` for the rationale on keeping this informational rather than blocking) |

## Composite actions and shared files

| File | Used by | Purpose |
| --- | --- | --- |
| `.github/actions/retry-step/action.yml` | Any workflow wrapping a transient command (network call, npm install, etc.) | Bash retry loop with configurable `max-attempts` (default 3) and `delay-seconds` (default 5). Surfaces all attempts' output on final failure so transient-looking but real bugs aren't silently hidden. |
| `.github/workflows/CLAUDE.md` | Loaded automatically by Claude Code when editing any file under `.github/workflows/` | Path-scoped rules for editing workflow files (least-privilege permissions, defensive triggers, action pinning, command-injection safety, artifact naming). Not a workflow itself. |

### Dormant configurations

| File | Purpose | Why dormant |
| --- | --- | --- |
| `.github/workflows/daily-repo-status.md` | GitHub Agentic Workflow (gh-aw) source for a daily 24h activity digest. Would, on activation, open one issue per day with title prefix `[repo-status] ` and label `report`. | gh-aw is not installed in this repo and no GitHub Copilot license is active, so nothing compiles the `.md` into the sibling `.lock.yml` that Actions would run. The `.md` extension alone is invisible to the runner. Frontmatter shape, threat model, and activation steps live in [`docs/COPILOT_STUDY/agentic-workflows.md`](COPILOT_STUDY/agentic-workflows.md). Not in the flowchart or sequence diagram above on purpose — adding a phantom node for a workflow that does not fire would mislead readers. |
| `.github/workflows/cli-agent-task.yml` | Manually-dispatched workflow showing how the Copilot CLI (`npx @github/copilot-cli`) can be invoked from a CI runner to action a GitHub issue. Takes an `issue` input, validates it, and would call the CLI with `--no-ask-user` to produce a branch + PR. | No GitHub Copilot license is active in this repo, so the step short-circuits with a `::notice` annotation rather than running the CLI. File exists as a syntactic reference for the CLI invocation pattern; the active equivalent is the `@claude` mention trigger in `claude.yml`. Activation context, token semantics, and a comparison to `@claude` are in [`docs/COPILOT_STUDY/cli-in-workflow.md`](COPILOT_STUDY/cli-in-workflow.md). Not in the flowchart — it does not fire in CI. |
| `.github/agents/implementer.agent.md` | Dormant Copilot custom-agent profile — parity reference for the active Claude subagent at `.claude/agents/implementer.md`. Surgical implementation persona scoped to `app/**`, `components/**`, `lib/**`. | Copilot is configured as a dormant alternative in this repo (no license active), so no Copilot runtime loads the file. Written against the canonical gh custom-agent schema (https://docs.github.com/en/copilot/reference/custom-agents-configuration) verified 2026-05-23 — see DORMANT header. Context lives in [`docs/COPILOT_STUDY/org-custom-agents.md`](COPILOT_STUDY/org-custom-agents.md). |
| `.github/agents/planner.agent.md` | Dormant Copilot custom-agent profile — parity reference for `.claude/agents/planner.md`. Read-only planning persona; `tools: [read, search, web]` excludes `edit` and `execute`. Renamed and schema-migrated from the older `plan.agent.md` in PR 14. | Same as above — Copilot license dormant. Canonical schema, dated header. Context in [`docs/COPILOT_STUDY/org-custom-agents.md`](COPILOT_STUDY/org-custom-agents.md). |
| `.github/agents/a11y-reviewer.agent.md` | Dormant Copilot custom-agent profile — parity reference for `.claude/agents/a11y-reviewer.md`. Read-only a11y-review persona; `tools: [read, search]` excludes `edit` and `execute` by design. | Same as above — Copilot license dormant. The read-only tool-list constraint mirrors the workflow's job-level permissions (defence in depth). Context in [`docs/COPILOT_STUDY/org-custom-agents.md`](COPILOT_STUDY/org-custom-agents.md). |

### External scheduled agents

| Where it runs | Purpose | Snapshot in this repo |
| --- | --- | --- |
| Claude Code Routine (Claude web UI at <https://claude.ai/code>) | Daily 24h activity digest — same job as the dormant gh-aw source above. Opens one issue per day with title prefix `[repo-status] ` and label `report`. | [`docs/CLAUDE_ROUTINES/daily-repo-status.md`](CLAUDE_ROUTINES/daily-repo-status.md). The routine's source of truth is the web UI, not this repo; the snapshot doc records what is configured so reviewers can see the full set of scheduled agents touching this codebase without leaving the repo. |

## Plan-gate exemption — why Dependabot is special

`plan-gate.yml` skips its job when `github.actor == 'dependabot[bot]'`. Reason: Dependabot's PRs use a structured changelog format (security advisory, version diff, compatibility score) that IS the plan in spirit but doesn't match the `## Plan (required)` shape. Forcing Dependabot through the gate would block every dependency update; exempting it lets the security-update pipeline flow.

The exemption is narrow on purpose: `dependabot[bot]` only, not `*[bot]`. Any other bot we add must either fit the Plan format or get its own explicit exemption.

`agent-artifact-check.yml` mirrors the same Dependabot exemption (and adds a second skip for human PRs that aren't agent-shaped) — same reasoning: Dependabot's PRs don't need a `docs/agent-tasks/<task-id>/plan.md` because they're not agent-authored tasks. See `docs/MEMORY_POLICY.md` for the artifact requirement itself.

`drift-check.yml` also exempts `dependabot[bot]` — its PRs ship a structured changelog, not a plan with a `Scope (paths/files)` block, so there's nothing to drift-check against. The workflow is **soft-rolled-out**: it posts an informational comment and (if drift is detected) applies the `agent-drift` label, but never fails the run. Promote to a required status check only after a few real agent PRs show the signal is reliable.

`conflict-detect.yml` exempts `dependabot[bot]` as well — overlap on `package.json` and lockfiles is the rule for dep-bump PRs, not the exception, so the signal would be noise. Same soft-rollout posture as drift-check: find-or-update PR comment + `agent-conflict` label toggle, never a failing status. Other open PR titles and branch names are sanitised inline (pipe + newline strip) before being placed into the Markdown summary table, so a hostile PR title can't break the table layout.

`eval.yml` exempts Dependabot too — and because it fires on `deployment_status` (where `github.actor` is `vercel[bot]`, not the PR author), the exemption is checked against the *PR author* after the workflow resolves the PR number from the deployment SHA. Reasoning is economy plus signal: a dep-bump preview rarely moves Lighthouse, axe, or link-check numbers, and running the four-job scorecard on every Renovate-style PR would burn ~8 CI minutes per bump for no useful diff. Soft-rolled-out like `drift-check.yml` — scorecard comment + `eval-<run-id>-<sha>` artifact, never a failing status check. See [`docs/EVAL.md`](EVAL.md) for thresholds and the promotion path.

See the inline comment in `.github/workflows/plan-gate.yml` for the canonical justification.

## Required status checks (current branch protection)

Configured in the `protect-main` ruleset at the org level:

- ✅ `plan-gate / Plan present and filled`

**Pending UI promotion** (workflow exists in the repo but is NOT yet wired as a required check):

- `path-guard / Protected paths require infra-change label` — promoted to required as a **manual UI change in the `protect-main` ruleset AFTER PR 16 merges**. Until promoted, a failing `path-guard` run does not block merge; reviewers should still treat a failure as a hard veto. When promoting, enable the ruleset's "Skip if not run" option so PRs from `dependabot[bot]` (which the workflow skips for) don't stall waiting for a check that never reports — see the rationale in `docs/agent-tasks/16-governance-capstone/plan.md` Risks.

Informational checks (run on every PR but don't block merge):

- `agent-ci / lint`, `agent-ci / typecheck`, `agent-ci / build`, `agent-ci / PR summary`
- `Claude Code Review / claude-review`
- `Code scanning results / CodeQL`
- `CodeQL / Analyze (actions)`, `CodeQL / Analyze (javascript-typescript)`
- `least-privilege / Lint workflow permissions` (no plan to promote — soft lint of workflow files)

Promoting any informational check to required is a UI change in the ruleset, not a code change.

## Maintenance

**This doc must be updated in the same PR that adds, removes, or modifies any workflow.** Specifically:

- Adding a workflow file → add a row to the per-workflow table, add nodes to the flowchart, and update the sequence diagram if the new workflow fires on PR events.
- Removing a workflow → delete from both diagrams and the table.
- Changing a workflow's triggers, permissions, or outcomes → reflect the change here.
- Adding or removing a required status check → update the "Required status checks" section.

This is part of the L3 hygiene from `.github/instructions/workflows.instructions.md`. The PR-template's "Scope" field should include `docs/WORKFLOWS.md` whenever workflows change.

If the diagrams drift far from reality, that's a sign the doc isn't being maintained — at that point, prefer regenerating both diagrams from the actual workflow files rather than patching the stale version.

## Documentation invariants — audit map

**Any PR that introduces a new artifact type — a new workflow, a new study guide, a new handoff format, a new postmortem schema, a new hook kind, a new MCP source, anything that produces output a future reader will need to locate — MUST update [`docs/AUDIT.md`](AUDIT.md) in the same PR.**

Same-PR-or-it-rots: an artifact added without an `AUDIT.md` entry is invisible to anyone who didn't author it. Reviewers should flag PRs that introduce new artifact types without an `AUDIT.md` update, the same way they flag workflow PRs that don't touch this file.

Mirrored in [`AGENTS.md`](../AGENTS.md) "Documentation invariants" so the rule applies regardless of which agent is editing.
