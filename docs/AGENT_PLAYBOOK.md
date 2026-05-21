# Agent Playbook

Operational runbook for agents (Claude Code, Copilot, future custom agents) when things go wrong. This is the *runbook* — for the *rules*, see [`../AGENTS.md`](../AGENTS.md).

> **Status:** skeleton. Most sections are stubs that get filled in by PR 7. The `GITHUB_TOKEN` trigger section below is filled now because it's the operational gotcha most likely to silently break agent workflows.

## Contents

- [Escalation](#escalation) — when to stop and tag a human
- [Retries](#retries) — when to rerun, when not to
- [Rollback](#rollback) — undoing a merged change
- [Failure analysis](#failure-analysis) — what to write in the postmortem
- [GitHub token semantics](#github-token-semantics) — why workflows sometimes don't trigger other workflows

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
