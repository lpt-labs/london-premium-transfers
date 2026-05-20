# Plan: Add agent CI workflow + workflow-editing rules + playbook skeleton

<!--
  This file's section structure mirrors `.github/pull_request_template.md`
  intentionally. Paste the "- **Goal:**" through "Rollback / escalation"
  bullets into the `## Plan (required)` block of the PR description.

  See `docs/agent-tasks/_template/plan.md` for the canonical template.
-->

> No tracking issue (self-implemented infra PR).
> Branch: `feat/agent-ci`

- **Goal:** Stand up the first real CI workflow for this repo — lint + typecheck + build on every PR, traceable artifacts, defensive triggers, least-privilege permissions, cross-job outputs — plus a workflow-scoped Claude instructions file, a Vercel preview reference workflow, and the AGENT_PLAYBOOK skeleton. After merge, every future PR (including agent-authored ones) runs through real status checks instead of just `plan-gate`.
- **Scope (paths/files):**
  - `docs/agent-tasks/6-agent-ci/plan.md`
  - `.github/workflows/CLAUDE.md`
  - `.github/workflows/agent-ci.yml`
  - `.github/workflows/preview-deploy.yml`
  - `docs/AGENT_PLAYBOOK.md`
- **Steps:**
  1. Save this plan to `docs/agent-tasks/6-agent-ci/plan.md` as the first commit on `feat/agent-ci`.
  2. Add `.github/workflows/CLAUDE.md` — path-scoped rules for editing workflow files (mirrors `.github/instructions/workflows.instructions.md` for Claude). Deferred from PR 2b; lands now that the directory has content beyond `plan-gate.yml`.
  3. Hand-write `.github/workflows/agent-ci.yml`. Demonstrates: defensive event-name guard, `permissions:` least-privilege, three jobs (lint / typecheck / build) wired via `$GITHUB_OUTPUT` + `needs.X.outputs.Y`, inline comments distinguishing `github.*` / `vars.*` / `env.*` contexts, `actions/upload-artifact@v4` with traceability-named artifacts, a PR-comment summary step that updates a single comment per PR (not duplicates).
  4. Hand-write `.github/workflows/preview-deploy.yml` — Vercel CLI deploy shape, `workflow_dispatch` only (not auto-firing on PR). Documents the deploy-from-CI pattern. Real previews come from the Vercel GitHub integration enabled separately at <https://vercel.com/new>.
  5. Add `docs/AGENT_PLAYBOOK.md` skeleton — top-level structure (Escalation, Retries, Rollback, Failure analysis), with the `GITHUB_TOKEN` vs PAT/App-token note from Tooling U5 filled in. Remaining sections expanded in PR 7.
- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, plus the new `agent-ci` jobs once they exist).
  - [ ] `agent-ci.yml` parses and appears in the Checks tab on this PR.
  - [ ] `agent-ci.yml` produces an artifact named `logs-${{ github.run_id }}-${{ github.sha }}` (visible under the run's Summary tab).
  - [ ] `agent-ci.yml` posts a single PR comment with the run URL and artifact link; pushing a new commit updates the same comment rather than creating a new one.
  - [ ] `agent-ci.yml` declares `permissions:` explicitly (no implicit defaults); each job's permissions are minimal (`contents: read` baseline, only the comment-posting job has `pull-requests: write`).
  - [ ] `preview-deploy.yml` is valid YAML and triggers only on `workflow_dispatch` (no `pull_request` trigger).
  - [ ] Vercel GitHub integration is active: a preview URL is posted on this PR by the Vercel bot.
  - [ ] `.github/workflows/CLAUDE.md` declares the "no edits without `infra-change` label" rule prominently.
  - [ ] `docs/AGENT_PLAYBOOK.md` exists with the GITHUB_TOKEN-trigger note and section stubs.
  - [ ] No files modified outside the scope list above.
  - [ ] Third-party actions (if any) pinned to a full commit SHA; first-party (`actions/*`) may use `@v4`.
- **Risks + mitigations:**
  - *Risk:* `agent-ci.yml` syntax error → workflow never appears in the Checks tab → silent failure. *Mitigation:* run `yamllint` (or eyeball with `gh workflow view` after push); if no check appears within ~30s of pushing, suspect a parse error and check the Actions tab's error notifications.
  - *Risk:* the PR-comment step creates a new comment on every push, spamming the PR. *Mitigation:* use a marker-based update pattern (e.g. `peter-evans/create-or-update-comment@<sha>` with `comment-id` lookup, or `actions/github-script` with `gh api` filtering by marker). Test by pushing twice and confirming only one comment exists.
  - *Risk:* the artifact-naming rule (`logs-<run-id>-<sha>`) is rejected by `actions/upload-artifact@v4` if it contains characters GitHub disallows. *Mitigation:* SHA and run-id are both hex/digit safe; tested on first run. If broken, fall back to `logs-${{ github.run_id }}` and document the limitation.
  - *Risk:* Vercel integration accidentally auto-deploys a feature branch to **production** instead of preview (misconfiguration). *Mitigation:* during integration setup, confirm production branch is set to `main`; all other branches get previews only. Visible in Vercel project settings.
  - *Risk:* L3 path (`.github/workflows/`) PR landing without `infra-change` label triggers `path-guard` (when added in PR 16). *Mitigation:* not applicable yet — path-guard doesn't exist; this PR pre-dates it. The label is still applied here for hygiene/consistency.
- **Rollback / escalation plan:**
  - Rollback: `git revert <merge-sha>` on a follow-up PR. CI workflows revert cleanly; no runtime data to migrate.
  - Escalation: add label `needs-human`, tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — even though L3, the workflow patterns come directly from Design U6 + Tooling U5 reference shapes; they're well-known idioms, not novel infra. Reviewer evaluates plan alongside the diff. If any step requires deviation from the planned shape (e.g. an action behaves differently than documented), the implementer stops and updates the plan before continuing. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.