# Org-scoped Copilot custom agents

This guide is the conceptual backdrop for the two dormant Copilot custom-agent files added in PR 14: [`.github/agents/implementer.agent.md`](../../.github/agents/implementer.agent.md) and [`.github/agents/a11y-reviewer.agent.md`](../../.github/agents/a11y-reviewer.agent.md). Those files are **repo-scoped**. GitHub Copilot also supports **org-scoped** custom agents defined in the organisation settings UI; this doc explains what that means, how the two scopes differ, and why we keep both in mind even though the org route is not currently in use here.

Read alongside [`AGENTS.md`](../../AGENTS.md) (operating contract) and [`cloud-agent-assignment.md`](./cloud-agent-assignment.md) (cloud-agent context for this repo).

## Contents

1. [What is an org-scoped Copilot custom agent?](#what-is-an-org-scoped-copilot-custom-agent)
2. [How it differs from a repo-scoped agent](#how-it-differs-from-a-repo-scoped-agent)
3. [Trade-offs](#trade-offs)
4. [Org Settings UI walkthrough](#org-settings-ui-walkthrough)
5. [Parallel use of Claude subagents](#parallel-use-of-claude-subagents)
6. [Sources](#sources)

---

## What is an org-scoped Copilot custom agent?

A **custom agent** is a named, scoped persona for GitHub Copilot — a Markdown profile (YAML frontmatter + body) that defines a name, a description, a tool allowlist, and behavioural instructions Copilot follows whenever that agent is invoked. The canonical schema is documented at [Custom agents configuration — GitHub Docs](https://docs.github.com/en/copilot/reference/custom-agents-configuration); the minimal shape is:

```yaml
---
description: One required sentence describing what this agent does.
tools: [read, edit, search, execute]
---

Body — behavioural instructions in plain Markdown, up to ~30,000 characters.
```

An **org-scoped** agent is one defined in **Organisation Settings → Copilot → Agents** rather than in a repository. Once published, it is visible to every Copilot user in every repo in that organisation — the same agent name, the same tool allowlist, the same instructions, applied identically across the org's codebases.

A **repo-scoped** agent is the file we added in PR 14: a Markdown file at `.github/agents/<name>.agent.md` inside one repository. It is visible only when Copilot is working inside that repository.

Both routes produce the same agent profile shape; the difference is *where the file lives* and therefore *who sees it*.

## How it differs from a repo-scoped agent

| | Repo-scoped | Org-scoped |
| --- | --- | --- |
| **Location** | `.github/agents/<name>.agent.md` in one repo | Organisation Settings UI; not committed to any repo |
| **Visibility** | That repo only | Every repo in the org |
| **Edited by** | Repo contributors via pull request | Org admins via the Settings UI |
| **Versioning** | Git history of the repo | The Settings UI's audit log; no diffs in code review |
| **Rollback** | Revert the commit | Edit the Settings UI; no `git revert` |
| **Iteration speed** | Fast — branch, PR, merge | Slow — admin change with org-wide blast radius |
| **Discoverability for new contributors** | Visible in the codebase | Requires knowing to look in Settings |

A useful intuition: repo-scoped agents are like local `.envrc` files (specific, fast to change, opt-in per project), org-scoped agents are like SSO policies (consistent, audit-tracked, slow to change, applied universally).

## Trade-offs

**Choose org-scoped when:**

- The agent encodes a policy the organisation wants enforced uniformly — for example, a `security-reviewer` agent every repo must use the same way.
- The agent's tool allowlist or model choice has compliance implications (audit-trackable in the Settings UI's history).
- The agent should be available to ad-hoc work that doesn't live in a repo yet.

**Choose repo-scoped when:**

- The agent depends on repo-local context — file paths, design tokens, framework conventions — that wouldn't make sense in another repo.
- You want the agent's definition under code review with diffs, comments, and the same `infra-change` gating that protects other governance files.
- Iteration speed matters more than consistency: a `frontend-stylist` agent in this repo can change every week without anyone outside this repo noticing.

**Auditing surface differs too.** Org-scoped changes are visible only to people who can read the org's Settings audit log; repo-scoped changes are visible to anyone who can read the repo's commit history. For a repo that already runs an "agentic SDLC" with code-reviewed governance files, repo-scoped is the cheaper-to-audit choice.

**Rollout and rollback granularity.** Org-scoped is all-or-nothing across the org. Repo-scoped lets one repo trial an agent before another adopts it. If you want a phased rollout, start repo-scoped, promote to org-scoped once the agent has earned its place.

## Org Settings UI walkthrough

This is the path an org admin would follow today (UI labels may drift; verify against the docs link below):

1. Navigate to the organisation: `https://github.com/orgs/<org>/settings`.
2. In the left sidebar, expand **Copilot** and click **Agents** (the section heading may be labelled "Custom agents" depending on the rollout).
3. Click **New agent**.
4. Fill in the profile fields:
   - **Name** — display name (optional; defaults to filename if you upload one).
   - **Description** — required; this is what Copilot reads when deciding whether to invoke the agent.
   - **Tools** — multi-select from the aliased canonical names (`read`, `edit`, `search`, `execute`, `web`, `agent`, `todo`) and any MCP-server tools the org has configured.
   - **Body** — the behavioural instructions, in Markdown, up to ~30,000 characters.
   - **Target** (optional) — restrict to `vscode` or `github-copilot` if the agent only makes sense in one surface; defaults to both.
   - **Disable model invocation** / **User invocable** — controls whether Copilot can auto-select this agent or whether a user must invoke it explicitly.
5. Click **Save**. The agent is now visible to every Copilot user in every repo in the org on their next session.

To delete or edit, return to the same page; the audit log records who changed what and when. There is no diff view comparable to `git diff`; if you want diff-style review for an org-scoped agent, draft it as a repo-scoped file first, get the wording right under code review, then copy it into the Settings UI.

## Parallel use of Claude subagents

This repo runs Claude Code as the active execution agent; the parallel concept on the Claude side is a **subagent** at `.claude/agents/<name>.md`. The two shapes are different but the intent is the same: a named, scoped persona that the parent agent can delegate to, with a tool allowlist enforced by the harness.

| | Claude subagent (`.claude/agents/`) | Copilot custom agent (`.github/agents/`) |
| --- | --- | --- |
| **Format** | Markdown + YAML frontmatter | Markdown + YAML frontmatter |
| **Frontmatter** | `name`, `description`, `tools` (comma-separated Claude tool names: `Read, Grep, Glob, …`) | `description` (required), `tools` (aliased: `read, edit, …`), optional `name`, `target`, `model` |
| **Tool boundary** | Enforced by the Claude Code harness — listed tools only | Enforced by the Copilot runtime — listed aliased tools only |
| **Loaded by** | The main Claude agent on demand | Copilot in the IDE / CLI / cloud agent |
| **Active in this repo?** | Yes — `planner`, `implementer`, `a11y-reviewer` (PR 14) | Dormant — files kept valid pending a Copilot license |

We maintain both ecosystems' definitions even though only one runs today. This repo's [`README.md`](../../README.md) and [`CLAUDE.md`](../../CLAUDE.md) describe the dual-track design: Claude is the primary execution agent; the Copilot files are syntactically valid stand-ins so that the day a license is available, the equivalent agent already exists on the Copilot side without rewiring the repo.

Concretely, the implementer pair (`.claude/agents/implementer.md` ↔ `.github/agents/implementer.agent.md`) and the planner pair (`.claude/agents/planner.md` ↔ `.github/agents/planner.agent.md`) cover the same role on either side; the a11y-reviewer pair added in PR 14 follows the same convention. Drift between a pair is a small lurking risk — when one side changes, the other should be updated in the same PR or a follow-up `infra-change` PR.

## Sources

- [Custom agents configuration — GitHub Docs](https://docs.github.com/en/copilot/reference/custom-agents-configuration) — canonical YAML schema and tool aliases.
- [About custom agents — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents) — conceptual overview.
- [Creating custom agents for Copilot cloud agent — GitHub Docs](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents) — file layout and naming rules.
- [`docs/COPILOT_STUDY/cloud-agent-assignment.md`](./cloud-agent-assignment.md) — how the Copilot cloud agent compares to Claude Code in this repo.
- [`docs/COPILOT_STUDY/agentic-workflows.md`](./agentic-workflows.md) — broader Copilot agent context for this repo.
