# Audit map

Cross-reference of every artifact this repo produces. If you can't locate
something in **30 seconds** from this file, that's a bug — file an issue
and update this map in the same PR.

This doc is navigational. Each row maps **what** → **where**. Sections are
kept short; deep guidance lives in the linked file.

> **Maintenance invariant.** Any PR that introduces a new artifact *type*
> (a new workflow, study guide, handoff format, postmortem schema, hook
> kind, MCP source, etc.) MUST update this file in the same PR. Mirrored
> in [`AGENTS.md`](../AGENTS.md) "Documentation invariants" and
> [`docs/WORKFLOWS.md`](WORKFLOWS.md).

---

## Plans and tasks

| What | Where |
| --- | --- |
| Per-task plan (durable) | `docs/agent-tasks/<task-id>/plan.md` |
| Per-task plan template | `docs/agent-tasks/_template/plan.md` |
| Plan inside the PR body | `## Plan (required)` section, between `<!-- PLAN:BEGIN -->` / `<!-- PLAN:END -->` markers in [`.github/pull_request_template.md`](../.github/pull_request_template.md) |
| Task-id naming convention | [`docs/MEMORY_POLICY.md`](MEMORY_POLICY.md) |
| Plan-first vs plan-and-execute choice | [`docs/PLAN_FIRST_VS_PLAN_EXEC.md`](PLAN_FIRST_VS_PLAN_EXEC.md) |

## Validation signals

| What | Where |
| --- | --- |
| Workflow run logs (all workflows) | `https://github.com/<org>/<repo>/actions/runs/<run-id>` |
| Plan-gate result | `plan-gate.yml` — run status on the PR check list |
| Agent-CI result | `agent-ci.yml` — run status on the PR check list |
| Agent-artifact-check result | `agent-artifact-check.yml` — run status on the PR check list |
| Drift-check comment | PR comment with marker `<!-- drift-check:summary -->` |
| Conflict-detect comment | PR comment with marker `<!-- conflict-detect:summary -->` + `agent-conflict` label |
| Eval scorecard comment | PR comment with marker `<!-- eval:scorecard -->` |
| Eval scorecard artifact | `actions/upload-artifact` name `eval-scorecard-<run-id>-<sha>` |
| Least-privilege lint comment | PR comment with marker `<!-- least-privilege:summary -->` |
| Path-guard outcome | Run status of `path-guard.yml` (post-merge UI promotion → required check) |
| Automerge outcome | `::notice` lines in `automerge.yml` run log; PR moves to "Auto-merge enabled" state |

## Handoffs and lessons

| What | Where |
| --- | --- |
| Multi-agent handoffs | `docs/handoffs/<date>-<slug>.md` (template at `docs/handoffs/_template.md`) |
| Postmortems for agent failures | `docs/agent-failures/<date>-<slug>.md` (template at `docs/agent-failures/_template.md`) |
| Rules extracted from postmortems (Claude) | `CLAUDE.md` "Lessons" section (root + path-scoped) |
| Rules extracted from postmortems (Copilot) | [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) |

## Policies and contracts

| What | Where |
| --- | --- |
| Operating contract (both agents) | [`AGENTS.md`](../AGENTS.md) |
| Claude-specific overlay | [`CLAUDE.md`](../CLAUDE.md) (root) |
| Copilot-specific overlay | [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) |
| Path-scoped Claude rules | `*/CLAUDE.md` (e.g., [`.github/workflows/CLAUDE.md`](../.github/workflows/CLAUDE.md)) |
| Path-scoped Copilot rules | [`.github/instructions/*.instructions.md`](../.github/instructions/) (loaded via `applyTo:` frontmatter) |
| Memory-tier model + task-id | [`docs/MEMORY_POLICY.md`](MEMORY_POLICY.md) |
| Workflow inventory + invariants | [`docs/WORKFLOWS.md`](WORKFLOWS.md) |
| Operational runbook | [`docs/AGENT_PLAYBOOK.md`](AGENT_PLAYBOOK.md) |
| Eval methodology | [`docs/EVAL.md`](EVAL.md) |

