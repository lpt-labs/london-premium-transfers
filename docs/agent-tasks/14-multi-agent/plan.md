# Plan: PR 14 — Multi-agent orchestration

> Issue: N/A (self-implemented infra; PR 14's *acceptance test* is labelling a small follow-up issue with `multi-agent` after merge — the smoke-test target is separate from this PR's tracking)
> Branch: `feat/multi-agent`

- **Goal:** Add two named agents — `implementer` (writes code; scoped to app/components/lib) and `a11y-reviewer` (read-only; reviews .tsx/.html for accessibility) — wired together by a single `multi-agent.yml` workflow that fires both in sequence when an issue is labelled `multi-agent`. Active Claude subagents do the work; dormant Copilot custom-agent files sit alongside as parity references. Demonstrates cross-job output handoff, subagent role separation, and an audit-trail handoff log.

- **Scope (paths/files):**
  - `docs/agent-tasks/14-multi-agent/plan.md` (this file)
  - `.claude/agents/implementer.md` (new — active)
  - `.claude/agents/a11y-reviewer.md` (new — active)
  - `.github/agents/implementer.agent.md` (new — dormant Copilot)
  - `.github/agents/a11y-reviewer.agent.md` (new — dormant Copilot)
  - `.github/agents/planner.agent.md` (new — dormant Copilot; rename + schema migration of the older `plan.agent.md`)
  - `.github/agents/implement.agent.md` (DELETED — superseded by `implementer.agent.md`; was duplicate role under pre-spec schema)
  - `.github/agents/plan.agent.md` (DELETED — renamed and migrated to `planner.agent.md`)
  - `.github/workflows/multi-agent.yml` (new — active)
  - `docs/handoffs/README.md` (new — handoff log format)
  - `docs/COPILOT_STUDY/org-custom-agents.md` (new — study guide on org-scoped Copilot custom agents)
  - `docs/WORKFLOWS.md` (update — add multi-agent.yml to flowchart, table, sequence; add dormant Copilot agent files to "Dormant configurations" subsection)

