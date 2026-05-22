---
date: 2026-05-22
pr: 35
title: Implementation deviated from plan's declared path; Scope block updated only after drift-check fired
category: reasoning
severity: minor
status: resolved
---

## Symptom

After implementing PR 35, the informational `drift-check` workflow posted a warning comment on the PR: `1 file(s) touched outside the declared Scope: .github/workflows/daily-repo-status.md`. The plan and PR-body Scope block listed `.github/aw/daily-repo-status.md` (with `.github/workflows/daily-repo-status.agent.md` as a documented fallback); the actually-committed path was neither. The drift was caught by CI, not by the agent, after the commit had already landed on the branch.

## Trace

- PR: <https://github.com/lpt-labs/london-premium-transfers/pull/35>
- `8b60020`: plan committed with Scope listing `.github/aw/daily-repo-status.md` (primary) + `.github/workflows/daily-repo-status.agent.md` (fallback).
- Implementation step (commit 2 of the PR): agent verified the current `gh-aw` spec against <https://github.com/githubnext/gh-aw>, found that the current convention is `.github/workflows/<name>.md` (a *third* shape neither in the Scope nor in the documented fallback), called the judgement to follow upstream, and proposed `.github/workflows/daily-repo-status.md`.
- `37355759`: workflow file committed at `.github/workflows/daily-repo-status.md`. Scope block in plan and PR body still showed `.github/aw/…`. No Scope update in this commit or the next three.
- Run [26303787845](https://github.com/lpt-labs/london-premium-transfers/actions/runs/26303787845): `drift-check` posts the out-of-scope warning.
- Out-of-band diagnosis: agent re-reads the drift comment, edits `docs/agent-tasks/11b-agentic-workflow/plan.md` and the PR description Scope block to reference the actually-committed path.
- `9ac1791` ("docs: plan update to mitigate drift"): the Scope reconciliation commit.
- Run [26304303769](https://github.com/lpt-labs/london-premium-transfers/actions/runs/26304303769): `drift-check` posts `✅ No drift — all changes within declared Scope`.

## Category

`reasoning`. The agent's context included the relevant rule — `AGENTS.md` → Working principles → "Stay in scope. … If the work needs to touch a path outside that list, stop and update the issue first." The plan's Risks section also flagged the path convention as unstable and anticipated a judgement call. What the agent reasoned wrongly was the *sequencing*: the plan's permission to make a path judgement at implementation time was treated as if it suspended the Scope-update obligation, when in fact it only authorised the deviation — the Scope still had to be updated synchronously.

## Root cause

The plan's Risks section ("verify against gh-aw README at implementation time; pick whichever path the current spec names") and the AGENTS.md "Stay in scope" rule lived in different documents and addressed different halves of the same action. Neither document explicitly said: *when the plan authorises a judgement call on a path, the Scope-update obligation still applies and must land in the same commit as the deviation.* The agent's context had both halves but no glue between them, so the deviation went into the diff while the Scope update lagged by five commits.

## Fix

Two-line edit to the plan's Scope block and the PR description, replacing `.github/aw/daily-repo-status.md` with `.github/workflows/daily-repo-status.md` and rewriting the justification clause. Commit `9ac1791`. After the push, the next drift-check run on commit `9ac1791` reported no drift.

## Rule

**When implementing a step where the plan authorises a judgement call on a path or file shape, update the plan's `Scope (paths/files)` block (and the PR-body Scope mirror) in the same commit as the deviation — not in a follow-up commit, and never after `drift-check` has flagged it.** The plan's permission to deviate authorises the deviation; it does not suspend the Scope-update obligation.

## Where rule lives

- [x] `CLAUDE.md` (Lessons section)
- [x] `.github/copilot-instructions.md` (Lessons section)
- [ ] Other:
