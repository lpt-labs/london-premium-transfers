# Plan: PR 15b — conflict-detect workflow + WORKFLOWS doc

> Issue: N/A (hand-written L3 follow-up to PR 15 / issue #42; carries the infra pieces the multi-agent run on /fleet couldn't include)
> Branch: `feat/conflict-detect`

- **Goal:** Add `conflict-detect.yml` — an informational workflow that flags when two open PRs touch the same file. Posts a find-or-update PR comment listing the overlapping PR + paths and applies an `agent-conflict` label so reviewers see the collision before merging. Soft-rollout pattern: workflow always exits 0; promotion to required check is a future UI step after a few real PRs have exercised it cleanly. Closes out the infra side of the original PR 15 plan that the multi-agent's implementer subagent couldn't touch.

- **Scope (paths/files):**
  - `docs/agent-tasks/15b-conflict-detect/plan.md` (this file)
  - `.github/workflows/conflict-detect.yml` (new)
  - `docs/WORKFLOWS.md` (update — flowchart + sequence + per-workflow table)
  - `docs/AGENT_PLAYBOOK.md` (optional — short "Conflict detection" subsection)

- **Steps:**
  1. Add this plan file.
  2. Add `.github/workflows/conflict-detect.yml`:
     - **Trigger**: `pull_request` (`opened`, `synchronize`, `reopened`, `ready_for_review`) + `workflow_dispatch` with `pr_number` input (validated `^[0-9]+$`).
     - **Skip Dependabot**: `if: github.actor != 'dependabot[bot]'` — dep PRs routinely overlap on `package.json` / lock files; the overlap is expected.
     - **Permissions baseline**: `contents: read`. Comment/label job elevated to `pull-requests: write, issues: write`.
     - **Logic**:
       - `compute` job: list this PR's changed files via `gh pr view <n> --json files`; list all other open PRs via `gh pr list --state open --json number,headRefName`; for each other PR compute file-set intersection using `comm -12 <(sort) <(sort)`. Emit `skipped`, `overlap_count`, `overlap_summary` (Markdown table) as step outputs.
       - `report` job (`needs: [compute]`, `if: needs.compute.outputs.skipped == 'false'`): idempotent `gh label create agent-conflict` (mirroring drift-check.yml's pattern); find-or-update comment with marker `<!-- conflict-detect:summary -->`; apply/remove `agent-conflict` label based on overlap_count.
     - **Concurrency** group keyed on PR number with `cancel-in-progress: true`.
     - **`timeout-minutes: 5`** safety cap.
     - **Always exits 0** (informational, never blocks merge).
     - PR-controlled values flow through `env:`; mirror `plan-gate.yml`'s shell-safety pattern.
  3. Update `docs/WORKFLOWS.md`:
     - Flowchart: add `CONFLICT[conflict-detect.yml]` node connected from `PR_OPEN` → outputs `PR_COMMENT` (existing) and a new `LABEL_CONFLICT[/agent-conflict label/]`.
     - Sequence diagram: add `Conflict` participant in the par-block alongside `Gate`, `CI`, `Review`, `CodeQL`, `Vercel`.
     - Per-workflow table: new row (trigger / permissions / produces / required-check = "Informational").
     - "Plan-gate exemption" sibling paragraph: note `conflict-detect` also skips Dependabot for the same overlap-is-the-rule reason.
  4. (Optional) Add a "Conflict detection" subsection to `docs/AGENT_PLAYBOOK.md` explaining what the `agent-conflict` label means, how reviewers clear it (rebase / split / coordinate with the other PR author), and the soft-rollout posture (informational, never blocks).

- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, `agent-ci`, `agent-artifact-check`; drift/eval informational).
  - [ ] `conflict-detect.yml` parses (`yq eval . .github/workflows/conflict-detect.yml`).
  - [ ] Third-party actions SHA-pinned + version-commented; first-party (`actions/*`) on major-version tags.
  - [ ] `docs/WORKFLOWS.md` includes the new flowchart node, sequence participant, and table row.
  - [ ] **Post-merge smoke test**: open two follow-up PRs that each touch a shared file (e.g., both touching `docs/AGENT_PLAYBOOK.md`). Verify each gets a `<!-- conflict-detect:summary -->` comment listing the other PR + overlapping path, and that the `agent-conflict` label is applied to both. Close one; on the other's next sync, the comment updates to "no conflicts" and the label clears.

- **Risks + mitigations:**
  - *Risk:* False positives on "everyone-edits" files like `docs/AGENT_PLAYBOOK.md`, `docs/WORKFLOWS.md`, `README.md`.
    *Mitigation:* Informational-only on day one — never blocks merge. Reviewers calibrate. If false-positive rate becomes annoying, a follow-up adds an opt-out path list; no premature complexity now.
  - *Risk:* `gh pr list --state open` runtime grows with active-PR count.
    *Mitigation:* At our scale (typically ≤10 open PRs), the loop runs in seconds. `timeout-minutes: 5` safety net.
  - *Risk:* Label-application race when two PRs both update simultaneously and one adds the label while the other tries to remove it.
    *Mitigation:* Each run is keyed to the triggering PR's number; concurrency group cancels in-flight runs for the same PR. Cross-PR races are tolerable because the workflow re-runs on the next `synchronize` event.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="PR 15b conflict-detect misfiring"`
  - Soft rollback: delete `.github/workflows/conflict-detect.yml` in a follow-up PR; the `agent-conflict` label can stay (zero cost).
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — touches `.github/workflows/`; PR carries `infra-change`)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — informational workflow with strict soft-rollout; reviewable in a single round. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