- **Steps:**
  1. Add this plan file.
  2. Add `.claude/agents/implementer.md`. Frontmatter `name: implementer`, `description: …`, `tools: [Read, Write, Edit, Glob, Grep, Bash]`. Body: scoped to `app/**`, `components/**`, `lib/**`; required reading (AGENTS.md, target issue body, path-scoped CLAUDE.md files); output discipline (surgical, plan-first, no scope creep, match existing patterns from `components/Hero.tsx` family); when to refuse (path outside scope, scope unclear, plan unwritten). Format mirrors the existing `.claude/agents/planner.md` from PR 3.
  3. Add `.claude/agents/a11y-reviewer.md`. Frontmatter `name: a11y-reviewer`, `description: …`, `tools: [Read, Grep, Glob]` — explicitly NO write tools. Body: scoped to `**/*.tsx`, `**/*.html`; required reading (AGENTS.md, target PR diff, `docs/EVAL.md` for axe thresholds); output schema (a single review comment in a documented format — sections: serious issues, moderate issues, suggestions); discipline (no file edits ever, no opinion-style nits, distinguish blockers from suggestions, reference WCAG criteria when relevant).
  4. **Reconcile pre-spec dormant agents in the same commit as the new ones.** The older `.github/agents/implement.agent.md` and `.github/agents/plan.agent.md` (added in PR 3) use the VS Code Copilot Chat custom-mode shape (`tools: ['search', 'edit/editFiles', …]`), which is not the canonical gh custom-agent schema. Resolve the duplication and schema drift in one move:
     - DELETE `implement.agent.md` — superseded by `implementer.agent.md` (same role, different name); keeps parity 1:1 with `.claude/agents/implementer.md`.
     - RENAME `plan.agent.md` → `planner.agent.md` and migrate it to the canonical schema, so the dormant file matches `.claude/agents/planner.md` 1:1.
     - ADD `.github/agents/implementer.agent.md` — DORMANT Copilot custom agent. Frontmatter per the canonical gh custom-agent spec (https://docs.github.com/en/copilot/reference/custom-agents-configuration) verified at implementation time: `description:` (required), `tools: [read, edit, search, execute]` using the spec's aliased tool vocabulary. The spec has no `applyTo:` / path-scoping field, so path discipline (`app/**`, `components/**`, `lib/**`) is enforced behaviourally in the body. Body mirrors the Claude subagent's prose. Header comment marks DORMANT, dates the schema version, and links to `docs/COPILOT_STUDY/org-custom-agents.md`.
     - ADD `.github/agents/planner.agent.md` — DORMANT, read-only. Canonical schema: `description:` (required), `tools: [read, search, web]`. Body mirrors `.claude/agents/planner.md`.
  5. Add `.github/agents/a11y-reviewer.agent.md` — DORMANT, read-only Copilot agent. Frontmatter per the same canonical spec: `description:` (required), `tools: [read, search]` — no `edit`, no `execute`. Path scoping (`**/*.tsx`, `**/*.html`) enforced behaviourally in the body, same as the implementer file. Same DORMANT header pattern.
  6. Add `docs/handoffs/README.md` — handoff log format. One Markdown file per multi-agent run at `docs/handoffs/<date>-<issue-number>-<slug>.md` with sections: Trigger (issue + label), Implementer (agent ID + commits + PR opened), Reviewer (agent ID + review comment URL + key findings), Outcome (merged / iterated / abandoned). Index by date in the README's body. Template lives at `docs/handoffs/_template.md`.
  7. Add `.github/workflows/multi-agent.yml`:
     - **Trigger**: `issues: types: [labeled]`, with `if: github.event.label.name == 'multi-agent'`. Plus `workflow_dispatch` with `issue_number` input for manual reruns.
     - **Permissions baseline**: `contents: read`; per-job elevations.
     - **Concurrency**: group on issue number; cancel in-progress.
     - **Job 1 — implementer**:
       - `permissions: { contents: write, pull-requests: write, issues: write, id-token: write }`.
       - Checkout main; setup Node 24 + pnpm (Corepack pattern from `agent-ci.yml`).
       - Invoke `anthropic-ai/claude-code-action` (SHA-pinned + version comment) with `anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}` and a directed `system_prompt:` that loads `.claude/agents/implementer.md` and references the labelled issue's body. Target branch `multi-agent/<issue-number>`.
       - Output `pr_number` via a `gh pr list --head "multi-agent/<issue-number>" --json number --jq '.[0].number'` step; brief retry-with-sleep loop (~30 s total) to accommodate push propagation.
     - **Job 2 — a11y-reviewer**:
       - `needs: [implementer]`, `if: needs.implementer.outputs.pr_number != ''`.
       - `permissions: { contents: read, pull-requests: write, issues: read }`.
       - Checkout the implementer's branch; setup Node.
       - Invoke `anthropic-ai/claude-code-action` again with a directed `system_prompt:` that loads `.claude/agents/a11y-reviewer.md` and points it at PR `${{ needs.implementer.outputs.pr_number }}`. Reviewer posts a single review comment using a marker `<!-- multi-agent:a11y-review -->`; does NOT modify files.
     - **Job 3 — handoff log**:
       - `needs: [implementer, a11y-reviewer]`, `if: always() && needs.implementer.outputs.pr_number != ''`.
       - Composes the handoff log file under `docs/handoffs/<date>-<issue-number>-<slug>.md` and commits it to the same `multi-agent/<issue-number>` branch (so it's part of the implementer's PR — single audit trail).
  8. Add `docs/COPILOT_STUDY/org-custom-agents.md`. In your own words: what an org-scoped custom agent is (visible across every repo in the org, definable in Org Settings → Copilot → Agents); how it differs from a repo-scoped agent (one is per-repo file in `.github/agents/`, the other lives in org settings UI and applies broadly); the trade-offs (org-scoped is consistent but harder to iterate; repo-scoped is closer to the code); a short walkthrough of the Org Settings → Copilot → Agents UI path; one paragraph noting our parallel use of Claude subagents in `.claude/agents/`.
  9. Update `docs/WORKFLOWS.md`:
     - Flowchart: add `LABEL_MULTI_AGENT([Issue labeled multi-agent])` trigger → `MULTI_AGENT[multi-agent.yml]` workflow → outputs `BOT_PR` (existing) and `PR_REVIEW_COMMENT[/A11y review comment/]`.
     - Sequence diagram: append a new ladder showing label → multi-agent → (implementer job opens PR) → (reviewer job posts review comment) → (handoff job commits log).
     - Per-workflow table: new row for `multi-agent.yml` with trigger / permissions / produces / required-check = "n/a".
     - Dormant configurations subsection: add `implementer.agent.md` and `a11y-reviewer.agent.md` alongside the existing entries from PR 11b + PR 13.

- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, `agent-ci`, `agent-artifact-check`, drift/eval informational).
  - [ ] `.claude/agents/implementer.md` and `.claude/agents/a11y-reviewer.md` validate as well-formed Markdown with frontmatter; loaded successfully when invoked.
  - [ ] `.github/agents/implementer.agent.md` and `.github/agents/a11y-reviewer.agent.md` parse against the current GitHub custom-agent schema (visual check against `https://github.com/githubnext/gh-aw` or the gh docs at implementation time).
  - [ ] `.github/workflows/multi-agent.yml` parses (`yq eval . .github/workflows/multi-agent.yml`); all jobs declare explicit `permissions:` blocks; third-party actions SHA-pinned + version-commented.
  - [ ] **Smoke test** (post-merge): label a small follow-up issue (e.g., "Add favicon and robots.txt") with `multi-agent`. The workflow fires, opens a PR on `multi-agent/<issue-number>`, posts an a11y review comment on that PR, and commits a handoff log entry in `docs/handoffs/`. The PR's CI checks pass.
  - [ ] `docs/handoffs/README.md` exists with format spec + template + index pointer.
  - [ ] `docs/COPILOT_STUDY/org-custom-agents.md` covers all four points (what an org-scoped agent is, how it differs from repo-scoped, trade-offs, UI walkthrough) in the author's own words.
  - [ ] `docs/WORKFLOWS.md` flowchart + sequence + table all updated; dormant Copilot agent files appear in the dormant subsection.

