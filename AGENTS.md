# AGENTS.md

The operating contract for any agent (Copilot Coding Agent, Copilot CLI, Claude Code, future custom agents) working in this repository. Read this before doing anything else.

## Purpose

Most production code in this repo is written by agents, not humans. To keep delivery fast *and* safe, every agent must operate inside the boundaries below. These boundaries are enforced by:

- The PR template — every PR must include a Plan and Evidence.
- CODEOWNERS — high-risk paths require the owner's approval.
- Branch protection on `main` — no direct pushes, PRs only.
- CI status checks (added incrementally) — plan-gate, drift-check, eval, path-guard, etc.
- Hooks — pre-tool-use blocks for unsafe operations. Claude reads `.claude/settings.json`; Copilot reads `.github/hooks/`. Both ecosystems are configured in this repo; Claude is the active executor today.

If a rule below conflicts with what the user just said in chat, **ask before acting**. The user's intent wins, but only when stated explicitly for the current task.

---

## SDLC stage → artifact mapping

Each stage of the work has a designated surface where evidence lives. Don't move evidence around — reviewers and audits assume these locations.

| Stage | Where the agent contributes | Primary artifact |
| --- | --- | --- |
| Planning | Issue body, PR description | `agent-task` issue template, `## Plan` section in PR body |
| Implementation | Feature branch | Commits, branch named `agent/<topic>` or `chore/<topic>` |
| Validation | CI runs | Workflow run logs, uploaded artifacts (`logs-<run-id>-<sha>`), status checks |
| Deployment | Vercel + GitHub Environments | Preview deploy per PR; `production` environment with required approval |

---

## Risk-based autonomy levels

Every task is one of these levels. The level lives on the issue (dropdown in the `agent-task` template) and governs which controls apply.

| Level | Examples | Required controls |
| --- | --- | --- |
| **L0 — automated** | `docs/**`, top-level `*.md` files | Required checks pass; auto-merge allowed |
| **L1 — suggest only** | PR comments, review feedback | No code changes; agent posts comments and exits |
| **L2 — PR with 1 review** | `app/**`, `components/**`, `lib/**`, dependency bumps in `package.json` | PR + checks + 1 human review (default for app code) |
| **L3 — CODEOWNERS + multi-review** | `.github/workflows/**`, `.github/actions/**`, `.github/hooks/**`, `.github/agents/**`, `next.config.ts`, `pnpm-lock.yaml` | PR + checks + CODEOWNERS approval + `infra-change` label |
| **L4 — environment approval** | Production deploys, any path that touches secrets at runtime | PR-prepared change only; runtime execution requires environment reviewer approval |

If the agent isn't sure which level applies, treat the task as one level higher than the safest guess and ask in the issue.

---

## Working principles

These are non-negotiable for every commit, regardless of who authors it.

1. **Surgical changes.** Touch only the files needed for the stated goal. If a refactor would help, propose it as a separate issue — do not bundle.
2. **Plan before code.** Every PR has a `## Plan` section. The plan lists Goal, Scope (paths), Steps, Success criteria, Risks, Rollback. No edits without a plan.
3. **Surface assumptions.** When the task requires an assumption the issue didn't state, write the assumption in the PR body and proceed only if it's load-bearing-but-low-risk. Otherwise, stop and ask.
4. **Verifiable success criteria.** "Tests pass" is necessary but rarely sufficient. Each success criterion must be checkable by another person reading the diff — not opinion.
5. **No speculative abstraction.** Build for the case in front of you, not three hypothetical future cases. Generality is added when it's needed, not in anticipation.
6. **Stay in scope.** The issue's *Repository scope* field defines allowed paths. If the work needs to touch a path outside that list, stop and update the issue first.
7. **Match existing patterns.** Before introducing a new dependency, library, or pattern, search the repo for an existing one that solves the same problem.

---

## Anti-patterns

These have caused real failures in agent workflows. Don't do them.

- **Silent scope creep.** Touching files the issue didn't authorize because "while I'm here I noticed…"
- **Over-refactoring.** Rewriting working code to a personal preference during a feature task.
- **Phantom abstractions.** Wrapping a simple function in a class/interface/factory because it *might* need to be swapped one day.
- **Comment graffiti.** Adding `// TODO`, `// FIXME`, or `// HACK` without an associated issue.
- **Approving your own work.** When the agent produces a plan, the agent does not "approve" the plan; humans do.
- **Bypassing required checks.** If a check fails, fix the underlying issue. Don't change the check to make it pass.
- **Editing the rules to fit the diff.** Workflow files, instructions, and this document are not modified mid-task without a separate `infra-change`-labeled PR.

---

## Hard rules

These are blocked by hooks, workflows, or CODEOWNERS. The agent should treat them as inviolable.

### Secrets
- Never write secrets, tokens, or credentials into instruction files, committed configuration, workflow YAML in plain text, or anywhere else in the repo.
- Use environment-scoped secrets injected at runtime.
- If a secret needs to be added to support a feature, raise an `infra-change`-labeled issue first.

### Traceability of artifacts
- Every workflow artifact must be named with the run ID and commit SHA: `<purpose>-${{ github.run_id }}-${{ github.sha }}`. This lets any artifact be traced back to the run that produced it and the code it was produced against.
- PR comments that summarize a run must link both the run URL and the commit SHA.

### Permissions
- Default workflow permissions are `contents: read`. Any job that needs to write must declare the elevated scope explicitly and be reviewed.
- Avoid `GITHUB_TOKEN` write permissions unless absolutely required by the job.

### Branch hygiene
- Agent branches are named `agent/<short-topic>` or `chore/<short-topic>`.
- No force-push to `main`. (Branch protection enforces this for everyone except the bypass list.)

### Documentation invariants
- **`docs/WORKFLOWS.md` is the visual source of truth for every workflow in `.github/workflows/`.** Any PR that adds, removes, or modifies a workflow file (or changes its triggers, permissions, or outcomes) MUST update `docs/WORKFLOWS.md` in the same PR — including the relevant diagram and the per-workflow table row. Same-PR-or-it-rots. Reviewers should flag workflow-touching PRs that don't update this doc.
- Adding or removing a required status check in the `protect-main` ruleset also requires updating the "Required status checks" section of `docs/WORKFLOWS.md`.

---

## Failure handling (overview)

Full policy lives in `docs/AGENT_PLAYBOOK.md` (added in a later PR). Short version:

- **First failed check on a PR:** the agent may revise the branch and rerun once.
- **Second failure of the same check:** stop. Post a comment with: (1) what failed, (2) what was attempted, (3) evidence links, (4) suggested next step. Add label `needs-human`.
- **Production breakage after merge:** run the rollback workflow (`agent-rollback.yml`) with the merge commit SHA. Escalate via the `needs-human` label.

---

## How to use this file

- Read it once when joining the repo.
- Re-read the relevant section when the task touches that area (e.g., re-read "Hard rules — Secrets" before any task involving credentials).
- If a rule here ever conflicts with a newer file (`.github/copilot-instructions.md`, a `.instructions.md`, an agent's own definition), this file wins unless the newer file explicitly says it overrides this one.
