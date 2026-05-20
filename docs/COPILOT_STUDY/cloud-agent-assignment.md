# Cloud Agent Assignment — Copilot equivalent of this PR

> **Why this file exists.** The repo's [`README.md`](../../README.md) and [root `CLAUDE.md`](../../CLAUDE.md) state that GitHub Copilot is configured as a *dormant alternative* to Claude Code: the `.github/` instruction files, custom agents, prompts, and hooks are kept valid and exam-shaped so the day a Copilot license is available, Copilot can take over without rewiring the repo. This document is the **proof of equivalence**: a step-by-step walkthrough of how this exact task — issue #4, "Scaffold Next.js 16 + Tailwind v4 + extract brand design tokens" — would be executed by the GitHub Copilot Coding Agent in the cloud, and how that flow differs from how Claude Code executed it locally.
>
> Read this alongside [`AGENTS.md`](../../AGENTS.md) (the operating contract — applies to both agents) and [`docs/PLAN_FIRST_VS_PLAN_EXEC.md`](../PLAN_FIRST_VS_PLAN_EXEC.md) (the workflow decision rubric — also applies to both).

## Contents

1. [What is the Copilot Coding Agent?](#what-is-the-copilot-coding-agent)
2. [Prerequisites to actually run it](#prerequisites-to-actually-run-it)
3. [End-to-end assignment flow for issue #4](#end-to-end-assignment-flow-for-issue-4)
4. [Side-by-side: Claude Code vs Copilot Coding Agent for this task](#side-by-side-claude-code-vs-copilot-coding-agent-for-this-task)
5. [Governance hookups in this repo](#governance-hookups-in-this-repo)
6. [Things that would surprise you](#things-that-would-surprise-you)
7. [Activating Copilot Coding Agent in this repo](#activating-copilot-coding-agent-in-this-repo)
8. [Verification — sources and inferred content](#verification--sources-and-inferred-content)

---

## What is the Copilot Coding Agent?

GitHub Copilot Coding Agent is a cloud-hosted AI agent that takes a GitHub issue, opens a draft pull request, and implements the requested changes inside a sandboxed virtual machine — all without a developer attached to the session. It's the cloud counterpart to in-IDE Copilot suggestions and is closer in shape to Claude Code than to inline auto-complete.

Mental model:

| | |
|---|---|
| **Trigger** | Assign an issue to `@copilot` (or `@Copilot`, depending on rollout label) |
| **Environment** | Ephemeral VM under GitHub Actions infrastructure |
| **Output** | Draft PR on a branch named `copilot/<short-topic>` |
| **Session log** | Posted as a single, continuously-updated comment on the PR — collapsible sections per tool call |
| **Re-invocation** | Comment on the PR mentioning `@copilot` with new instructions |
| **Cost** | Counts against the org's Copilot premium-request budget |

## Prerequisites to actually run it

If you wanted to dispatch the agent for real (we won't here — Claude is the executor today), you'd need:

1. **GitHub Copilot Business or Enterprise license** assigned to the user who triggers the assignment.
2. **Organization admin opt-in**: org settings → Copilot → "Allow Copilot Coding Agent" toggled on, applied to this repo.
3. **Repository settings** under Settings → Copilot:
   - Coding Agent enabled
   - Allowed file-write paths (often defaulted to everything; can be narrowed)
   - "Allow Copilot to push to branches" enabled
4. **Branch protection on `main` permits the agent as a bypass actor for opening PRs** (but not for pushing directly to `main` — that protection still binds the agent).
5. **No `infra-change` label requirement violated.** This repo's L3 paths (`.github/workflows/`, `.github/agents/`, etc.) are gated by CODEOWNERS; Copilot can touch them but the PR will sit waiting for a CODEOWNERS reviewer.

## End-to-end assignment flow for issue #4

Below is the path you'd take through github.com to execute issue #4 with Copilot. Section labels match what's actually visible in the UI as of late 2025; if the UI has moved by the time you read this, the *workflow* is what matters.

### Step 0 — Confirm the issue is shaped for the agent

Before assigning, check the issue (created from the [`agent-task` template](../../.github/ISSUE_TEMPLATE/agent-task.md)):

- [ ] **Goal** is a single sentence.
- [ ] **Inputs** lists the design URL, the workflow guidance, and the fallback path.
- [ ] **Repository scope (allowed paths)** is specific — no wildcards beyond what's needed.
- [ ] **Expected outputs** are checkable artifacts (files that exist, criteria that can be verified).
- [ ] **Success criteria** are verifiable from a diff or workflow run, not opinion.
- [ ] **Autonomy level** dropdown is set (L2 for this task — default for app code).
- [ ] **Rollback / escalation plan** is filled in.

Issue #4 meets all of these. If it didn't, you'd update the issue before assigning rather than asking Copilot to guess.

### Step 1 — Assign to Copilot

On the issue page (https://github.com/lpt-labs/london-premium-transfers/issues/4):

1. Open the right sidebar.
2. Click **Assignees** → search `Copilot` → select **`@copilot`**.
3. (Alternative path) Click **Development** → **Code with Copilot Agent** → confirm.

The moment you click, Copilot:

- Posts a comment on the issue: *"I'll get started on this. Tracking progress in #N (the PR that's about to open)."*
- Creates a draft PR titled something like *"feat: Scaffold Next.js 16 + Tailwind v4 + extract brand design tokens"*.
- Pushes an empty initial commit to a new branch `copilot/scaffold-nextjs` (the slug is derived from the issue title).

### Step 2 — Watch the session start

On the draft PR you'll see a Copilot comment expand in near-real time. The comment is a **single, continuously-edited message** containing:

```
✔ Read AGENTS.md
✔ Read CLAUDE.md
✔ Read .github/copilot-instructions.md
✔ Read docs/PLAN_FIRST_VS_PLAN_EXEC.md
✔ Read .github/ISSUE_TEMPLATE/agent-task.md
✔ Plan posted to PR description
⏳ Running pnpm create next-app@latest …
```

Each line is a collapsible disclosure — clicking expands to show the actual file contents, command output, or diff. This is functionally the same as Claude Code's terminal-side tool log, but persisted on the PR.

### Step 3 — The Plan section

`plan-gate.yml` in this repo requires a `## Plan` block in the PR body between `PLAN:BEGIN` / `PLAN:END` markers. Copilot reads [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) on startup, which contains the rule "Every PR must include a `## Plan` section". So Copilot's first PR edit (before any code) will fill in the plan, using the same bullet structure as [`docs/agent-tasks/_template/plan.md`](../agent-tasks/_template/plan.md).

If you want plan-first review (recommended for high-risk tasks per [`docs/PLAN_FIRST_VS_PLAN_EXEC.md`](../PLAN_FIRST_VS_PLAN_EXEC.md)), comment on the draft PR before Copilot writes code:

> @copilot pause after the plan — I want to review it before you proceed.

Copilot will halt and wait for your approval before pushing further commits. (This pattern is documented in the GitHub Copilot Coding Agent docs as "interactive review.")

### Step 4 — Watch commits land

Copilot pushes commits to the draft PR's branch — one commit per logical step, similar to the commit-by-commit pace this repo prefers. For issue #4, you'd expect roughly:

1. `docs(agent-tasks): save plan for #4`
2. `chore(scaffold): bootstrap Next.js 16 + Tailwind v4`
3. `feat(tokens): add lib/design-tokens.ts`
4. `feat(theme): wire tokens into @theme + next/font`
5. `feat(page): brand placeholder home`
6. `docs(app): add app/CLAUDE.md`
7. `docs(readme): local dev instructions`
8. `docs: cloud-agent-assignment study guide` (this file)

These commit messages are heavily influenced by `.github/copilot-instructions.md` — that's why per-repo instructions matter.

Each push triggers the workflow checks: `plan-gate`, eventually lint / typecheck / build / eval / drift / path-guard (only `plan-gate` is configured today; others land in later PRs).

### Step 5 — Mark ready for review

When Copilot finishes the plan, it posts a comment:

> Done. Marking ready for review. I've completed steps 1–10 from the plan; here's the evidence:
>
> - Workflow runs: …
> - Preview deploy: …
> - Screenshots: …

The PR moves from **Draft** to **Open**, and the assignees / reviewers from CODEOWNERS are notified automatically.

### Step 6 — Review the diff

This is the part that doesn't change between agents — same Files Changed tab, same review comments, same `## Review checklist` from [`pull_request_template.md`](../../.github/pull_request_template.md). What's different from a human PR:

- The session log comment lets you audit *how* Copilot arrived at a decision (which files it read, which commands it ran).
- Suspicious commits are usually paired with a `// reasoning:` comment in code or a "Note:" in the session log.

### Step 7 — Request changes

To ask for revisions:

- Inline review comment on a specific line → Copilot will pick it up automatically and push a fix.
- A top-level PR comment mentioning `@copilot` works too: *"@copilot the font fallback stack should match the source. Please use ui-sans-serif before system-ui."*

Copilot resumes the session, makes the changes, pushes new commits, and updates the session log.

### Step 8 — Merge

Once required checks pass and CODEOWNERS approve, you merge as normal. `branch protection` and `plan-gate` are the same gates a human PR would face.

### Step 9 — Post-merge cleanup

The Copilot branch can be deleted from the PR's UI (same as any branch). Issue #4 closes automatically because the PR body referenced `Fixes #4`.

---

## Side-by-side: Claude Code vs Copilot Coding Agent for this task

For issue #4 specifically, here's where each tool would do each plan step.

| Plan step | Claude Code (today's actual execution) | Copilot Coding Agent (hypothetical) |
|---|---|---|
| 1. Save plan to `docs/agent-tasks/4-scaffold-nextjs/plan.md` | Local commit on `feat/scaffold-nextjs` after chat-side review | Commit on `copilot/scaffold-nextjs` after Copilot edits the PR body and saves a copy |
| 2. `pnpm create next-app@latest` | Run from local terminal via Bash tool; verify `pnpm install` succeeds locally | Run inside the sandbox VM; install logs appear in the session-log comment |
| 3. Fetch design source | `WebFetch` tool returns the tar.gz; Claude unpacks to `/tmp`, reads README + index.html | Copilot's `web.fetch` or equivalent tool; sandbox has internet egress by default |
| 4. Write `lib/design-tokens.ts` | Direct `Write` tool; user reviews in IDE | Direct file write; commit pushed; user reviews on PR |
| 5. Wire `@theme` + `next/font` | Same | Same |
| 6. Replace `app/page.tsx` | Same | Same |
| 7. Add `app/CLAUDE.md` | Same (Claude-aimed file, but Copilot would still write it because the issue requires it) | Same |
| 8. Write `docs/COPILOT_STUDY/cloud-agent-assignment.md` (this file) | Claude writes it from public docs + memory of the repo | Copilot writes it from its own knowledge of GitHub features — likely more accurate on UI specifics |
| 9. Verify `pnpm dev` is clean | Claude runs `pnpm dev` in background, hits `/` with curl, kills the server | Copilot runs the same; verification posted in the PR as evidence |
| 10. Open PR | Branch already exists; user runs `gh pr create` (or Claude proposes the command) | The PR already exists from the moment of assignment — no separate "open PR" step |

### Where they diverge most

1. **Synchrony.** Claude pauses on every commit for the user to say "go". Copilot runs autonomously until completion or until a comment interrupts. The commit-by-commit pace this repo prefers is more natural with Claude; with Copilot you'd enforce it via the "pause after the plan" comment pattern.

2. **Where the session log lives.** Claude's tool log is in your terminal; ephemeral. Copilot's session log is a PR comment; durable, shareable, auditable later. For governance, Copilot's setup is slightly better.

3. **Verification surface.** Claude can see what's on your local filesystem; Copilot can't. So Copilot is strictly more sandboxed — it can never accidentally touch a file outside the repo. Claude has wider read access (good for debugging, sharper edge for safety).

4. **Cost model.** Claude Code is billed per token used by the user's API subscription. Copilot Coding Agent is billed against the org's Copilot Business/Enterprise premium-request budget. Different cost owners.

---

## Governance hookups in this repo

The dormant Copilot setup in this repo touches these files. Each has a matching Claude-side file (so parity is real, not declarative).

| Purpose | Copilot file | Claude file |
|---|---|---|
| Always-on top-level instructions | [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) | [`CLAUDE.md`](../../CLAUDE.md) |
| Operating contract (both agents read this) | [`AGENTS.md`](../../AGENTS.md) | [`AGENTS.md`](../../AGENTS.md) |
| Path-scoped rules under `app/` | (Copilot also reads `CLAUDE.md` files; no separate Copilot variant needed) | [`app/CLAUDE.md`](../../app/CLAUDE.md) |
| Custom agents | `.github/agents/<name>.md` (when present) | `.claude/agents/<name>.md` (when present) |
| Reusable prompts | `.github/prompts/<name>.prompt.md` | `.claude/skills/<name>/SKILL.md` |
| Pre-tool-use hooks | `.github/hooks/<name>.sh` | `.claude/hooks/<name>.sh` (via `.claude/settings.json`) |
| Codeowners review gate | `CODEOWNERS` | `CODEOWNERS` |
| Plan-gate workflow | `.github/workflows/plan-gate.yml` | `.github/workflows/plan-gate.yml` |
| PR template (drives Plan/Evidence sections) | `.github/pull_request_template.md` | `.github/pull_request_template.md` |
| Issue template | `.github/ISSUE_TEMPLATE/agent-task.md` | `.github/ISSUE_TEMPLATE/agent-task.md` |

### What `plan-gate` requires from Copilot

`plan-gate.yml` greps the PR body for a non-empty block between `<!-- PLAN:BEGIN -->` and `<!-- PLAN:END -->`. Copilot's instruction file must contain the rule "always fill the Plan section" — which it does, in [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md), specifically the "Plan before code" item.

If Copilot ever forgot to fill the plan, `plan-gate` would fail → PR blocked → either a human or a follow-up comment to `@copilot` would fix the PR body. Same gate as for human PRs.

### How CODEOWNERS interacts with Copilot

[`CODEOWNERS`](../../CODEOWNERS) gates L3 paths (workflows, agents, hooks, `next.config.ts`, `pnpm-lock.yaml`). When Copilot's PR touches any of those, the PR sits waiting for an owner to approve — Copilot can't self-approve. Same rule as for human PRs.

### Retry / escalation

Per [`AGENTS.md`](../../AGENTS.md):

- **First failed check**: the agent (Copilot or Claude) may revise the branch once and rerun.
- **Second failure of the same check**: stop. Post a comment with what failed, what was tried, evidence links, suggested next step. Add label `needs-human`.

For Copilot specifically, the failed-check trigger lives in the workflow definitions; Copilot doesn't automatically subscribe to its own check failures — you'd typically use a separate workflow (`copilot-retry.yml`, not yet in this repo) that posts a comment to `@copilot` on the first failure.

---

## Things that would surprise you

These are the friction points that come up in practice. Documented here so future-you (or future-Copilot) doesn't burn a session learning them the hard way.

1. **Sandbox internet egress is allowlisted.** Copilot's sandbox can reach `registry.npmjs.org`, `fonts.googleapis.com`, GitHub itself, and a few other common endpoints — but org admins can restrict this. If your task needs an unusual API (the design-bundle URL we used: `https://api.anthropic.com/v1/design/...`), check the egress allowlist or expect the fetch to fail. Fallback patterns (the issue's "if URL fails, use local copy" clause) earn their keep here.

2. **Build scripts are blocked by default.** pnpm 11's `ERR_PNPM_IGNORED_BUILDS` bites both agents the same way. Copilot's session log will show the error; the fix (committing `pnpm-workspace.yaml`) is the same as what Claude did in commit `69286d5`.

3. **No `--no-verify`, no force-push to `main`.** [`AGENTS.md`](../../AGENTS.md) hard rules apply equally. Copilot will refuse; the org-level Coding Agent settings enforce this independently.

4. **Per-tool-call latency.** Copilot's sandbox is a fresh VM per session; cold start can be 30–60 seconds. Once warm, individual tool calls are fast. Claude Code's local tools are sub-second.

5. **The session log gets long.** A full scaffold (this PR's scope) typically produces a session log comment with ~30–60 collapsible sections. Don't collapse-and-forget — anything load-bearing should also be in a commit message or PR body.

6. **Copilot can't reach localhost on your machine.** Verification by browser preview happens in the sandbox or via a deployed preview URL (Vercel preview deploy), not by hitting localhost.

7. **Resumption is per-PR, not per-task.** If a session is interrupted (e.g. a timeout), commenting `@copilot continue` resumes from the latest commit on the PR. Copilot reconstructs context from the session log + the PR diff, not from a private memory store.

---

## Activating Copilot Coding Agent in this repo

When you get a Copilot Business/Enterprise license, here's the concrete sequence to flip this repo from "Claude is the executor" to "Copilot is the executor":

1. **Org admin**: Settings → Copilot → Enable Coding Agent for the `lpt-labs` org. Add `london-premium-transfers` to the allowed repos.
2. **Repo admin** (you): Settings → Copilot → Coding Agent → Enable. Confirm the allowed-paths default. Enable "Copilot may push to non-default branches".
3. **Verify `.github/copilot-instructions.md` is current.** It already says "Plan before code", references `AGENTS.md`, and lists hard rules. No change needed.
4. **Verify `CODEOWNERS` blocks L3 paths.** It does — `.github/workflows/**`, `next.config.ts`, `pnpm-lock.yaml`, etc., are all owned by `@mafaq229`.
5. **Test with a tiny issue first.** Open an `agent-task` issue for a docs typo, assign `@copilot`, watch the full lifecycle. Don't dispatch a real feature task until the test issue merges cleanly.
6. **Update [`CLAUDE.md`](../../CLAUDE.md)** to reflect the role switch — Claude becomes the dormant alternative; Copilot becomes the primary execution agent.
7. **Decide on a per-task agent.** Both can coexist; some teams use Claude for high-trust planning and Copilot for hands-off implementation, others use one tool exclusively. [`docs/PLAN_FIRST_VS_PLAN_EXEC.md`](../PLAN_FIRST_VS_PLAN_EXEC.md) remains the rubric for which workflow to use, regardless of which tool runs it.

---

## Verification — sources and inferred content

This guide is written by Claude Code from a mix of:

- **Verified against this repo's actual files**: every cross-link, every file path under `.github/` and `.claude/`, every commit reference, the `plan-gate` requirement, the CODEOWNERS pattern. If a reference here doesn't match what's on disk, the file on disk wins.
- **Verified from public GitHub Copilot documentation** (knowledge cutoff: January 2026): the existence of `@copilot` assignment, the draft-PR pattern, the session-log comment pattern, the `copilot/<topic>` branch convention, the sandbox VM model, the pause/resume comment pattern.
- **Inferred from documented behaviour but not literally observed**: the specific wording of Copilot's "I'll get started…" comment; exact UI labels in the right-sidebar Assignees panel; the org-level enablement flow's exact button positions. Treat these as plausibly-correct illustrations, not click-by-click ground truth. **The author has not personally run Copilot Coding Agent against this repo or any other** — when in doubt, consult the live documentation at https://docs.github.com/en/copilot/using-github-copilot/coding-agent.
- **Out of scope intentionally**: the exact API to dispatch the agent programmatically (use `gh` CLI's `gh copilot` once available, or the REST API endpoint documented separately); Copilot's behavioural differences across language ecosystems (the repo is JS/TS-only at this point).

If a future reader runs this through Copilot for the first time and notices a step diverges from what's written here, **update this file** — it's a living document.
