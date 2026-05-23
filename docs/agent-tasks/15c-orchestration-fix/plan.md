# Plan: PR 15c — multi-agent orchestration calibration

> Issue: N/A (calibration follow-up after the smoke test on issue #42; sibling to PR 15 and 15b)
> Branch: `chore/multi-agent-orchestration`

- **Goal:** Close two gaps the [run 26329092250](https://github.com/lpt-labs/london-premium-transfers/actions/runs/26329092250) smoke test exposed. (1) The `Capture PR number` step's 30-second retry window timed out before the implementer's PR was actually open (the bot opened PR #46 ~3 minutes after Claude finished), so `a11y-reviewer` and `handoff-log` skipped. (2) The implementer's prompt didn't tell Claude that `plan-gate` requires the strict bullet shape from the PR template, so the bot wrote `## Scope` as an H2 heading and skipped a `- **Steps:**` bullet block — `plan-gate` failed on PR #46.

- **Scope (paths/files):**
  - `docs/agent-tasks/15c-orchestration-fix/plan.md` (this file)
  - `.github/workflows/multi-agent.yml`

- **Steps:**
  1. Extend the `Capture PR number` retry loop in the implementer job from 6 × 5 s (30 s total) to 30 × 10 s (5 min total). Break early on first hit so a fast PR-open only costs one cycle. Update the `::warning` / `::notice` text accordingly.
  2. Append a paragraph to the implementer's `prompt:` requiring `- **Goal:**` and `- **Steps:**` bullets (with numbered items) between the `<!-- PLAN:BEGIN -->` / `<!-- PLAN:END -->` markers, referencing `.github/workflows/plan-gate.yml` so the model knows where the enforcement lives.
  3. Leave `show_full_output: true` in place for the next verification run; revert in a follow-up commit once the orchestration is consistently green.

- **Success criteria (verifiable):**
  - [ ] Required CI passes on this PR (`plan-gate`, `agent-ci`, `agent-artifact-check`).
  - [ ] After merge, the next multi-agent run completes all three jobs (`implementer` → `a11y-reviewer` → `handoff-log`) with `success`; none skip.
  - [ ] The bot-opened PR's `plan-gate` check passes without manual body editing.
  - [ ] `<!-- multi-agent:a11y-review -->` comment appears on the bot PR.
  - [ ] `docs/handoffs/<date>-<issue>-<slug>.md` is committed to the bot branch.

- **Risks + mitigations:**
  - *Risk:* Extending the retry window adds up to 5 min of runner time per multi-agent run that legitimately opens no PR (implementer refused or made no changes). *Mitigation:* The empty-`branch_name` short-circuit at the top of the step keeps the no-work path fast. Only branches that exist enter the polling loop; the loop breaks on first hit.
  - *Risk:* The prompt addition is human-language guidance; Claude may still deviate when given an unusual task. *Mitigation:* `plan-gate` is the source of truth — failures are loud and fixable in the same PR via body edit. The orchestration tweak reduces but does not eliminate the need for human review.
  - *Risk:* Pinning the prompt to the current `pull_request_template.md` format means a future template change requires a synchronised prompt update. *Mitigation:* Same `same-PR-or-it-rots` invariant we use for `docs/WORKFLOWS.md` — any template change should re-check the multi-agent prompt. Worth a note in `.github/CLAUDE.md` if this becomes a recurring drift.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="multi-agent orchestration calibration regressed"`
  - Soft rollback: revert this PR; multi-agent reverts to its post-PR-45 state (a11y-reviewer + handoff-log skip; plan-gate fails first time). Already-known broken-but-recoverable state.
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — touches `.github/workflows/multi-agent.yml`; PR carries `infra-change`)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — two surgical YAML edits, reviewable in one round. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
