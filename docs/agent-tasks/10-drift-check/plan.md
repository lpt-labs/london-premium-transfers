# Plan: PR 10 — Drift detection

> Issue: N/A (self-implemented infra; no tracking issue)
> Branch: `feat/drift-check`

- **Goal:** Detect when a PR's diff strays outside the paths listed in its plan's *Scope (paths/files)* section, and surface the drift as a PR comment + `agent-drift` label so reviewers see scope creep before merge.

- **Scope (paths/files):**
  - `docs/agent-tasks/10-drift-check/plan.md` (this file)
  - `scripts/check-drift.ts` (new — pure logic)
  - `scripts/check-drift.test.ts` (new — `node:test` unit tests; no new dependency)
  - `.github/workflows/drift-check.yml` (new)
  - `docs/WORKFLOWS.md` (update: per-workflow table row + flowchart node)
  - `package.json` (add a `test:drift` script that runs `node --test scripts/check-drift.test.ts`)

- **Steps:**
  1. Add this plan file.
  2. Add `scripts/check-drift.ts` — pure function `findDrift({ scope: string[], changed: string[] }) → { extra: string[], missingTouched: string[] }`. Uses `minimatch`-style glob matching written by hand (no new dep — small wrapper around `RegExp` derived from globs `*`, `**`, trailing `/`). Reads stdin JSON, writes stdout JSON; logic separated from I/O so it's unit-testable.
  3. Add `scripts/check-drift.test.ts` using Node 24's built-in `node:test` runner — covers: exact match, glob prefix, `**` recursion, file in scope but not touched (informational only), file touched but out of scope (drift), empty scope (no-op).
  4. Add `package.json` script `"test:drift": "node --test scripts/check-drift.test.ts"`. Wire it into the existing `agent-ci.yml`? **No** — keep it as a standalone command for now; if the test suite grows we can add a real CI job later (convention-over-automation per project rules).
  5. Add `.github/workflows/drift-check.yml`:
     - Triggers: `pull_request` (`opened`, `synchronize`, `reopened`, `ready_for_review`, `edited`), `workflow_dispatch`.
     - Skip Dependabot (`if: github.actor != 'dependabot[bot]'`).
     - Permissions: `contents: read`, `pull-requests: write`, `issues: write` (only on the comment/label job).
     - Step 1: parse PR body for the `- **Scope (paths/files):**` bullet block, extract globs into a JSON array. Pass body via `env`, never interpolate into shell.
     - Step 2: list changed files via `gh pr diff <n> --name-only` (or `git diff --name-only origin/main...HEAD`).
     - Step 3: pipe both into `node scripts/check-drift.ts`, get JSON back.
     - Step 4: if `extra.length > 0`, post a find-or-update comment (marker `<!-- drift-check:summary -->`) listing the out-of-scope files and add label `agent-drift`. If empty, remove the label if previously present and post (or update) a "✅ No drift" comment.
     - Step 5: if Scope is empty/missing in the PR body, emit a `::notice` and exit 0 (don't fail — plan-gate handles missing Plan separately).
     - Step 6: workflow always exits 0; drift is a label + comment signal, not a blocking failure on day one (matches the soft-rollout pattern used for `agent-artifact-check`).
  6. Update `docs/WORKFLOWS.md`: add row to per-workflow table, add node to flowchart connected from `PR_OPEN` → `DRIFT[drift-check.yml]` → `PR_COMMENT` and `LABEL_DRIFT`, sequence diagram update if it fires on PR events.

- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, `agent-ci`, `agent-artifact-check`).
  - [ ] `pnpm test:drift` passes locally; `node:test` runner reports all cases green.
  - [ ] On a synthetic PR that touches a file outside its declared Scope, the workflow posts a drift comment and applies the `agent-drift` label.
  - [ ] On a synthetic PR where every changed file matches a Scope glob, the workflow posts a "no drift" comment and does not apply the label.
  - [ ] A Dependabot PR is skipped entirely.
  - [ ] `docs/WORKFLOWS.md` includes the new workflow's row and flowchart node.

- **Risks + mitigations:**
  - *Risk:* Glob parser written by hand is wrong on edge cases (`{a,b}` braces, `?` single-char, leading `!` negation).
    *Mitigation:* Support only the subset actually used in plan files: `*`, `**`, trailing `/`. Document the supported subset at the top of `check-drift.ts`. Reject unsupported globs with a clear error so the human can simplify the Scope rather than silently getting a wrong answer.
  - *Risk:* Workflow blocks legitimate PRs that *intentionally* expand scope mid-task.
    *Mitigation:* Drift is informational (comment + label), never a failing status. Reviewer can update the PR body's Scope, push a new commit, and the workflow re-runs.
  - *Risk:* Parsing the Scope block from PR body breaks on unusual Markdown (extra indentation, missing colon, etc.).
    *Mitigation:* Tolerant regex with a clear fallback — if parsing fails, emit `::notice` and exit 0 rather than guessing. Reviewers see the notice in the run log.
  - *Risk:* `node:test` files end up in the Next.js build.
    *Mitigation:* Exclude `scripts/**` from `tsconfig.json`'s `include` (or add `scripts/**` to `exclude`). Tests live next to the script; not imported by app code.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="PR 10 drift-check workflow misfiring"`
  - Soft rollback: delete `.github/workflows/drift-check.yml` in a follow-up PR; the script + tests can stay (no runtime cost).
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — reversible (workflow non-blocking on day one; script + tests have zero runtime impact on the app). Reviewing the YAML + the pure-logic script together is cheaper than two review rounds. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.