## Hooks, firewall, MCP

| What | Where |
| --- | --- |
| Claude Code settings (hooks, permissions) | [`.claude/settings.json`](../.claude/settings.json) |
| Copilot hook configs (dormant) | [`.github/hooks/`](../.github/hooks/) (`pre-tool-use.json`, `post-action.json`, `error.json`) |
| Copilot agent firewall study guide | [`docs/COPILOT_STUDY/agent-firewall.md`](COPILOT_STUDY/agent-firewall.md) |
| MCP client configuration (VS Code / Claude) | [`.vscode/mcp.json`](../.vscode/mcp.json) |
| MCP server inventory + rationale | [`docs/mcp/README.md`](mcp/README.md) |
| MCP allow-list policy study guide | [`docs/COPILOT_STUDY/mcp-allowlist.md`](COPILOT_STUDY/mcp-allowlist.md) |
| MCP custom-registry study guide | [`docs/COPILOT_STUDY/mcp-custom-registry.md`](COPILOT_STUDY/mcp-custom-registry.md) |
| MCP enterprise-tier study guide | [`docs/COPILOT_STUDY/mcp-enterprise.md`](COPILOT_STUDY/mcp-enterprise.md) |

## Skills and agents

| What | Where |
| --- | --- |
| Claude skills | [`.claude/skills/<name>/SKILL.md`](../.claude/skills/) (`plan-feature`, `review-pr`, `postmortem`) |
| Claude subagents | [`.claude/agents/<name>.md`](../.claude/agents/) (`planner`, `implementer`, `a11y-reviewer`) |
| Copilot prompts (dormant — mirror of skills) | [`.github/prompts/<name>.prompt.md`](../.github/prompts/) |
| Copilot custom agents (dormant — mirror of subagents) | [`.github/agents/<name>.agent.md`](../.github/agents/) |
| Org-level custom agent study guide | [`docs/COPILOT_STUDY/org-custom-agents.md`](COPILOT_STUDY/org-custom-agents.md) |

## Routines and dormant workflows

| What | Where |
| --- | --- |
| Claude Code routines (operational docs) | [`docs/CLAUDE_ROUTINES/`](CLAUDE_ROUTINES/) |
| Dormant Copilot daily-status workflow | [`.github/workflows/daily-repo-status.md`](../.github/workflows/daily-repo-status.md) (intentionally `.md`, not active YAML) |
| Dormant Copilot CLI-in-workflow | [`.github/workflows/cli-agent-task.yml`](../.github/workflows/cli-agent-task.yml) + study guide [`docs/COPILOT_STUDY/cli-in-workflow.md`](COPILOT_STUDY/cli-in-workflow.md) |
| Dormant gh-aw (agentic workflow) configs | study guide [`docs/COPILOT_STUDY/agentic-workflows.md`](COPILOT_STUDY/agentic-workflows.md) |
| Multi-agent workflow | [`.github/workflows/multi-agent.yml`](../.github/workflows/multi-agent.yml) (user-triggered fan-out across reviewer agents) |
| Cloud agent assignment (Copilot coding agent) study guide | [`docs/COPILOT_STUDY/cloud-agent-assignment.md`](COPILOT_STUDY/cloud-agent-assignment.md) |

## Screenshots

| What | Where |
| --- | --- |
| Evidence screenshots referenced in PRs | `docs/screenshots/<pr-number>-<slug>.<ext>` (directory is created on first use) |

## Audit-log access

| What | Where |
| --- | --- |
| Copilot audit log study guide (how to access, filter, export) | [`docs/COPILOT_STUDY/audit-log.md`](COPILOT_STUDY/audit-log.md) |
| Copilot org-policy screens study guide | [`docs/COPILOT_STUDY/org-policies.md`](COPILOT_STUDY/org-policies.md) |
| Copilot content-exclusion study guide | [`docs/COPILOT_STUDY/content-exclusions.md`](COPILOT_STUDY/content-exclusions.md) |
