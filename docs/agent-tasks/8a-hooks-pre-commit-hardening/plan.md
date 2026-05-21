# Plan: Hooks hardening (#27) + pre-commit framework (#29) — combined foundation polish

<!--
  This file's section structure mirrors `.github/pull_request_template.md`.
  Paste the "- **Goal:**" through "Rollback / escalation" bullets into the
  `## Plan (required)` block of the PR description.
-->

> Closes #27 and #29.
> Branch: `chore/hooks-and-pre-commit-hardening`
> Slot: foundation polish between PR 8 and PR 9 (not numbered in the v4 plan; addresses two open issues that arose during/after recent PRs).

- **Goal:** Address two open issues in a single foundation-polish PR. (1) From #27 — harden `.claude/settings.json` so the PreToolUse Bash hook fails closed when `jq` is missing (currently silently bypasses dangerous-pattern checks), and so the PostToolUse audit-log `status` field reflects the tool's real exit code instead of treating any stderr output as failure. (2) From #29 — add Husky + lint-staged as a JS-native pre-commit framework that runs `eslint --fix` against staged TS/JS files on `git commit`, auto-resolving fixable lint issues and blocking the commit on unfixable ones. Prettier is intentionally out of scope; ESLint-only keeps this PR tight, Prettier can land later if desired.
- **Scope (paths/files):**
  - `docs/agent-tasks/8a-hooks-pre-commit-hardening/plan.md` (this file)
  - `.claude/settings.json` (modify PreToolUse to gate on `command -v jq`; modify PostToolUse to use `.tool_response.exit_code` or rename the field if the schema doesn't expose it)
  - `docs/AGENT_PLAYBOOK.md` (one-paragraph addition: `jq` install hint + clarification of audit-log status semantics)
  - `package.json` (add `husky` and `lint-staged` as devDependencies; add `prepare` script; add `lint-staged` config block inline)
  - `pnpm-lock.yaml` (updated automatically by `pnpm install`)
  - `.husky/pre-commit` (executable shell script that invokes `pnpm exec lint-staged`)
  - `.gitignore` (small addition: `.claude/worktrees/` to keep Claude Code's worktree feature local; previously surfaced as untracked noise)
  - `README.md` (small addition under "Local development": one paragraph documenting the pre-commit hook + the `--no-verify` escape hatch)
- **Steps:**
  1. Save this plan as `docs/agent-tasks/8a-hooks-pre-commit-hardening/plan.md` (first commit).
  2. Modify `.claude/settings.json` to address #27. PreToolUse: prepend `command -v jq >/dev/null 2>&1 || { echo "BLOCKED: jq is required by the PreToolUse hook but is not installed. Install via 'brew install jq' on macOS or 'apt install jq' on Debian." >&2; exit 2; }`. PostToolUse: replace the stderr-presence heuristic with `.tool_response.exit_code` (Claude Code's hook schema exposes this for tool calls that wrap an underlying process); fall back to `0` if the field is absent. Field name in the audit log stays `<status>` since the semantics now match.
  3. Expand `docs/AGENT_PLAYBOOK.md` with a "Hooks dependencies" subsection: documents that `.claude/settings.json` hooks shell out to `jq`, the install hint, and a one-line note that the audit log's status reflects the underlying tool's exit code (not whether stderr was written to).
  4. Add `husky` and `lint-staged` as devDependencies in `package.json` (pinned to current major versions per the action-pinning convention extended to deps — `husky@^9`, `lint-staged@^15` or whatever the current stable majors are at time of writing). Add a `prepare` script that runs `husky` on `pnpm install`. Add a `lint-staged` config block inline that maps `*.{ts,tsx,js,jsx,mjs,cjs}` to `eslint --fix`. Run `pnpm install` locally to refresh `pnpm-lock.yaml`.
  5. Create `.husky/pre-commit` containing a single line: `pnpm exec lint-staged`. Husky v9 doesn't need a shebang or the legacy `_` directory; the file is a plain shell command and Husky's install handles the rest. Make the file executable (`chmod +x`).
  6. Update `.gitignore` to exclude `.claude/worktrees/` (Claude Code's local-only worktree feature surfaces this directory as untracked otherwise).
  7. Update `README.md` "Local development" section with one paragraph: explains the pre-commit hook (auto-fixes lint on `git commit`, blocks unfixable issues), the `git commit --no-verify` escape hatch for emergencies, and a note that typecheck/build remain CI-only (too slow for pre-commit).
- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, `agent-ci` lint/typecheck/build/PR-summary).
  - [ ] `.claude/settings.json` parses as valid JSON (`jq . .claude/settings.json` exits 0).
  - [ ] PreToolUse hook command starts with the `command -v jq` gate; verified by temporarily shadowing `jq` in PATH (e.g., `PATH=/tmp:$PATH` with no `jq` in `/tmp`) and confirming a Bash tool call is BLOCKED with the install hint rather than silently allowed.
  - [ ] PostToolUse hook reads `.tool_response.exit_code` (or documented fallback if the field name has changed in current Claude Code releases) and the audit log accurately distinguishes a `0`-exit `git status` from a `1`-exit failing command.
  - [ ] `docs/AGENT_PLAYBOOK.md` contains a "Hooks dependencies" subsection naming `jq` as required + the install hints + the audit-log semantics.
  - [ ] `package.json` includes `husky` and `lint-staged` under `devDependencies`, a `prepare: "husky"` script, and an inline `lint-staged` config that maps `*.{ts,tsx,js,jsx,mjs,cjs}` to `eslint --fix`.
  - [ ] `pnpm install` on a fresh clone of the branch produces a working `.husky/pre-commit` hook (file exists, executable, runs `pnpm exec lint-staged`).
  - [ ] Manual end-to-end test: stage a `.tsx` file containing a lint violation (e.g., unused import); run `git commit`; confirm ESLint auto-fixes it OR blocks the commit with a clear error.
  - [ ] Manual end-to-end test: `git commit --no-verify` bypasses the hook (escape hatch works).
  - [ ] The hook does NOT run `tsc --noEmit` or `pnpm build` (those stay in CI per `agent-ci.yml`).
  - [ ] `.gitignore` includes `.claude/worktrees/`.
  - [ ] `README.md` "Local development" section mentions the pre-commit hook and the `--no-verify` escape hatch.
  - [ ] No files modified outside the scope list above.
  - [ ] PR has the `infra-change` label (touches `package.json` + `.claude/`).
  - [ ] `docs/WORKFLOWS.md` does NOT need updating (no workflow file added or modified).
- **Risks + mitigations:**
  - *Risk:* the `command -v jq` gate exits 2 inside the hook process, which Claude Code interprets as "blocked tool call" — meaning a missing `jq` blocks every Bash tool call until `jq` is installed. *Mitigation:* this is intentional — silent fail-open is worse than a clear error pointing at the install command. Documented in `docs/AGENT_PLAYBOOK.md`.
  - *Risk:* Claude Code's hook input schema doesn't expose `.tool_response.exit_code` (or names it differently — `code`, `status`, `returncode`). *Mitigation:* before drafting commit 2, verify the field name against current Claude Code docs (or by writing a temporary diagnostic hook that dumps the full stdin JSON to a log). If the field is genuinely absent, fall back to renaming the audit-log column from `status` to `stderr_present` so the log doesn't lie, and document the choice in the plan.
  - *Risk:* Husky's `prepare` script doesn't run on CI (because `--frozen-lockfile` and `--ignore-scripts` patterns are common), so CI never sets up the hook and any committed pre-existing hook state goes stale. *Mitigation:* Husky v9 is designed for `pnpm install` only (developer machines); CI doesn't need the hook because CI doesn't commit. No action needed beyond confirming `agent-ci.yml`'s `pnpm install` line is unaffected.
  - *Risk:* lint-staged runs `eslint --fix` against a file that's also being edited by the user mid-commit (race condition). *Mitigation:* git's index already holds the staged content; lint-staged operates on the staged copy, not the working tree. Standard pattern, well-tested.
  - *Risk:* the new pre-commit hook adds 1-3 seconds to every commit, which the user notices and resents. *Mitigation:* it only runs ESLint, only on staged files. For a 1-2 file commit it should complete in <1s. If the user finds it slow, they can `--no-verify` per commit or remove via a one-line `package.json` change.
  - *Risk:* future Claude sessions running on a machine without Husky installed (e.g., fresh dev environment) commit without the hook firing. *Mitigation:* the `prepare` script auto-installs Husky on `pnpm install`. Anyone who clones and runs `pnpm install` is set up. Document this in README.
- **Rollback / escalation plan:**
  - Rollback: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="hooks hardening or pre-commit regression"`. Revert removes both #27's hardening and #29's pre-commit framework; user is left with the pre-PR state (PR 7b's hooks + no pre-commit hook).
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — workflows/infra) — touches `package.json` deps + `.claude/` config; `infra-change` label applies
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — both changes are well-bounded with clear acceptance criteria, the patterns are standard (Husky+lint-staged is canonical for Next.js; the hook gate is a one-line check), and reviewer evaluates plan alongside the diff. The two manual end-to-end tests in Success criteria are the load-bearing verification — without them, a hook regression could silently bypass dangerous-command blocking. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
