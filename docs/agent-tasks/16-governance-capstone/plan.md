# Plan: PR 16 — Governance capstone (path-guard, least-privilege, automerge, audit map)

> Issue: N/A (self-implemented infra; closes out the v4 plan's Phase I)
> Branch: `feat/governance-capstone`

- **Goal:** Close out the governance chassis. Add the three remaining enforcement/automation workflows (`path-guard` blocking, `least-privilege` informational, `automerge` for docs-only PRs), the `docs/AUDIT.md` cross-reference map that anchors every artifact this repo produces, and the three remaining Copilot study guides (audit-log, org-policies, content-exclusions). After this PR, the v4 Concept-to-Artifact Coverage Map should have no empty cells and every artifact has a known home.

- **Scope (paths/files):**
  - `docs/agent-tasks/16-governance-capstone/plan.md` (this file)
  - `.github/workflows/path-guard.yml` (new — blocking required check)
  - `.github/workflows/least-privilege.yml` (new — informational lint over workflow files)
  - `.github/workflows/automerge.yml` (new — auto-merge docs-only PRs after required checks)
  - `docs/AUDIT.md` (new — cross-reference of every artifact location)
  - `docs/COPILOT_STUDY/audit-log.md` (new)
  - `docs/COPILOT_STUDY/org-policies.md` (new)
  - `docs/COPILOT_STUDY/content-exclusions.md` (new)
  - `docs/WORKFLOWS.md` (update — flowchart + sequence + table; add audit-doc maintenance note)
  - `AGENTS.md` (small update — add a documentation invariant: "any new artifact type must be added to `docs/AUDIT.md` in the same PR")

- **Steps:**
  1. Add this plan file.
  2. Add `.github/workflows/path-guard.yml`:
     - **Trigger**: `pull_request` (`opened`, `synchronize`, `reopened`, `ready_for_review`, `labeled`, `unlabeled`) — labels affect the decision, so label events retrigger. Plus `workflow_dispatch` with `pr_number` input (validated `^[0-9]+$`).
     - **Skip Dependabot** (its update PRs touch `package.json` / lock files routinely; review handles).
     - **Skip non-agent-shaped PRs**: branch doesn't match `claude/**` or `agent/**` AND PR doesn't carry the `agent-task` label → skip with `::notice` and exit 0. Same detector as `agent-artifact-check.yml`.
     - **Permissions**: `contents: read`, `pull-requests: read`. No writes.
     - **Logic**: define protected-paths globs (`.github/workflows/**`, `.github/actions/**`, `.github/hooks/**`, `.github/agents/**`, `.github/aw/**`, `next.config.ts`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `tailwind.config.ts`). List changed files via `gh pr diff "$PR_NUMBER" --name-only`. If any matches and the PR doesn't carry `infra-change` → `::error` with the list of offending files and exit 1 (FAIL). Otherwise pass.
     - **Promotion to required**: documented in commit 9 (WORKFLOWS.md update) and as a separate UI step in the ruleset — call this out explicitly in the workflow file's header comment so reviewers know the activation path.
  3. Add `.github/workflows/least-privilege.yml`:
     - **Trigger**: `pull_request` filtered to `paths: ['.github/workflows/**', '.github/actions/**']` + `workflow_dispatch`. No need to run on PRs that don't touch workflow files.
     - **Skip Dependabot**.
     - **Permissions**: `contents: read`.
     - **Logic** (lint, informational): walk `.github/workflows/*.yml`; for each, parse with `yq`; verify (a) top-level `permissions:` block exists, (b) no top-level `contents: write` (must be per-job), (c) any `contents: write` job has an `if:` that gates on a label or branch. Emit findings as `::warning` annotations and a find-or-update PR comment (marker `<!-- least-privilege:summary -->`). Workflow always exits 0 (soft-rollout).
     - The script lives inline in the workflow on day one; if it grows past ~60 lines, extract to `scripts/lint-workflow-permissions.ts` in a follow-up PR (with `node:test` tests, mirroring `scripts/check-drift.ts`).
  4. Add `.github/workflows/automerge.yml`:
     - **Trigger**: `pull_request` (`opened`, `synchronize`, `reopened`, `ready_for_review`, `labeled`) + `check_suite: types: [completed]`.
     - **Skip Dependabot** (Dependabot has its own automerge configurable separately if needed).
     - **Permissions**: `contents: write`, `pull-requests: write` (only on the automerge job; baseline `contents: read`).
     - **Gate**: only act on PRs where every changed file matches `docs/**` OR `*.md` at repo root EXCEPT `README.md` (README touches sometimes accompany infra changes). Plus PR carries label `automerge-ok` (opt-in label so authors can disable) AND `agent-task` (this is meant to streamline agent PRs, not all docs PRs).
     - **Logic**: if eligible, call `gh pr merge "$PR_NUMBER" --auto --squash`. `--auto` queues the merge after all required checks pass; doesn't merge instantly. Document the GITHUB_TOKEN trade-off in the workflow comment: post-merge actions on `main` aren't retriggered by `GITHUB_TOKEN`, but for docs-only changes that's typically fine (no deploys needed for `docs/**`).
     - Workflow always exits 0; the merge happens (or doesn't) under branch protection rules.
  5. Add `docs/AUDIT.md` — cross-reference map. Sections, each a small Markdown table mapping "what" → "where":
     - **Plans and tasks** (per-task plan/decisions/memory under `docs/agent-tasks/<task-id>/`; PR-body plan between PLAN:BEGIN/END markers)
     - **Validation signals** (workflow runs URL pattern; eval-scorecard comment marker + artifact name; drift comment marker; conflict comment marker; least-privilege comment marker; artifact-check run logs)
     - **Handoffs and lessons** (multi-agent handoffs under `docs/handoffs/`; postmortems under `docs/agent-failures/`; extracted rules in `CLAUDE.md`/`copilot-instructions.md`)
     - **Policies and contracts** (`AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, path-scoped `CLAUDE.md` / `*.instructions.md`, `docs/MEMORY_POLICY.md`, `docs/WORKFLOWS.md`, `docs/PLAN_FIRST_VS_PLAN_EXEC.md`, `docs/AGENT_PLAYBOOK.md`, `docs/EVAL.md`)
     - **Hooks, firewall, MCP** (`.claude/settings.json`; dormant `.github/hooks/`; firewall study guide; `.vscode/mcp.json`)
     - **Skills and agents** (Claude skills + subagents; dormant Copilot prompts + custom agents)
     - **Routines and dormant workflows** (Claude Code Routine docs; gh-aw dormant configs; dormant CLI workflow; the multi-agent workflow's role)
     - **Screenshots** (`docs/screenshots/`)
     - **Audit-log access** (cross-link to `docs/COPILOT_STUDY/audit-log.md`).
     The doc is navigational — every section ≤10 lines. If a reader can't go from "where do eval scorecards live" to the answer in 30 seconds, this doc is failing its job.
  6. Add `docs/COPILOT_STUDY/audit-log.md`. In your own words: what the Copilot audit log captures (agent invocations, policy changes, seat assignments, content-exclusion blocks, MCP allow-list events); how to filter (event type, actor, date range, target repo); how to export (CSV/JSON via the org admin UI); retention (current GitHub default; cite the docs URL but rephrase the actual number in your own words at writing time).
  7. Add `docs/COPILOT_STUDY/org-policies.md`. In your own words: the Copilot policy screens (Settings → Copilot → Policies at org level); per-feature toggles (Chat, Coding agent, Inline suggestions, MCP allow-list, network egress); enable/disable scope (org-wide vs per-team); the precedence chain (enterprise → org → repo); how a "disabled" policy surfaces to a developer (chat refuses, CLI errors, etc.).
  8. Add `docs/COPILOT_STUDY/content-exclusions.md`. In your own words: content exclusion patterns (glob-based, configured at org or repo level); what the exclusion does (Copilot skips matched files when computing suggestions); the expected block message developers see; the difference between "Copilot won't suggest from this file" vs "Copilot can't read this file" (it's the former — the file is still readable in the editor); common patterns we'd exclude in this repo (secrets directories, generated lock files if we wanted to suppress noise — none currently configured).
  9. Update `docs/WORKFLOWS.md`:
     - Flowchart: add three new nodes — `PATH_GUARD[path-guard.yml]` connected from `PR_OPEN` outputting a new `REQUIRED_CHECK_PATHGUARD{{Required: path-guard}}` (after promotion); `LEAST_PRIV[least-privilege.yml]` connected from `PR_OPEN` filtered on workflow-paths edits, outputting `PR_COMMENT`; `AUTOMERGE[automerge.yml]` connected from `CHECK_SUITE` completion outputting `MERGE[/Merge to main/]`.
     - Sequence diagram: add `PathGuard` participant in the par-block alongside Gate / CI / Review / Drift / Conflict.
     - Per-workflow table: three new rows.
     - **Required status checks section**: list `path-guard / <job-name>` as a check that BECOMES required after a separate UI ruleset update — be explicit that the promotion is not happening in this PR's code, but in the org ruleset UI after merge.
     - Add a "Documentation invariants — audit map" subsection noting that every new artifact type must be added to `docs/AUDIT.md` in the same PR (mirror of the `docs/WORKFLOWS.md` same-PR rule).
  10. Update `AGENTS.md`: in "Documentation invariants", add a third bullet matching the new audit-map invariant.

- **Success criteria (verifiable):**
  - [ ] Required CI checks pass on this PR (`plan-gate`, `agent-ci`, `agent-artifact-check`; drift/eval/conflict-detect informational).
  - [ ] `path-guard.yml` parses (`yq eval . .github/workflows/path-guard.yml`) and runs on this PR (this PR carries `infra-change`, so the check itself passes).
  - [ ] `least-privilege.yml` runs on this PR (it touches workflow files), reports findings or "clean" via comment with marker `<!-- least-privilege:summary -->`, and exits 0 either way.
  - [ ] `automerge.yml` parses; smoke-tested post-merge by opening a docs-only PR labelled `automerge-ok` + `agent-task` — it queues for auto-merge once required checks pass.
  - [ ] `docs/AUDIT.md` exists and covers all nine sections; a reviewer can locate any artifact mentioned in the v4 Concept-to-Artifact Coverage Map.
  - [ ] All three new study guides exist; each covers its listed points in the author's own words (no Microsoft Learn copy-paste).
  - [ ] `docs/WORKFLOWS.md` flowchart + sequence + table + required-checks list reflect the three new workflows.
  - [ ] `AGENTS.md` Documentation invariants has the audit-map bullet.
  - [ ] **Post-merge UI step (manual, documented in PR description Evidence section)**: promote `path-guard / <job-name>` to required status check in the `protect-main` ruleset. Verify by opening a deliberately-mislabeled agent PR (`claude/test-pathguard` touching `package.json` without the `infra-change` label) — required check should fail and merge should be blocked.
  - [ ] **Audit-map regression check**: after merge, every doc/artifact referenced in v4 plan's Concept-to-Artifact Coverage Map has an entry in `docs/AUDIT.md`.

- **Risks + mitigations:**
  - *Risk:* PR 16 is the heaviest infra PR (three new workflows + audit doc + three study guides + AGENTS.md edit). Review fatigue blurs distinct concerns.
    *Mitigation:* If the diff feels overwhelming at review time, the implementer can split into PR 16a (path-guard + least-privilege + WORKFLOWS update — required for plan completion) and PR 16b (automerge + AUDIT.md + study guides + AGENTS.md). Default is single PR for capstone framing; split is a fine option, flag at commit 4.
  - *Risk:* Promoting `path-guard` to required check immediately could break in-flight Dependabot PRs that touch `package.json` (they're exempt by the workflow's `if:`, but the required-check status would still need to exist on the PR — Dependabot PRs won't run the workflow at all due to actor skip, so the check never reports, which under "Require all configured checks pass" blocks merge).
    *Mitigation:* Two-step rollout. **Step 1 (this PR)**: workflow added but not promoted. **Step 2 (post-merge UI)**: promote to required after verifying Dependabot's behavior — if Dependabot PRs land in "no required check status" purgatory, configure the ruleset's "Skip if not run" option, OR re-tune the workflow to ALWAYS post a status (even on skip) via `actions/github-script` posting a synthetic status. Decide which based on observed behavior. Document the chosen approach in path-guard's header comment.
  - *Risk:* `least-privilege.yml`'s inline lint script grows past ~60 lines and becomes hard to test.
    *Mitigation:* The plan calls out the extraction trigger explicitly. Day-one inline is fine; on the second tweak, extract to `scripts/lint-workflow-permissions.ts` with `node:test` cases (mirror `scripts/check-drift.ts`).
  - *Risk:* `automerge.yml` could auto-merge a PR that broke a documentation invariant (e.g., a docs change that contradicts a rule in CLAUDE.md without updating CLAUDE.md). Required checks don't catch semantic mistakes.
    *Mitigation:* `automerge.yml` requires the explicit `automerge-ok` label — author opts in per-PR. The label functions as the "I've eyeballed this docs-only PR and it's truly trivial" affirmation. Removing the label disables automerge for that PR.
  - *Risk:* `docs/AUDIT.md` is a moving target that decays the moment a new artifact type lands and isn't added.
    *Mitigation:* AGENTS.md gains the "any new artifact must update AUDIT.md in the same PR" invariant in commit 10. Reviewers flag PRs that introduce new artifact types without an AUDIT.md update — same-PR-or-it-rots, mirroring the WORKFLOWS.md rule.
  - *Risk:* The three study guides cover ground that no one will read until needed. Drafting them by rephrasing Microsoft Learn screenshots is necessary but lossy; the docs may misremember details.
    *Mitigation:* Each guide ends with the canonical Microsoft Learn URL where the source-of-truth lives, dated at writing time. The guide's job is "what to look for"; the URL's job is "exact text". Updating the guide is a quarterly task; until then, the URL is the fallback.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="PR 16 governance capstone misfiring"`
  - Soft rollback (preferred for partial failures):
    - If `path-guard.yml` blocks legitimate PRs: revert promotion in the ruleset UI; workflow stays in repo, informational only.
    - If `least-privilege.yml` floods PRs with false positives: delete the workflow file in a follow-up; lint can return as a script-only `pnpm lint:workflows` later.
    - If `automerge.yml` merges something it shouldn't: revert merged commit via `agent-rollback.yml`; delete the automerge workflow; investigate label opt-in flow.
  - Escalation: add label `needs-human` and tag @mafaq229. Use the four-field template from `docs/AGENT_PLAYBOOK.md`.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — adds three workflows under `.github/workflows/`; PR carries `infra-change`)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan-first — `path-guard` introduces the first non-informational gating workflow (slated for required-check promotion); `automerge` introduces autonomous merges. Both are higher-risk than the other workflows we've added. The plan lays out the rollout (two-step promotion for path-guard, opt-in label for automerge) so the user can sanity-check the staging before any YAML is drafted. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.