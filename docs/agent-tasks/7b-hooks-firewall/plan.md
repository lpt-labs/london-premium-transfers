# Plan: PR 7b — Agent hooks (Copilot dormant + Claude active) + agent-firewall study guide

<!--
  This file's section structure mirrors `.github/pull_request_template.md`.
  Paste the "- **Goal:**" through "Rollback / escalation" bullets into the
  `## Plan (required)` block of the PR description.
-->

> No tracking issue (self-implemented infra PR).
> Branch: `feat/hooks-firewall`

- **Goal:** Add the agent-hook layer the rest of the safety story depends on. Three Copilot-side hook JSON files (dormant; valid configs that anyone with a Copilot license can activate) and a Claude-side `.claude/settings.json` `hooks` block (active; loads automatically into every Claude Code session in this repo). Pair with a `docs/COPILOT_STUDY/agent-firewall.md` study guide documenting the Copilot Cloud agent firewall UI we can't exercise hands-on. After merge, any Claude session that tries a forbidden command (rm -rf, force push, gh repo delete, etc.) is blocked at the hook layer before it runs.
- **Scope (paths/files):**
  - `docs/agent-tasks/7b-hooks-firewall/plan.md` (this file)
  - `docs/WORKFLOWS.md` (small fix from previous PR)
  - `.github/hooks/pre-tool-use.json` (Copilot — block dangerous commands)
  - `.github/hooks/post-action.json` (Copilot — append to audit log)
  - `.github/hooks/error.json` (Copilot — capture failures, label `needs-human`)
  - `.claude/settings.json` (Claude — `hooks` block mirroring the Copilot semantics; this file is new)
  - `docs/COPILOT_STUDY/agent-firewall.md` (Cloud agent firewall: UI path, outbound allow-list config, expected behaviour when a denied host is contacted)
- **Steps:**
  1. Save this plan as `docs/agent-tasks/7b-hooks-firewall/plan.md` (first commit).
  2. Hand-write the three Copilot hook JSON files under `.github/hooks/`. Each is a valid JSON object with `name`, `trigger`, and `run` keys per the Design U7 example shape. Inline-document the trigger semantics so the file is self-explanatory to anyone (or any future Copilot install) reading it.
  3. Hand-write `.claude/settings.json` with a `hooks` block containing `PreToolUse` (matcher `Bash`, blocks dangerous patterns by exit code 2) and `PostToolUse` (matcher covering `Bash|Write|Edit`, appends a structured log line to `.agent-scratch/audit.log` — already in `.gitignore`). The "error" path from Copilot is folded into the PostToolUse handler, which conditionally logs failures rather than needing its own hook event (Claude doesn't expose a dedicated error event).
  4. Write `docs/COPILOT_STUDY/agent-firewall.md` — describe the Copilot Cloud agent firewall feature you'd configure if a Copilot license were available. UI path: repo Settings → Copilot → Coding agent → Firewall. Cover: enabling the firewall, switching to "Custom allowlist", typical entries (npm, GitHub, the agent's own API), what happens when the agent attempts a denied host, and how this relates to the workflow-level controls in `.github/workflows/CLAUDE.md`. Reference Microsoft Learn module Tooling U4 + Design U7 by concept; do not name them as exam units in the document body.
  5. Test the Claude `PreToolUse` hook end-to-end before opening the PR: trigger `git status; rm -rf /tmp/this-should-block` in a sandbox Bash tool call (with a path that doesn't actually exist), confirm the hook blocks the call with a clear error and the tool does not run.
- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, `agent-ci`).
  - [ ] All three `.github/hooks/*.json` files are valid JSON (`jq . .github/hooks/*.json` exits 0 for each).
  - [ ] Each Copilot hook file has `name`, `trigger`, and `run` keys and a comment-style top-of-file note (in the README or alongside) explaining what it does.
  - [ ] `.claude/settings.json` is valid JSON (`jq . .claude/settings.json` exits 0).
  - [ ] `.claude/settings.json` defines `hooks.PreToolUse` and `hooks.PostToolUse` arrays.
  - [ ] The `PreToolUse` Bash hook blocks at least: `rm -rf /` (or any path containing `rm -rf /`), `git push --force` to `main`, `gh repo delete`, and `gh secret delete` patterns. Verified by attempting a no-op variant in a Claude session before opening the PR.
  - [ ] The `PostToolUse` hook appends a one-line structured record per tool call to `.agent-scratch/audit.log` (path on `.gitignore` so the log itself is never committed). Format: `<ISO timestamp> <tool> <exit-code> <short-summary>`.
  - [ ] `docs/COPILOT_STUDY/agent-firewall.md` exists, is self-contained (purpose, UI path, sample config, expected behaviour), and does not reference GH-600 / exam framing.
  - [ ] No files modified outside the scope list above.
  - [ ] Branch is `feat/hooks-firewall`; no direct pushes to `main`.
  - [ ] `docs/WORKFLOWS.md` does **not** need updating — this PR doesn't add or modify any workflow file. (Maintenance rule from AGENTS.md still respected: confirmed in PR description.)
- **Risks + mitigations:**
  - *Risk:* the Claude `PreToolUse` Bash hook is over-aggressive and blocks legitimate commands (e.g. `rm -rf node_modules` during a clean install). *Mitigation:* the dangerous-pattern regex is anchored — `rm -rf /` and `rm -rf /<single-segment>` only, not arbitrary `rm -rf <relative-path>`. Same for `git push --force` (only when the destination is `main` or `origin main`, not feature branches). Document the exact patterns in the hook file's inline comment so they're auditable.
  - *Risk:* the `PostToolUse` audit log fills the disk in a long-running session. *Mitigation:* append-only with a one-line-per-call format; one realistic week of solo work produces < 1 MB. Path is under `.agent-scratch/` which the user can rotate or delete at will (no commit pressure since it's gitignored).
  - *Risk:* hook script has a bug that crashes the hook system, blocking all tool use silently. *Mitigation:* the hook command exits 0 on its own internal errors (only exits 2 on a deliberate block). Bash `set -e` is NOT used inside the hook; failures inside the matcher logic are logged but don't propagate. Verified by triggering with a malformed input.
  - *Risk:* `docs/COPILOT_STUDY/agent-firewall.md` includes outdated screen labels (Microsoft renames Copilot UIs frequently). *Mitigation:* document the navigation path in terms of concepts ("Settings → Copilot → Coding agent → Firewall") rather than pixel-perfect screenshots; flag that exact labels may drift.
  - *Risk:* future maintainers don't realise the Copilot hooks are dormant and try to debug "why isn't the rm-rf hook firing for Claude." *Mitigation:* a top-of-file inline note in each `.github/hooks/*.json` explicitly labels them as **Copilot-only, currently dormant** and points to `.claude/settings.json` as the active Claude equivalent.
- **Rollback / escalation plan:**
  - Rollback: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="hooks block legitimate work"`. The rollback workflow from PR 7 handles the revert and opens a follow-up PR with a Plan section.
  - Escalation: add label `needs-human`, tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — workflows/infra) — `.github/hooks/` is owner-routed in CODEOWNERS and the `infra-change` label applies for hygiene parity with workflows
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — L3 work, but each file is a small, well-bounded artifact (a JSON hook, a settings.json block, a study-guide doc). Reviewer evaluates plan alongside the diff. The success criterion "verified end-to-end before opening the PR" is the load-bearing one — without that, the Claude hook could silently misfire and the failure would only surface in a real session. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
