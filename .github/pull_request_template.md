<!--
  Every PR (human or agent) must fill the Plan and Evidence sections.
  The `plan-gate` workflow blocks merge if the Plan is missing or empty.

  Two ways to fill the Plan block below:
    1. Auto-sync (preferred): include `docs/agent-tasks/<task-id>/plan.md`
       in the PR diff. The `sync-plan-to-pr.yml` workflow will replace the
       content between the PLAN:BEGIN / PLAN:END markers with the file's
       Goal-through-Rollback bullets.
    2. Manual paste: replace the placeholder bullets between the markers
       with your plan content. Useful for PRs that don't have an associated
       plan.md (e.g. small docs fixes) or when the sync workflow is down.
-->

## Plan (required)

<!-- PLAN:BEGIN — do not edit these marker comments; content between them may be auto-generated -->

- **Goal:**
- **Scope (paths/files):**
- **Steps:**
  1.
  2.
  3.
- **Success criteria (verifiable):**
  - [ ] Required checks pass (lint, typecheck, build, plan-gate, eval, drift, path-guard)
  - [ ] Security signals reviewed (as applicable)
- **Risks + mitigations:**
- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha>`
  - Escalation: add label `needs-human` and tag @mafaq229

<!-- PLAN:END -->

## Evidence

- Workflow run(s):
- Scan results (if applicable):
- Uploaded artifacts:
- Preview deploy:

## Review checklist

- [ ] Plan reviewed and approved
- [ ] Required reviews satisfied
- [ ] Required checks satisfied
- [ ] Changes are surgical, no speculative abstraction, no scope creep, success criteria verifiable
