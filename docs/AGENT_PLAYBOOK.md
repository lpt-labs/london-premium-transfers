# Agent Playbook

Operational runbook for agents (Claude Code, Copilot, future custom agents) when things go wrong. This is the *runbook* — for the *rules*, see [`../AGENTS.md`](../AGENTS.md).

> **Status:** skeleton. Most sections are stubs that get filled in by PR 7. The `GITHUB_TOKEN` trigger section below is filled now because it's the operational gotcha most likely to silently break agent workflows.

## Contents

- [Escalation](#escalation) — when to stop and tag a human
- [Retries](#retries) — when to rerun, when not to
- [Rollback](#rollback) — undoing a merged change
- [Failure analysis](#failure-analysis) — what to write in the postmortem
- [GitHub token semantics](#github-token-semantics) — why workflows sometimes don't trigger other workflows
- [Hooks dependencies](#hooks-dependencies) — what the Claude hooks need installed locally, and how to read the audit log
- [Memory](#memory) — where agent memory lives across a task's lifetime
- [Drift detection](#drift-detection) — what the `agent-drift` label means and how to clear it
- [Conflict detection](#conflict-detection) — what the `agent-conflict` label means and how to clear it
- [Eval scorecard](#eval-scorecard) — what the `<!-- eval:scorecard -->` comment means and where the raw reports live

---

## Escalation

The repo runs a **two-strike safe-iteration policy**: an agent gets exactly two chances on the same failure before it must stop and escalate. This caps wasted CI cycles, prevents loops that look like progress, and forces a human into the conversation before a stuck PR rots.

### How the two strikes are scored

- **Strike 1** — a required check fails (lint, typecheck, build, plan-gate, eval, drift, path-guard). The agent may inspect logs, push a single revised commit, and let CI re-run.
- **Strike 2** — the *same* check fails again. Stop. Do not push another fix. Post the escalation comment (template below) and add the `needs-human` label.

"Same check" means same workflow + same job + same step. A new lint failure on a different rule, after the original lint failure was fixed, is a fresh strike 1 — not strike 2 of the original. Use judgment; when in doubt, escalate.

Failures that do **not** qualify for a retry at all: anything with a clear, deterministic cause already visible in the first log (typecheck, lint, unit-test assertion). These are bugs, not transients — fix in the original commit. The retry exists for genuinely ambiguous failures, not as a free do-over.

### Escalation comment template

When strike 2 fires, post this as a PR comment, fill all four fields, then apply the `needs-human` label. Copy verbatim:

```markdown
<!-- agent-escalation -->
### Escalation: needs-human

1. **What failed.**
   <Which check, which step, which assertion. One sentence. Link the failing run.>

2. **What was attempted.**
   <The commit(s) made between strike 1 and strike 2. Why you thought they would fix it.>

3. **Evidence links.**
   <Failing run URL, the diff of the attempted fix, artifact name(s), relevant log excerpts.>

4. **Suggested next step.**
   <Your best guess at the underlying cause and one concrete action a human should take — e.g., "revert the dep bump in commit abc1234", "rerun after the upstream API recovers", "add @owner to review the regex".>
```

All four fields are required, and the order is not interchangeable. The structure is the contract: a reviewer reading any escalation comment knows exactly what they're getting and in what order. The `<!-- agent-escalation -->` marker lets future automation find escalation comments without fragile text matching.

### Who sees it, and when

- `needs-human` is the canonical escalation label.
- Today, @mafaq229 is the human-of-record for all escalations.
- SLA: best-effort same-day; no overnight expectation.
- When the human resolves the escalation, they remove the `needs-human` label (or close/convert the PR, as appropriate).

## Retries

Two valid retry shapes exist in this repo. Both cap at **three attempts**, per `.github/instructions/workflows.instructions.md`.

### When to retry vs. not retry

| Failure looks like | Retry? |
| --- | --- |
| Network timeout on an external API call | Yes |
| Package registry returned 503 / ETIMEDOUT / connection reset | Yes |
| Rate limit (HTTP 429) with a reset header | Yes, after sleeping past the reset |
| Type error, lint violation, failed assertion | No — fix it |
| Build error from a missing or wrong dependency | No — fix it |
| `permission denied` on a workflow scope | No — escalate |

Retries exist to absorb genuine environmental flakiness. If you can read the failure and point at a real bug, retrying is hiding the bug behind two more red runs.

### Pattern A — inline bash retry

For one-off retries inside a `run:` block where pulling in the composite action would be overkill:

```bash
attempts=0
max=3
until pnpm install --frozen-lockfile; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge "$max" ]; then
    echo "::error::pnpm install failed after $max attempts"
    exit 1
  fi
  echo "Attempt $attempts failed, sleeping 10s…"
  sleep 10
done
```

### Pattern B — `retry-step` composite action

For anything more structured — collapsible per-attempt log groups, a markdown summary of every attempt's output on exhaustion — use the composite action at `.github/actions/retry-step`:

```yaml
- name: Install with retries
  uses: ./.github/actions/retry-step
  with:
    command: pnpm install --frozen-lockfile
    max-attempts: "3"
    delay-seconds: "10"
```

Inputs (all values are strings, even the numeric ones):

- `command` (required): the shell command to retry. Executed via `bash -c`.
- `max-attempts` (default `"3"`): positive integer.
- `delay-seconds` (default `"5"`): non-negative integer.

On exhaustion the action appends each attempt's last 100 log lines to `$GITHUB_STEP_SUMMARY`. Every retry's output is preserved, not just the last one — this matters when a flake produces a different error on each attempt.

## Rollback

For a merged PR that breaks production, the canonical command is:

```bash
gh workflow run agent-rollback.yml \
  -f sha=<merge-commit-sha> \
  -f reason="<one-sentence cause>"
```

`<merge-commit-sha>` is the **full 40-character lowercase hex SHA** of the merge commit on `main` — not a short SHA, not the PR's head commit. To get it:

```bash
gh pr view <pr-number> --json mergeCommit --jq .mergeCommit.oid
```

### What happens after you run the command

1. The workflow validates the SHA against `^[0-9a-f]{40}$`. Bad input → exits 1 with an annotation; nothing else runs.
2. It checks out `main` with full history, verifies the SHA is reachable from `HEAD`, creates a branch `revert/<short-sha>`, and runs `git revert` (with `--mainline 1` fallback for merge commits).
3. It opens a PR against `main` with an auto-generated `## Plan (required)` block (so the revert PR itself passes `plan-gate`), labeled `infra-change` + `needs-human`.
4. **CI does not auto-trigger on the new PR.** PRs created via `GITHUB_TOKEN` don't fire downstream workflow events — see [GitHub token semantics](#github-token-semantics). To start CI on the revert branch: push an empty commit, or click *Re-run all jobs* on the revert PR's checks tab.
5. Review and merge the revert PR like any other PR. CODEOWNERS still applies; `agent-ci` must pass once you've triggered it.

### When to use `git revert` manually instead

The rollback workflow is for production incidents — you want the paper trail (workflow run, auto-generated PR body, labels). For low-stakes reverts (a docs typo merged by mistake, a misnamed file), a normal `git revert` on a hand-opened PR is fine. Threshold: if you'd want to point at "the rollback" in a postmortem, use the workflow.

### Communicate the rollback in the original thread

Post a comment on the *original* (broken) PR linking to the revert PR. Future readers landing on the original PR shouldn't have to grep the timeline to discover it was rolled back.

## Failure analysis

*To be filled in PR 7.* Will cover:

- The postmortem template (what happened, why, blast radius, fix, prevention).
- Where postmortems live (`docs/incidents/<date>-<slug>.md`).
- Which failures require one (production breakage, secret leak, false-pass CI).

---

## GitHub token semantics

**The gotcha.** GitHub Actions deliberately prevents one workflow from triggering another via the default `GITHUB_TOKEN`. If a workflow uses `${{ secrets.GITHUB_TOKEN }}` to:

- open a pull request,
- push a commit to a branch that has workflow triggers,
- create or update an issue/PR comment that some workflow filters on,

…then **no downstream workflow runs in response.** This is an anti-recursion safeguard built into the platform. From GitHub's docs: "events triggered by the `GITHUB_TOKEN` will not create a new workflow run."

This bites silently. The PR is created, the comment is posted, the push lands — but the CI checks that *should* run on those events never appear. Reviewers see a PR with no status checks and assume something's broken; the actual cause is a permissions semantic two layers up.

### When you'll hit this in our repo

- An agent workflow opens a follow-up PR (e.g. a rollback PR, a drift-fix PR, a scheduled dep-bump PR) — that new PR will not trigger `plan-gate` or `agent-ci`.
- An agent workflow pushes commits to an existing branch — the push event does not retrigger `agent-ci` on that branch.
- A workflow posts a `/command` comment expecting another workflow to react.

### Fix

Use a token that **isn't** `GITHUB_TOKEN` for the write step. Two options:

1. **GitHub App token (preferred).** Install a GitHub App with the minimum required permissions, mint an installation token at workflow runtime, and use that token for the write. Events created by an App token *do* trigger downstream workflows. Tied to the app, not a user — survives team changes and is auditable as the app.
2. **Personal Access Token (PAT) — last resort.** A fine-grained PAT scoped to this repo, stored as a repo secret. Events created by a PAT trigger downstream workflows. Tied to the user who minted the PAT — breaks if that user leaves, rotates the token, or loses their auth factor. Avoid for any agent shared by multiple humans.

### What we do today

Nothing in this repo currently chains workflows through agent-created events, so no App or PAT is set up. The first workflow that needs the chain (likely `agent-rollback.yml` or a scheduled dep-bump workflow) will land alongside the App-token setup as an `infra-change`-labeled PR. Until then, this section is here so the next person hitting an "empty checks tab on a bot-created PR" can find the answer in <30 seconds instead of three hours.

### Anti-pattern

Working around this by running `gh pr create` (which uses the user's local credentials) from a workflow step using `GITHUB_TOKEN` — it'll fail. Don't reach for `gh` here; use an App token.

### Reference

- GitHub docs: <https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow>
- App-token minting action: `actions/create-github-app-token` (first-party).

---

## Hooks dependencies

The Claude-side hooks in [`.claude/settings.json`](../.claude/settings.json) shell out to **`jq`** to parse Claude Code's JSON hook input. `jq` is not part of macOS or most Linux base installs — you have to install it yourself.

```bash
# macOS
brew install jq

# Debian / Ubuntu
sudo apt install jq

# Alpine / Docker base images
apk add jq
```

### What happens if `jq` is missing

The two hooks behave differently on purpose:

- **PreToolUse hook (fails closed).** Without `jq`, the hook can't inspect the command, so it can't detect dangerous patterns (`rm -rf /`, `git push --force main`, `gh repo delete`, `gh secret delete`). Allowing the command anyway would defeat the entire point of the hook. So instead, the hook exits 2 with a clear error: `BLOCKED ... jq is required for this hook but is not installed. Install via 'brew install jq' on macOS or 'apt install jq' on Debian.` Every Bash tool call is blocked until you install `jq`. This is intentional — a silent fail-open on a security control is the worst possible outcome.

- **PostToolUse hook (fails open).** The audit log is informational, not a security control. If `jq` is missing, the hook silently exits 0 without writing a log line. Tool calls proceed normally. You lose audit coverage but nothing breaks. Once you install `jq`, audit logging resumes.

Same reasoning, different posture: the security control fails loud and blocks; the informational tool fails quiet and skips.

### Audit-log semantics

The PostToolUse hook appends one line per tool call to `.agent-scratch/audit.log` (which is in `.gitignore`, so the log never lands in a commit). Format:

```
<ISO-8601 UTC timestamp> <tool-name> <status> <command-or-path-summary>
```

The `<status>` column comes from `.tool_response.exit_code` in Claude Code's hook input:

- For **Bash** tool calls, `<status>` is the underlying shell command's exit code — `0` on success, non-zero on failure with the actual exit code value (`1`, `2`, `127`, etc.).
- For **Write** and **Edit** tool calls, Claude Code doesn't expose an exit code (the tool either succeeds or throws, with no numeric code). The hook defaults to `0` when the field is absent. Treat a Write/Edit log entry with `<status> 0` as "tool ran without error"; if the tool threw, the hook generally doesn't run at all.

**Historical note (relevant if you're reading an old audit log):** earlier versions of the PostToolUse hook treated *any non-empty stderr* as failure (`status=1`) and *empty stderr* as success (`status=0`). This was noisy — many successful tools write informational messages to stderr (`git status` prints branch info, `pnpm install` prints progress). Old log entries showing `1` may have been successful runs that just wrote to stderr. The current semantics (exit code) are accurate; old entries aren't retroactively cleaned up because the log is append-only and ephemeral. To find when the change landed, `git log -S 'tool_response.exit_code' -- .claude/settings.json`.

### Rotating or clearing the log

`.agent-scratch/audit.log` grows append-only. For typical solo development the log stays well under 1 MB per week, but if you want to rotate it:

```bash
# inspect first
wc -l .agent-scratch/audit.log

# keep the last 10000 lines, drop the rest
tail -n 10000 .agent-scratch/audit.log > .agent-scratch/audit.log.tmp \
  && mv .agent-scratch/audit.log.tmp .agent-scratch/audit.log

# or just clear it
: > .agent-scratch/audit.log
```

The directory is per-machine — there's no shared log, no remote sync, no retention policy. It's a developer-local diagnostic tool, not an audit-grade compliance artifact. For the compliance side of things, GitHub's own audit log (org Settings → Audit log) covers the events that matter for the certification surface.

---

## Memory

Agent memory lives in three tiers — short-term (the PR's `## Plan` block), long-term (`docs/agent-tasks/<task-id>/memory.md` and `decisions.md`), and external (workflow runs, uploaded artifacts, Vercel previews, GitHub issues). The pruning rule, the `<task-id>` naming convention, and the rationale for the split all live in [`MEMORY_POLICY.md`](MEMORY_POLICY.md). The `agent-artifact-check.yml` workflow (see [`WORKFLOWS.md`](WORKFLOWS.md)) enforces that agent-shaped PRs add or reference a `plan.md`.

---

## Drift detection

The `drift-check.yml` workflow (see [`WORKFLOWS.md`](WORKFLOWS.md)) compares this PR's changed files against the paths declared in its `- **Scope (paths/files):**` bullet block. When the diff touches something that doesn't match any Scope pattern, the workflow posts a comment listing the out-of-scope files (marker: `<!-- drift-check:summary -->`) and applies the `agent-drift` label.

The check is **informational only** — it never fails the run and is not a required status check. The label is a reviewer cue, not a merge block.

### How to clear the `agent-drift` label

Pick one:

- **Scope expanded intentionally** — update the `- **Scope (paths/files):**` block in the PR description to include the now-touched paths. The next push (or a `workflow_dispatch` re-run with the `pr_number` input) removes the label and updates the comment to "✅ No drift."
- **Out-of-scope changes were unintentional** — drop them in a fresh commit. Same re-run rules apply.

Removing the label by hand without one of those moves is pointless — the next run reapplies it.

### When the workflow skips

- `dependabot[bot]` PRs are exempt (no Scope block to compare against). Same exemption shape as `plan-gate.yml` and `agent-artifact-check.yml`.
- Empty or unparseable Scope block → `::notice` + exit 0 (no comment, no label). `plan-gate` enforces Plan presence separately, so drift-check stays silent rather than double-reporting.
- Unsupported glob character in a Scope entry (`{`, `}`, `?`, `!`) → `::warning` + exit 0. Simplify the entry to the supported subset: literal paths, `*`, `**`, or trailing `/`.

---

## Conflict detection

The `conflict-detect.yml` workflow (see [`WORKFLOWS.md`](WORKFLOWS.md)) compares this PR's changed files against every other open PR's changed files. When two open PRs touch the same path, the workflow posts a find-or-update comment listing the overlapping PR + paths (marker: `<!-- conflict-detect:summary -->`) and applies the `agent-conflict` label.

The check is **informational only** — it never fails the run and is not a required status check. The label is a reviewer cue, not a merge block. Two open PRs touching the same file isn't always a problem (one rebases on the other, the changes are commutative, the second is a no-op after the first merges); the workflow surfaces the situation so reviewers decide.

### How to clear the `agent-conflict` label

Pick one:

- **Rebase or merge in main** — once the other PR lands, rebase this branch on the new main; the overlap disappears on the next push.
- **Drop the overlapping change here** — if both PRs were touching the file independently, decide which one should own it; remove the change from the loser and let the winner merge first.
- **Coordinate sequencing with the other PR's author** — leave a comment, agree on order, merge them in sequence. The workflow re-runs after each merge and clears the label on the survivor when no overlap remains.

Removing the label by hand without one of those moves is pointless — the next push reapplies it.

### When the workflow skips

- `dependabot[bot]` PRs are exempt — its PRs routinely overlap on `package.json` and lockfiles alongside other open dep PRs, so the overlap is the rule rather than the exception. Same exemption shape as `plan-gate.yml`, `agent-artifact-check.yml`, and `drift-check.yml`.
- PR has no changed files (rare) → `::notice` + exit 0.
- No other open PRs to compare against → `::notice` + exit 0 (comment updated to "✅ No conflicts" on the open PR).

---

## Eval scorecard

The `eval.yml` workflow (see [`WORKFLOWS.md`](WORKFLOWS.md)) runs a four-tool scorecard against every Vercel preview deploy — Lighthouse, axe-core a11y, lychee link check, and `type-coverage` — and posts a single find-or-update PR comment with the results (marker: `<!-- eval:scorecard -->`).

Like `drift-check.yml`, the scorecard is **informational only** — it never fails the run and is not a required status check. Threshold definitions, the qual fidelity checklist for feature PRs, and the promotion path to required-status are all in [`EVAL.md`](EVAL.md).

### Where the raw reports live

Each scorecard comment links to a workflow run; that run uploads a consolidated artifact named `eval-<run-id>-<sha>` (90-day retention) containing:

- `lighthouseci/` — Lighthouse HTML + JSON reports (3 runs per category, median reported in the comment).
- `axe.json` — axe-core's full violation list, including the `moderate` and `minor` impacts that aren't surfaced in the comment table.
- `lychee.json` — link checker JSON, including HTTP code per URL.
- `type-coverage.txt` — `--detail` listing of every `any`-leaking site.

Per-tool intermediates (`eval-<tool>-<run-id>-<sha>`) are also uploaded with a shorter 14-day retention and merged into the consolidated artifact by the summary job. For analysis longer than 90 days, download the artifact and check the relevant excerpts into a follow-up plan's `decisions.md`.

### Manually re-running on a specific PR

Same shape as `drift-check.yml` and `agent-artifact-check.yml`:

```bash
gh workflow run eval.yml -f pr_number=<pr-number>
```

The workflow resolves the most recent successful Preview deployment for that PR's head SHA, scores it, and updates (or creates) the scorecard comment on the PR. Useful for backfilling a scorecard onto an already-merged PR (e.g. the homepage PR was the v4 plan's acceptance test), or for retrying after a workflow tweak.

### When the workflow skips

- Dependabot PRs are exempt (checked against the PR author rather than `github.actor`, because `deployment_status` events come from `vercel[bot]`). Same reasoning as the other Dependabot exemptions in [`WORKFLOWS.md`](WORKFLOWS.md) — dep-bump previews rarely move scorecard numbers.
- `deployment_status` events for `Production` environments or `state != 'success'` are skipped — eval only scores live, successful Preview deploys.
- `workflow_dispatch` with no matching Preview deployment for the PR's head SHA → `::warning` + exit 0 (no comment, no artifact).
