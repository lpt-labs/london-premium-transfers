# Plan: PR 15e — grant id-token: write to a11y-reviewer job

> Issue: N/A (final multi-agent calibration follow-up; sibling to PR 15, 15b, 15c, 15d)
> Branch: `chore/multi-agent-a11y-id-token`

- **Goal:** Add `id-token: write` to the `a11y-reviewer` job's `permissions:` block in `multi-agent.yml`. The `anthropics/claude-code-action` requires an OIDC token to authenticate; the implementer job already has the permission, but the a11y-reviewer didn't, so run [26330236288](https://github.com/lpt-labs/london-premium-transfers/actions/runs/26330236288) failed the reviewer job at startup with "Could not fetch an OIDC token". Implementer + handoff-log both succeeded — this single line is the last gap before the chassis is verified end-to-end.

- **Scope (paths/files):**
  - `docs/agent-tasks/15e-a11y-id-token/plan.md` (this file)
  - `.github/workflows/multi-agent.yml`

- **Steps:**
  1. Add `id-token: write` to the `a11y-reviewer` job's `permissions:` block, alongside the existing `contents: read`, `pull-requests: write`, `issues: read`.
  2. Inline comment explaining why (mirrors the implementer's id-token need; cites the failed run for traceability).

- **Success criteria (verifiable):**
  - [ ] Required CI passes on this PR (`plan-gate`, `agent-ci`, `agent-artifact-check`).
  - [ ] After merge, the next multi-agent run completes all three jobs (implementer, a11y-reviewer, handoff-log) with `success`. No "Could not fetch an OIDC token" error.
  - [ ] `<!-- multi-agent:a11y-review -->` comment appears on the bot PR.

- **Risks + mitigations:**
  - *Risk:* `id-token: write` widens the job's permissions surface.
    *Mitigation:* It's strictly required by the third-party action being invoked, and least-privilege still holds across the rest of the block (`contents: read`, no `actions: write`, etc.). The a11y-reviewer subagent's `tools:` frontmatter excludes write tools as defence-in-depth.
  - *Risk:* The handoff-log job's annotation "could not read Username for 'https://github.com'" suggests a separate auth issue worth investigating.
    *Mitigation:* The handoff-log job still committed [`e0029cf`](https://github.com/lpt-labs/london-premium-transfers/commit/e0029cf) successfully on the previous run — the warning is from a pre-push git operation that doesn't block the actual push. Out of scope for this PR; flag as a follow-up if it ever causes the job to actually fail.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="a11y-reviewer id-token grant regressed"`
  - Soft rollback: revert this PR; a11y-reviewer resumes failing on OIDC. Known broken state.
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — touches `.github/workflows/multi-agent.yml`; PR carries `infra-change`)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — one-line permission addition. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
