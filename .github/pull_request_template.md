<!--
  Every PR (human or agent) must fill the Plan and Evidence sections.
  The `plan-gate` workflow blocks merge if the Plan is missing or empty.

  How to fill the Plan block:
    - If this PR has an associated docs/agent-tasks/<task-id>/plan.md file,
      paste its Goal-through-Rollback bullets between the PLAN:BEGIN and
      PLAN:END markers below. The plan.md file and this template share the
      same bullet format on purpose — it's a literal copy-paste.
    - For small PRs without a plan.md (typo fix, dependency bump, single-
      line change), edit the placeholder bullets between the markers
      directly. The bullets are still required; plan-gate enforces it.
-->

## Plan (required)

<!-- PLAN:BEGIN — paste plan.md content between this and the PLAN:END marker below -->

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
