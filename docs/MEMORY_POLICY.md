# Memory policy

How agent memory is stored, retained, and pruned across the lifetime of a task. This file is the source of truth; the `docs/agent-tasks/_template/` files (`plan.md`, `memory.md`, `decisions.md`) are the shape that implements it.

For *where* artifacts live by SDLC stage, see the "SDLC stage → artifact mapping" table in [`../AGENTS.md`](../AGENTS.md). For *what* workflow artifacts look like (the `logs-<run-id>-<sha>` naming rule), see [`WORKFLOWS.md`](WORKFLOWS.md).

## The three tiers

Memory in this repo lives in one of three tiers, distinguished by **lifespan** and **location**.

| Tier | Where it lives | Lifespan | Pruned? |
| --- | --- | --- | --- |
| **Short-term** | The `## Plan (required)` block in the PR description | PR opened → PR merged or closed | Discarded with the PR |
| **Long-term** | `docs/agent-tasks/<task-id>/memory.md` and `decisions.md` | Committed to the repo; retained after the task closes | `memory.md` trimmed at close; `decisions.md` never pruned |
| **External** | Links from the PR or the task files to GitHub Actions runs, uploaded artifacts (`logs-<run-id>-<sha>`), Vercel preview deployments, and tracking issues | Bounded by the external system's retention (GitHub Actions artifacts: 90 days by default; Vercel previews: until the PR is closed) | Out of our control — treat as ephemeral and copy anything load-bearing into `decisions.md` before the external link rots |

### Short-term: the PR's `## Plan` block

The `## Plan (required)` section of the PR description is the agent's working memory for the duration of the review. It states the Goal, Scope, Steps, Success criteria, Risks, and Rollback. `plan-gate.yml` enforces that it exists and is non-empty before merge.

This block is **discarded** when the PR closes — GitHub keeps the text on the PR forever, but nothing in the repo or in CI reads it after merge. Don't put facts you'll need next month here; put them in `decisions.md`.

### Long-term: `memory.md` and `decisions.md`

Every non-trivial task gets a folder under `docs/agent-tasks/<task-id>/` containing three files (copy from `_template/`):

- **`plan.md`** — the same plan as the PR description, committed to the repo so the diff is reviewable and the plan survives even if the PR description is later edited. Source of truth for what the task set out to do.
- **`memory.md`** — the agent's scratchpad during the task: files inspected, patterns noticed, open questions, side observations. **Trimmed at task close** — only entries still useful for future tasks survive.
- **`decisions.md`** — the durable log of decisions made during the task. Each entry records the decision, alternatives considered, rationale, approver, and reversibility. **Append-only. Never pruned.** This is the file a reader six months from now will reach for to understand why something is the way it is.

The split is deliberate: `memory.md` is allowed to be noisy and provisional because it'll be pruned; `decisions.md` is the curated record, so each entry pays its rent.

### External: workflow runs, artifacts, previews, issues

Anything that lives outside the repo:

- **Workflow run URLs** — the canonical record of what CI saw. Link these from PR comments and from `decisions.md` when a decision was driven by a specific run.
- **Uploaded artifacts** — named `<purpose>-<run-id>-<sha>` per the artifact-traceability rule in `AGENTS.md`. Default GitHub retention is 90 days; if an artifact is load-bearing for a decision, copy the relevant excerpt into `decisions.md` rather than relying on the link.
- **Vercel previews** — one preview per PR, accessible via the comment the Vercel integration posts. Disappear when the PR closes.
- **GitHub issues** — long-lived, but their relationship to the task is implicit unless you link them. The `agent-task` issue template's body becomes the seed of the PR's `## Plan` block.

External links are convenient but **not durable storage**. The retention policies above are not ours to set. When in doubt, internalize.

## Pruning rule (at task close)

A task closes when its PR is merged (or the tracking issue is closed without merge). At that moment:

1. **`memory.md` — trim.** Remove anything that was only useful while the task was active: working notes on files inspected, intermediate hypotheses, debugging breadcrumbs, finished open questions. Keep only entries that future tasks would reasonably benefit from (e.g., "the lint config in `eslint.config.mjs` ignores `dist/**`, found out the hard way" — that's a fact worth keeping).
2. **`decisions.md` — leave alone.** Never trim or rewrite past entries. If a decision was wrong, add a new entry that supersedes it; do not delete the original. The audit trail is the value.
3. **`plan.md` — leave alone.** The plan is the task's "what we set out to do" — leaving it intact lets a future reader compare the plan to what actually shipped.

If pruning `memory.md` would leave the file empty, that's fine — commit it empty (with the template's section headers) or delete it. Either is acceptable.

## Naming convention: `<task-id>`

The folder under `docs/agent-tasks/` uses one of two shapes:

- **Issue-tracked task:** `<issue-number>-<slug>`. The issue number comes first so folders sort in roughly the order they were started. Example: `25-fix-preview-stale-cache` for issue #25.
- **Self-implemented infra without a tracking issue:** a short slug only — no number — optionally suffixed with the month if helpful. Examples: `9-memory-artifacts` (this PR; no issue), `chore-cleanup-2026-05`.

Slugs are kebab-case, lowercase ASCII, kept short enough that the full folder name is comfortable to type. Match the verb-object shape of the issue title when possible.

The `agent-artifact-check.yml` workflow (see [`WORKFLOWS.md`](WORKFLOWS.md)) verifies that an agent-shaped PR adds or references *some* `docs/agent-tasks/*/plan.md` file. It does not validate the slug format — that's the reviewer's job.
