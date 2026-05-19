---
name: plan-feature
description: Produce a structured implementation plan for a feature or task in this repo. Read-only — never edits files. Output is the Plan section for a PR and (when starting a task) the durable docs/agent-tasks/<task-id>/plan.md artifact.
---

# Plan a feature

Invoked when the user wants a plan before any code is written.

## Required reading

Before producing the plan, read:

1. The user's task description (often the body of an `agent-task` issue, or pasted in chat).
2. [AGENTS.md](../../../AGENTS.md) — operating contract, especially the risk-based autonomy table and the hard rules.
3. [CLAUDE.md](../../../CLAUDE.md) — Claude-specific notes.
4. Any path-scoped `CLAUDE.md` files in directories the task will touch (e.g., `app/CLAUDE.md` once it exists).
5. [docs/PLAN_FIRST_VS_PLAN_EXEC.md](../../../docs/PLAN_FIRST_VS_PLAN_EXEC.md) — to decide which workflow to recommend.

## Output schema

Return a single Markdown block in this exact shape:

```md
## Goal
<one sentence>

## Scope (paths/files)
- <path 1>
- <path 2>

## Steps
1. <action>
2. <action>
3. <action>

## Success criteria (verifiable)
- [ ] Required CI checks pass (lint, typecheck, build, plan-gate, eval, drift, path-guard)
- [ ] <feature-specific criterion>

## Risks + mitigations
- Risk: <…>
  Mitigation: <…>

## Rollback / escalation plan
- Rollback: <concrete command or steps>
- Escalation: label `needs-human`, tag @mafaq229

## Autonomy level
L<n> per AGENTS.md

## Workflow choice
Plan-first | Plan + Execution — with one-line reason
```

## Output discipline

- **Do not edit files.** This skill is read-only. If the user asks for edits inside the same turn, deliver the plan and ask whether to switch to implementation.
- **Surface every assumption.** Any assumption the issue didn't state goes in *Risks*. If the assumption is load-bearing, ask before drafting.
- **Specific scope only.** Glob patterns are fine; "various files" is not.
- **Each success criterion must be verifiable** from the diff or a workflow run. Reject vague criteria.
- **One clarifying question at a time** if you need to ask before drafting. Don't draft a plan that depends on unanswered questions.
- **No speculative scope.** Only include files the stated goal requires.

## After producing the plan

Suggest the user:
1. Paste it into the PR description's `## Plan (required)` section.
2. Save a copy to `docs/agent-tasks/<task-id>/plan.md` using the template in `docs/agent-tasks/_template/plan.md`.
