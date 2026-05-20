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

*To be filled in PR 7.* Will cover:

- The `needs-human` label as the canonical escalation signal.
- What information to include when an agent posts the escalation comment (what failed, what was attempted, evidence links, suggested next step).
- Who reviews escalations (@mafaq229 for now).
- SLA expectations.

## Retries

*To be filled in PR 7.* Will cover:

- The "one retry then stop" rule from `AGENTS.md` (first failure → revise + rerun once; second failure of the same check → stop).
- Which kinds of failures are safe to retry without code change (transient network, rate limits, infrastructure timeouts).
- Which are not (test failure, type error, lint violation).

## Rollback

*To be filled in PR 7.* Will cover:

- `gh workflow run agent-rollback.yml -f sha=<merge-sha>` — the canonical rollback path once the workflow exists (added in a later PR).
- When to use `git revert` on a follow-up PR instead of the rollback workflow.
- How to communicate rollback in the original PR's thread.

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
