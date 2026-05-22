# Plan: PR 11c — eval link check fails because lychee.json is Markdown

> Issue: https://github.com/lpt-labs/london-premium-transfers/issues/36
> Branch: `fix/eval-lychee-format`

- **Goal:** Make the `Link check` job in `eval.yml` actually succeed when there are zero broken links. Today it fails on every PR because the `lycheeverse/lychee-action` step writes Markdown into `lychee.json` (the action's `format:` input defaults to `markdown`), and the follow-up `jq` step then can't parse it. The fix is one line: set `format: json` on the action input so the file matches its extension.

- **Scope (paths/files):**
  - `docs/agent-tasks/11c-eval-lychee-format/plan.md` (this file)
  - `.github/workflows/eval.yml` (the only code change — set the `format:` input on the `Run lychee` step; drop the now-redundant `--format json` from `args:`)

- **Steps:**
  1. Add this plan file.
  2. Edit the `Run lychee` step in `.github/workflows/eval.yml` (around lines 290–304):
     - Add `format: json` to the `with:` block.
     - Remove `--format json` from `args:` (the action input now controls the file format; the `args:` flag only controlled stdout and was misleading).
     - Leave the inline comment block above the step in place (or extend it with a one-line note: "`format: json` is what controls the *file*; the `--format` flag in `args:` only affected stdout — keep them in sync").
  3. Verify locally by inspecting the diff against the action's input schema at <https://github.com/lycheeverse/lychee-action> — confirm `format` is a real top-level input and that `json` is a valid value.

- **Success criteria (verifiable):**
  - [ ] On this PR (`fix/eval-lychee-format`), the `Link check` job exits with success and the `Count broken links` step emits `broken=0` (or a real integer, not a parse error).
  - [ ] The eval scorecard comment posted on this PR shows `Broken links` as `0 / ≤ 0 / ✅`, not `— / 0 / ⚠️`.
  - [ ] Downloading the eval artifact and running `jq . lychee.json` succeeds (the file is valid JSON).
  - [ ] No other eval signals regress (Lighthouse, axe, type coverage scores match the previous run on this branch's base).

- **Risks + mitigations:**
  - *Risk:* The `lycheeverse/lychee-action` schema renamed `format:` to something else in the SHA we pin to (`8646ba30…` ≈ v2).
    *Mitigation:* Verify the input name in step 3 before committing. If the schema disagrees with this plan, update the plan rather than guessing.
  - *Risk:* Setting `format: json` changes what the job-summary view in the run UI displays (the action's `jobSummary: true` writes a Markdown summary; if it now uses the `format:` setting, the summary could turn into raw JSON).
    *Mitigation:* This is cosmetic, not functional — the artifact and the `broken` count are the load-bearing outputs. If the summary regresses, follow up separately; do not block this fix on it.
  - *Risk:* This counts as a workflow edit and needs the `infra-change` label + CODEOWNERS approval per `AGENTS.md` (L3).
    *Mitigation:* Label the PR `infra-change` at open; request CODEOWNERS review explicitly. No new permissions, triggers, or outcomes are introduced — the only change is that a broken job starts working — so `docs/WORKFLOWS.md` does not need updating (the per-workflow row for `eval.yml` already describes the intended behavior).

- **Rollback / escalation plan:**
  - Rollback: revert the one-commit diff; `Link check` returns to its current failing state and the eval scorecard goes back to `⚠️` on the link row. Nothing downstream depends on Link check (it's informational).
  - Escalation: if the fix doesn't restore the job, add label `needs-human` and tag @mafaq229. Worst case is to leave the job as-is (still informational) and reopen the issue.

## Autonomy level

- [ ] L0
- [ ] L1
- [ ] L2
- [x] L3 (touches `.github/workflows/eval.yml`; PR carries `infra-change`)
- [ ] L4

## Workflow choice

Plan + Execution — single-line workflow fix, fully reversible, observable on the same PR via the link-check job. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
