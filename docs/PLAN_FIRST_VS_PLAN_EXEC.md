# Plan-first vs Plan + Execution

Every agent task chooses one of two workflows. The choice is **when human validation happens relative to code execution**, not whether validation happens — that's always required by `plan-gate`, branch protection, and CODEOWNERS.

## Option A — Plan-first

1. Agent reads the issue and produces a plan only (no code).
2. Plan is posted to a PR description (or an issue comment, depending on tooling).
3. Human reviewer approves the plan.
4. Agent implements the plan in subsequent commits to the same PR (or a follow-up PR).
5. Standard checks + review gate the final merge.

**Use when:**
- The change is hard or impossible to reverse — production deploys, schema migrations, secrets, auth flows.
- The change touches L3/L4 paths per `AGENTS.md`: `.github/workflows/`, `.github/agents/`, `.github/hooks/`, `infra/`, `package.json` dependencies, `next.config.ts`.
- Multiple reasonable approaches exist and the wrong choice would create a lot of rework.
- The agent's confidence is low on any part of the task.

**Trade-off:** slower (an extra review round), but no wasted code is generated if the plan is rejected.

## Option B — Plan + Execution

1. Agent produces a plan **and** initial commits in the same PR.
2. Human reviewer evaluates plan + diff together.
3. Standard checks + review gate merge.

**Use when:**
- The change is reversible — a UI tweak, a content edit, a docs update, a styling pass.
- The change touches L0–L2 paths: `docs/`, `app/`, `components/`, `lib/`.
- The plan is short enough that reading it alongside the diff isn't wasteful.

**Trade-off:** faster, but if the plan is rejected, the agent's effort on the code is wasted and reviewer time is spent reading code that won't merge.

## Quick decision rubric

| Question | If yes → |
| --- | --- |
| Could a wrong implementation cause production outage or data loss? | Plan-first |
| Does this touch CI/secrets/auth/infra/dependencies? | Plan-first |
| Are there ≥2 reasonable approaches with different long-term consequences? | Plan-first |
| Otherwise | Plan + Execution |

## Both options share the same enforcement

- `plan-gate` workflow requires a `## Plan` section in the PR description regardless of which option you choose.
- Branch protection requires a review.
- Drift detection (PR 10) flags any file touched that isn't in the plan's *Scope* field.

The difference is only **when** the plan exists relative to the code, not whether it exists.
