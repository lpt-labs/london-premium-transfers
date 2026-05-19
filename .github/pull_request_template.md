<!--
  Every PR (human or agent) must fill the Plan and Evidence sections.
  The `plan-gate` workflow blocks merge if the Plan is missing or empty.
-->

## Plan (required)

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