- **Risks + mitigations:**
  - *Risk:* `anthropic-ai/claude-code-action`'s exact output shape (does it emit `pr_number` as a step output? where does the URL surface?) is undocumented territory for us — guessing wrong wastes Anthropic credits on every run.
    *Mitigation:* Implementer pauses at commit 7 to read the action's current README and pick the canonical output approach (step output if it exists; `gh pr list --head` fallback otherwise). Document the chosen approach in a comment block in the workflow file.
  - *Risk:* Cross-job handoff timing — pushes from the implementer job may not be visible to `gh pr list` immediately.
    *Mitigation:* Brief retry-with-sleep loop bounded at ~30 s in the PR-number-capture step. If the loop exhausts, emit `::error` and exit — the reviewer job then short-circuits via the `needs.implementer.outputs.pr_number != ''` guard.
  - *Risk:* Anthropic credit burn — every multi-agent run costs real money; runaway label loops could rack up cost.
    *Mitigation:* Workflow concurrency group keyed by issue number with `cancel-in-progress: true` prevents duplicate runs on rapid re-labelling. Document the credit footprint of one run in `docs/handoffs/README.md` so cost is visible.
  - *Risk:* The a11y-reviewer subagent could be talked into editing files via prompt injection from a hostile PR body.
    *Mitigation:* The Claude subagent file (`a11y-reviewer.md`) explicitly disallows write tools in its `tools:` frontmatter. The workflow's job-level `permissions` block grants `pull-requests: write` for the comment, but checkout is read-only and there's no `contents: write`. Defence in depth: tool list (subagent) + permissions block (workflow).
  - *Risk:* The dormant Copilot files become a maintenance burden (schema drift in the gh-aw / gh agents spec).
    *Mitigation:* Header comment in each dormant file dates the schema version it was written against. If the spec moves, a follow-up `infra-change` PR re-syncs. Not blocking on day one.
  - *Risk:* The handoff log committed by job 3 lands as an extra commit on the implementer's PR branch — pushes from `GITHUB_TOKEN` won't retrigger CI checks on that PR, leaving stale results.
    *Mitigation:* Job 3 either (a) commits with a PAT/App token if one is available, or (b) the workflow file documents that the handoff log push is informational and any required-check re-run is the reviewer's responsibility. Pick (b) on day one — fewer moving parts; revisit if it becomes a friction point.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="PR 14 multi-agent workflow misfiring or burning credits"`
  - Soft rollback: delete `.github/workflows/multi-agent.yml` only (subagent files + dormant Copilot files + handoff format can stay — zero CI cost). Re-add later in a smaller infra PR.
  - Hard stop: remove the `multi-agent` label from any open issues to prevent further fires.
  - Escalation: add label `needs-human` and tag @mafaq229. Reference the run URL in the escalation comment per the four-field template.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — touches `.github/workflows/multi-agent.yml` and `.github/agents/`; PR carries `infra-change`)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — reversible (workflow can be deleted; agent files have no runtime cost). The active workflow is the riskiest piece; reviewing it alongside the subagent definitions and the dormant Copilot pair is cheaper than splitting across two review rounds. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.