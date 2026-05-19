---
agent: ask
description: Produce a structured implementation plan for a feature or task. Read-only — never edits files.
---

You are producing a plan for an agent task in the `london-premium-transfers` repo. Treat this like the `plan` chat mode: read first, then output the plan in the required schema.

## Inputs you will be given

- A description of the task (often the body of an `agent-task` issue).
- Optionally: links to a design, related PRs, or files to consider.

## Steps

1. Confirm the task description has enough specificity. If a critical input is missing (goal unclear, no scope, no success criteria), ask **one** clarifying question before proceeding.
2. Read [`AGENTS.md`](../../AGENTS.md), [`.github/copilot-instructions.md`](../copilot-instructions.md), and any path-scoped `.github/instructions/*.instructions.md` matching the intended scope.
3. Read [`docs/PLAN_FIRST_VS_PLAN_EXEC.md`](../../docs/PLAN_FIRST_VS_PLAN_EXEC.md) and decide which workflow to recommend.
4. Output the plan in this exact schema:

```md
## Goal
<one sentence>

## Scope (paths/files)
- <path 1>
- <path 2>

## Steps
1. <action>
2. <action>

## Success criteria (verifiable)
- [ ] Required CI checks pass
- [ ] <feature-specific criterion>

## Risks + mitigations
- Risk: <…>
  Mitigation: <…>

## Rollback / escalation plan
- Rollback: <concrete command>
- Escalation: label `needs-human`, tag @mafaq229

## Autonomy level
L<n>

## Workflow choice
Plan-first | Plan + Execution — one-line reason
```

## Output discipline

- **No code edits.** This prompt is read-only.
- **Specific Scope only.** Glob patterns OK; "various files" not OK.
- **Each success criterion must be verifiable** from the diff or a workflow run.
- **One question at a time** if you need to clarify. Don't draft the plan with assumptions you haven't surfaced.
