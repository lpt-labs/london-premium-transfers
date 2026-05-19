---
applyTo: ".github/workflows/**,.github/actions/**"
---

# Workflows and Actions instructions

Load only when editing `.github/workflows/` or `.github/actions/`. Pair with [`../copilot-instructions.md`](../copilot-instructions.md) and [`../../AGENTS.md`](../../AGENTS.md).

## Hard requirement

**Do not modify any file under `.github/workflows/` or `.github/actions/` unless the PR has the `infra-change` label.**

These paths are L3 in the autonomy table. A PR touching them without the label will be blocked by the `path-guard` workflow.

## Permissions

- Every workflow declares `permissions:` at the top — never rely on defaults.
- Default to least privilege: `permissions: { contents: read }`.
- Elevate per-job, not workflow-wide. Example: only the job that opens a PR needs `pull-requests: write`.
- Never grant `contents: write` to a workflow that runs on `pull_request` from forks.

## Defensive triggering

- Workflows triggered by `pull_request` should gate PR-specific steps with `if: github.event_name == 'pull_request'`. Prevents accidental misfires when the same workflow accepts other triggers (`workflow_dispatch`, `schedule`).

## Action pinning

- Pin third-party actions to a full commit SHA, not a tag: `actions/checkout@<40-char-sha>` not `actions/checkout@v4`.
- First-party actions (`actions/*`, `github/*`) may use major version tags (`@v4`).
- After pinning, add a comment showing which version that SHA corresponds to.

## Artifacts and outputs

- Upload artifacts with `actions/upload-artifact@v4` whenever a step produces results downstream consumers (or reviewers) might want to inspect.
- Artifact names include the run ID and commit SHA: `logs-${{ github.run_id }}-${{ github.sha }}`. This makes every artifact traceable to a run and a code state.
- Pass data between steps via `$GITHUB_OUTPUT`, between jobs via `outputs:` + `needs:`. Don't write data to disk just to read it back in a later step.

## Failure handling

- Use `continue-on-error: false` (the default) for any step whose failure should block downstream work. Don't silently swallow failures.
- For transient external calls (network, rate-limited APIs), wrap in a bounded retry — three attempts maximum, with a short delay. After three failures the workflow fails and surfaces a clear message.

## Anti-patterns

- Editing a workflow to make a failing check pass instead of fixing the underlying problem.
- Granting `write` permission "just in case."
- Using `${{ github.event.pull_request.title }}` or any other PR-author-controlled input in a shell command without sanitization — a vector for command injection.
- Triggering on `pull_request_target` for any workflow that checks out and runs untrusted PR code.
