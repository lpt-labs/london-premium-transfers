# Plan: PR 15d — multi-agent branch-lookup fix

> Issue: N/A (third multi-agent calibration follow-up; sibling to PR 15, 15b, 15c)
> Branch: `chore/multi-agent-deterministic-branch-lookup`

- **Goal:** Stop relying on the `anthropics/claude-code-action@v1` `branch_name` output. Run [26329802564](https://github.com/lpt-labs/london-premium-transfers/actions/runs/26329802564) showed it empty even when the bot successfully created branch `multi-agent/48` and opened PR #50. Because the capture step short-circuits on empty `BRANCH_NAME`, the 5-minute retry from PR #47 never ran and the a11y-reviewer + handoff-log jobs skipped — same symptom as before, different root cause. Construct the branch name deterministically from the values we already configure via `branch_prefix` + `branch_name_template`; we always know it should be `multi-agent/<issue-number>`.

- **Scope (paths/files):**
  - `docs/agent-tasks/15d-branch-lookup-fix/plan.md` (this file)
  - `.github/workflows/multi-agent.yml`

- **Steps:**
  1. Replace `BRANCH_NAME: ${{ steps.claude.outputs.branch_name }}` with `EXPECTED_BRANCH: multi-agent/${{ steps.guard.outputs.issue_number }}` in the `Capture PR number` step's `env:` block.
  2. Remove the empty-branch-name short-circuit at the top of the step; we now always know the expected branch name. Empty `PR_NUMBER` after the 5-minute retry indicates the implementer refused or made no commits — same semantic as before, communicated via the `::warning` line.
  3. Set `branch_name=$EXPECTED_BRANCH` as a step output so downstream jobs that consume `needs.implementer.outputs.branch_name` (a11y-reviewer's `Checkout`, handoff-log) keep working.
  4. Update the job-level `outputs.branch_name` mapping to reference `steps.pr.outputs.branch_name` instead of `steps.claude.outputs.branch_name`.
  5. Update the header comment that previously claimed the action's `branch_name` output is reliable.

- **Success criteria (verifiable):**
  - [ ] Required CI passes on this PR (`plan-gate`, `agent-ci`, `agent-artifact-check`).
  - [ ] After merge, applying `multi-agent` to a fresh test issue produces a run where the implementer's `Capture PR number` step finds the PR within the 5-minute window and emits `pr_number=<n>` to `$GITHUB_OUTPUT`.
  - [ ] `A11y reviewer subagent` job completes with `success`, not `skipped`.
  - [ ] `Write handoff log` job completes with `success`, not `skipped`.
  - [ ] `<!-- multi-agent:a11y-review -->` comment appears on the bot PR.
  - [ ] `docs/handoffs/<date>-<issue>-<slug>.md` is committed to the bot branch.

- **Risks + mitigations:**
  - *Risk:* `branch_prefix` / `branch_name_template` config in `multi-agent.yml` changes in a future PR without the capture step's `EXPECTED_BRANCH` being updated to match — silent drift.
    *Mitigation:* Inline comment in the step body documents the dependency. A follow-up could extract both into a workflow-level `env:` variable so the coupling is explicit. Not done here to keep the diff surgical.
  - *Risk:* If the action ever fails *before* creating the branch (e.g., auth error), the capture step still waits 5 minutes for a PR that will never exist.
    *Mitigation:* The step output is empty after the wait, downstream jobs skip, the run completes. Cost is 5 minutes of runner time on the failure path — acceptable. Action's own error output appears in its step logs for diagnosis.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="branch-lookup change regressed"`
  - Soft rollback: revert this PR; multi-agent reverts to post-PR-47 state (capture short-circuits on empty `BRANCH_NAME`, downstream jobs skip — the known-broken state we observed).
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — touches `.github/workflows/multi-agent.yml`; PR carries `infra-change`)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — one focused YAML edit + documentation, reviewable in one round. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
