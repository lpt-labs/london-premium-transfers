# Workflow-editing rules (Claude)

Path-scoped rules that apply when editing anything under `.github/workflows/`.
Loaded automatically by Claude Code when the working file lives here.

This file is the Claude-side mirror of
[`../instructions/workflows.instructions.md`](../instructions/workflows.instructions.md)
(which Copilot loads via its `applyTo:` frontmatter). Both files describe the
same rules; if they ever disagree, [`../../AGENTS.md`](../../AGENTS.md) wins.

## Hard requirement

**Do not modify any file under `.github/workflows/` unless the PR has the
`infra-change` label.** These paths are L3 in the autonomy table
(`AGENTS.md` → Risk-based autonomy levels) — CODEOWNERS approval plus the
label are both required. A future `path-guard` workflow (PR 16) will block
unlabeled PRs that touch this directory; until then, the rule is enforced
by review.

If a task seems to require a workflow edit and the PR is not labeled
`infra-change`, **stop and ask** before editing.

## Rules summary

The full text lives in `../instructions/workflows.instructions.md`. The
short version, for reference while editing:

- **Permissions.** Every workflow declares `permissions:` at the top — never
  rely on defaults. Default to `permissions: { contents: read }` and elevate
  per-job, not workflow-wide.
- **Defensive triggering.** Gate PR-specific steps with
  `if: github.event_name == 'pull_request'` even when `on:` only lists
  `pull_request` today — protects against later additions of `schedule` or
  `workflow_dispatch`.
- **Action pinning.** Third-party actions are pinned to a 40-character commit
  SHA with a trailing comment naming the version. First-party (`actions/*`,
  `github/*`) may use `@v4` major-version tags.
- **Artifact naming.** `actions/upload-artifact@v4` uses names of the form
  `<purpose>-${{ github.run_id }}-${{ github.sha }}` so every artifact traces
  to a run and a commit.
- **Outputs over disk.** Pass data between steps with `$GITHUB_OUTPUT`, between
  jobs with `outputs:` + `needs.<job>.outputs.<name>`. Don't write to a file
  just to read it back.
- **Command-injection safety.** Never interpolate PR-author-controlled values
  (`github.event.pull_request.title`, `.body`, branch names, etc.) directly
  into shell commands. Pass them through `env:` and reference as `"$VAR"`.
  See `plan-gate.yml` for the pattern.
- **Never `pull_request_target` for untrusted code.** That trigger runs with
  repo write tokens against forked code — a known supply-chain footgun.

## When unsure

Ask in the PR or issue before editing. Workflow files are L3 — the cost of a
clarifying question is much lower than the cost of a misconfigured permission
or a silent CI bypass.
