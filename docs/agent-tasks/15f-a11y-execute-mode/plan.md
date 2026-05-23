# Plan: PR 15f — fix a11y-reviewer permission mode (execute, not plan)

> Issue: N/A (sixth and likely final multi-agent calibration follow-up)
> Branch: `chore/multi-agent-a11y-execute-mode`

- **Goal:** Make the a11y-reviewer subagent actually execute its review (read the PR diff + post a comment) instead of producing a meta-plan describing what it *would do*. Run [26331201023](https://github.com/lpt-labs/london-premium-transfers/actions/runs/26331201023) showed all three jobs green but no `<!-- multi-agent:a11y-review -->` comment landed on PR #50 — Claude's thinking trace revealed `--permission-mode plan` puts it in "stage a plan, await user approval" mode, which in non-interactive CI means writing a meta-plan and exiting success without doing the work.

- **Scope (paths/files):**
  - `docs/agent-tasks/15f-a11y-execute-mode/plan.md` (this file)
  - `.github/workflows/multi-agent.yml`

- **Steps:**
  1. Change the a11y-reviewer's `claude_args` from `--permission-mode plan` to `--permission-mode acceptEdits --allowedTools "Read,Grep,Glob,Bash"`. Read-only constraint moves from the runtime permission mode (which was being misinterpreted) to an explicit allowed-tools whitelist that excludes Write/Edit/MultiEdit.
  2. Replace the inline comment to explain the semantic correction and document the three-layer defence (allowedTools + subagent frontmatter + job permissions block).

- **Success criteria (verifiable):**
  - [ ] Required CI passes on this PR (`plan-gate`, `agent-ci`, `agent-artifact-check`, `path-guard`).
  - [ ] After merge, re-toggling `multi-agent` on a fresh issue produces a run where the a11y-reviewer actually reads the PR diff, examines `.tsx`/`.html` files, and posts a real review comment with the `<!-- multi-agent:a11y-review -->` marker on the bot's PR.
  - [ ] The reviewer's session log shows non-zero file reads from the PR diff, not just a meta-plan in the result text.
  - [ ] Reviewer still cannot edit files — verifiable by inspection of the run's session log (no Write/Edit/MultiEdit calls).

- **Risks + mitigations:**
  - *Risk:* `acceptEdits` mode is permissive — any code path that asks Claude to write *would* succeed at the runtime gate.
    *Mitigation:* Three independent layers prevent writes: (1) `--allowedTools` explicitly omits Write/Edit/MultiEdit so Claude doesn't have access to those tools at all; (2) the subagent file's `tools: Read, Grep, Glob` frontmatter is the subagent's contract; (3) the workflow job's `permissions:` block has `contents: read` (no write scope) so even if Claude somehow attempted a file write, the runner's API wouldn't accept the push.
  - *Risk:* Bash access introduces a wider surface than the previous "plan-only" config.
    *Mitigation:* Bash is required for the `gh` CLI calls the reviewer needs (`gh pr view`, `gh pr comment`). The workflow's `pull-requests: write` permission limits what those calls can actually do — they can write comments but cannot push code. No new risk over what the implementer job already exercises.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="a11y-reviewer permission mode change regressed"`
  - Soft rollback: revert this PR; a11y-reviewer resumes writing meta-plans (known-broken state).
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — touches `.github/workflows/multi-agent.yml`; PR carries `infra-change`)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — one-line argument change. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
