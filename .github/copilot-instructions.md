# Copilot instructions

Read [`AGENTS.md`](../AGENTS.md) first — that's the full operating contract. This file is the always-loaded summary Copilot sees on every chat and task.

## How to work here

1. **Plan before code.** Every PR must include a `## Plan` section in the description (Goal, Scope, Steps, Success criteria, Risks, Rollback). The `plan-gate` workflow blocks merge if it's missing. If you're starting a task, produce the plan first and pause for review before editing.

2. **Make the minimum change.** Touch only the files the goal requires. No drive-by refactors, no speculative abstractions, no cleanup of unrelated code in the same PR. If you see something worth improving, leave a separate issue.

3. **Stay inside the task's scope.** The `agent-task` issue lists allowed paths in *Repository scope*. Anything outside that list will be flagged by the drift-check workflow.

4. **Surface assumptions in writing.** If the task requires an assumption the issue didn't state, put it in the PR body. If the assumption is load-bearing or risky, stop and ask in the issue before continuing.

5. **Verifiable success criteria.** Every success-criterion item must be checkable from the diff or from a workflow run. "Looks good" is not a criterion.

## Stack

- Next.js 16 (App Router) — pages in `app/`, layouts colocated.
- React + TypeScript — strict typing, no `any` without a written justification.
- Tailwind CSS v4 — utility classes only; no ad-hoc CSS files unless a token can't express the rule.
- pnpm — package manager. Never run `npm install` or `yarn add`.
- Vercel — hosting; preview per PR, production on `main`.

## Hard rules

- **Secrets never live in the repo.** Not in instructions, not in configs, not in workflow YAML, not in committed `.env` files.
- **Never push to `main` directly.** Branch + PR + review only.
- **Never edit `.github/workflows/**`, `.github/actions/**`, `.github/hooks/**`, `.github/agents/**`, `package.json`, `pnpm-lock.yaml`, or `next.config.ts`** without the `infra-change` label on the PR.
- **Artifacts uploaded by workflows must be named `<purpose>-${{ github.run_id }}-${{ github.sha }}`** so every artifact traces back to a run and a commit.

## Lessons

Rules extracted from agent postmortems in [`docs/agent-failures/`](../docs/agent-failures/). Each rule names a concrete trigger and a concrete behavior. When you hit the trigger, follow the rule.

- **When implementing a step where the plan authorises a judgement call on a path or file shape, update the plan's `Scope (paths/files)` block (and the PR-body Scope mirror) in the same commit as the deviation — not in a follow-up commit, and never after `drift-check` has flagged it** (see [docs/agent-failures/2026-05-22-update-scope-on-path-divergence.md](../docs/agent-failures/2026-05-22-update-scope-on-path-divergence.md)).

## When you're unsure

Ask in the issue or PR. Don't guess on architecture, on dependencies, or on whether something is in scope. A clarifying question is cheaper than a wrong PR.
