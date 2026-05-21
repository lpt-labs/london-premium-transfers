# Plan: Stabilise foundation — pin Node/pnpm versions and add Dependabot

<!--
  This file's section structure mirrors `.github/pull_request_template.md`
  intentionally. Copy the contents from "- **Goal:**" through the end of the
  rollback section into the `## Plan (required)` block of the PR description
  (or let the `sync-plan-to-pr.yml` workflow do it automatically by placing
  this file under `docs/agent-tasks/<task-id>/plan.md` and pushing — see
  PLAN:BEGIN / PLAN:END markers in the PR template).

  Manual paste also works as a fallback if the workflow ever fails.

  Keep this file accurate as the task evolves — it's the durable source of
  truth that drift-check (PR 10) compares against the actual diff.
-->

> Issue: [#11](https://github.com/lpt-labs/london-premium-transfers/issues/11) · [#13](https://github.com/lpt-labs/london-premium-transfers/issues/13)
> Branch: `chore/stabilise-foundation`

- **Goal:** Pin the Node.js and pnpm runtime versions so every developer and CI runner builds on the same toolchain, then add Dependabot so security and version-update PRs flow in automatically, and exempt `dependabot[bot]` from the `plan-gate` PR requirement (its changelog is its plan).
- **Scope (paths/files):**
  - `docs/agent-tasks/6.5-stabilise-foundation/plan.md`
  - `.nvmrc`
  - `package.json` (add `packageManager` and `engines` fields — no dependency changes)
  - `.github/dependabot.yml`
  - `.github/workflows/plan-gate.yml` (add `dependabot[bot]` exemption to job `if:`)
- **Steps:**
  1. Save this plan to `docs/agent-tasks/6.5-stabilise-foundation/plan.md` as the first commit on `chore/stabilise-foundation`.
  2. Pin Node.js version via `.nvmrc` (`24`) and pnpm version via `packageManager` field in `package.json`; add `engines` constraints (issue #11).
  3. Add `.github/dependabot.yml` with `npm` ecosystem (weekly, limit 5, `dependencies` label) and `github-actions` ecosystem (weekly, `dependencies` + `infra-change` labels). Ensure `dependencies` label exists before merge (issue #13).
  4. Update `.github/workflows/plan-gate.yml`: add `github.actor != 'dependabot[bot]'` to the job-level `if:` condition, with inline comment explaining the narrow exemption (issue #13).
- **Success criteria (verifiable):**
  - [ ] Required CI checks pass.
  - [ ] `.github/dependabot.yml` is valid YAML and parses without error (visible in Insights → Dependency Graph → Dependabot tab after merge).
  - [ ] `plan-gate.yml` job `if:` reads `github.event_name == 'pull_request' && github.actor != 'dependabot[bot]'`.
  - [ ] An inline comment in `plan-gate.yml` explains the Dependabot exemption so a future reader doesn't remove it.
  - [ ] `package.json` `packageManager` field matches `pnpm@11.0.0` (or current pnpm 11 patch); `engines.node` is `>=24.0.0`, `engines.pnpm` is `>=11.0.0`.
  - [ ] `.nvmrc` exists with value `24`.
  - [ ] `dependencies` label exists in the repo (created via `gh label create` if absent).
  - [ ] No files modified outside the scope list above.
- **Risks + mitigations:**
  - *Risk:* Dependabot opens too many PRs at once and clogs the review queue. *Mitigation:* `open-pull-requests-limit: 5` on npm ecosystem; `github-actions` bumps are less frequent.
  - *Risk:* `github-actions` ecosystem PRs carry the `infra-change` label, triggering L3 review requirements once `path-guard` lands. *Mitigation:* this is intentional — action bumps touch `.github/workflows/**` and belong in the L3 path.
  - *Risk:* Broadening plan-gate exemption to `*[bot]` would silently exempt unknown automation. *Mitigation:* exemption is narrowly scoped to `dependabot[bot]` only, as specified in the issue.
  - *Risk:* Pinning `packageManager` to an exact pnpm patch version may conflict with a developer's locally installed pnpm via corepack. *Mitigation:* corepack auto-downloads the pinned version; Dependabot will keep the pin current.
- **Rollback / escalation plan:**
  - Rollback: `git revert <merge-sha>` on a follow-up PR. Dependabot stops opening PRs once `.github/dependabot.yml` is gone; `packageManager`/`engines` revert to absent; plan-gate exemption reverts to requiring a Plan from all authors.
  - Escalation: add label `needs-human`, tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — the changes are well-defined by the issue specifications, fully reversible (revert removes config), and small enough that reviewing plan alongside the diff is more efficient than an extra round trip. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
