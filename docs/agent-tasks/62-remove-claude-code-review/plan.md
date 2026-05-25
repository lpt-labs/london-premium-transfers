# Task 62 — Remove claude-code-review.yml

## Goal

Delete `.github/workflows/claude-code-review.yml` and all documentation references to it in a single PR. The workflow auto-ran Claude in free-form review mode on every PR, overlapping redundantly with the on-demand `@claude` mention flow (`claude.yml`) and the multi-agent `a11y-reviewer` subagent. It was also the brittlest piece of the Claude integration (failures on PR #46 and PR #54). Free-form Claude review is reserved for `@claude review this PR` on-demand comments going forward.

## Scope (paths/files)

- `.github/workflows/claude-code-review.yml` (delete)
- `docs/WORKFLOWS.md` (remove table row, flowchart node + edge + classDef, sequence diagram participant + block, informational checks entry)
- `docs/COPILOT_STUDY/cli-in-workflow.md` (remove inline reference)
- `docs/agent-tasks/62-remove-claude-code-review/plan.md` (this file)

## Steps

1. `git rm .github/workflows/claude-code-review.yml`
2. Edit `docs/WORKFLOWS.md`: remove flowchart node `CLAUDE_REVIEW[claude-code-review.yml]`, edge `PR_OPEN --> CLAUDE_REVIEW --> PR_COMMENT`, `CLAUDE_REVIEW` from classDef, sequence participant, "and Review posts" block, per-workflow table row, and informational checks list entry `Claude Code Review / claude-review`.
3. Edit `docs/COPILOT_STUDY/cli-in-workflow.md`: remove `claude-code-review` from the GITHUB_TOKEN downstream-workflow sentence.
4. Verify `grep -r "claude-code-review" .` returns only the historical `docs/agent-tasks/7-safe-execution/plan.md` reference (intended context).
5. Commit all changes together (same-PR documentation invariant).

## Status

Completed.
