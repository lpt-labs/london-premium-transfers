# Copilot Org Policies — Admin Walkthrough

> **Why this file exists.** Part of the Copilot governance study guides for this repo. Covers the org-level Copilot policy screens: which features can be toggled, who they apply to, how enterprise/org/repo policies interact, and how a "disabled" policy actually surfaces to the developer it's blocking.
>
> Read alongside [`audit-log.md`](audit-log.md) (every change here writes an audit-log entry) and the feature-specific guides such as [`mcp-allowlist.md`](mcp-allowlist.md), [`content-exclusions.md`](content-exclusions.md), [`agent-firewall.md`](agent-firewall.md).

---

## Purpose

The Copilot policy screens are the single place to **turn Copilot features on and off** for an organization. Every other governance screen in the Copilot section (allow-lists, exclusions, network controls, etc.) is a sub-policy underneath these.

If a developer says "Copilot Chat doesn't work for me anymore," the first answer is almost always: someone toggled a policy here.

---

## UI Path

```
github.com
└── Your profile picture → Organizations
    └── <your-org>
        └── Settings
            └── Copilot (sidebar)
                ├── Policies        ← this guide
                ├── Access
                ├── Content exclusions
                └── Network
```

The exact section labels shift between GitHub releases; the workflow (org → Settings → Copilot → Policies) is stable.

---

## What's on the Policies screen

The screen is divided into per-feature toggles. The set evolves, but the categories that have been stable enough to plan around:

| Toggle | What it controls |
| --- | --- |
| **Copilot Chat in IDEs** | Whether the Chat panel/sidebar is offered in VS Code, JetBrains, etc. |
| **Copilot Chat on github.com** | Whether the github.com chat surface works for org members |
| **Inline code suggestions** | Whether ghost-text suggestions appear while typing |
| **Coding agent** | Whether the GitHub Copilot coding agent can be assigned to issues / PRs |
| **MCP servers in Copilot** | Master switch for MCP; sub-screens then govern the allow-list and registry |
| **Network access** | Whether agents can reach the public internet beyond GitHub; sub-screens for firewall rules |
| **Content exclusions** | Master switch + sub-screen for path-based exclusion rules |
| **Commit message generation** | Whether the "generate commit message" Copilot feature is exposed |
| **Pull-request summaries** | Whether "generate PR summary" is exposed |
| **Code review** | Whether Copilot code review on PRs is enabled |

Each toggle has three positions in most current builds:

| State | Meaning |
| --- | --- |
| **Enabled** | Feature is available to org members (subject to their seat). |
| **Disabled** | Feature is hidden / refused for all org members. |
| **No policy** | Inherits from the enterprise level (or GitHub's default if no enterprise). Use this when the enterprise admin wants central control. |

---

## Scope: org-wide vs per-team

Most policies apply **org-wide** — every member with a Copilot seat sees the same toggle outcome.

A subset of policies (notably content exclusions and access) can also be set **per team** under the **Access** sub-screen: grant or restrict features to specific teams within the org. Per-team settings layer on top of the org-wide toggle: a feature disabled org-wide stays disabled regardless of team grants.

For most repos (including this one), per-team customisation is overkill — set org-wide and review quarterly.

---

## Precedence chain

When the same feature has a policy set at multiple levels, the **higher-up level wins**:

```
Enterprise policy ──▶ Org policy ──▶ Repo-level setting (where applicable)
```

| Higher-level state | Lower-level can override? |
| --- | --- |
| Enterprise: **Enabled** | Org can disable for itself; cannot loosen further |
| Enterprise: **Disabled** | Org admins see the toggle greyed out — they cannot enable |
| Enterprise: **No policy** | Org chooses freely |
| Org: **Enabled** | Repo / team can scope further (e.g. exclude one team) |
| Org: **Disabled** | Repo / team cannot enable |

Practical implication: if you're an org admin and a toggle is greyed out with a banner mentioning "managed by your enterprise," escalate to the enterprise admin — there's nothing you can change here.

---

## How a disabled policy surfaces to developers

The "policy denied" experience varies by feature. Knowing the shape of the message saves a support ticket:

| Feature disabled | What the developer sees |
| --- | --- |
| **Copilot Chat in IDEs** | The Chat panel is missing from the sidebar, or shows a "Copilot Chat is not enabled for your organization" banner. |
| **Inline suggestions** | Ghost text never appears. Status-bar Copilot icon shows a "disabled" state on hover. |
| **Coding agent** | The **Assign to Copilot** option does not appear on issues/PRs, even for users with seats. |
| **MCP servers in Copilot** | The MCP panel/tab is missing from Copilot Chat. The IDE's `.vscode/mcp.json` is ignored. |
| **Network access** (agent firewall) | Agent run logs include `network egress blocked: <host>` lines. The agent reports the task as failed with a network error. |
| **Content exclusions** matching a path | No suggestions in that file; status-bar icon shows "exclusion" hover text; an audit-log entry is written (see [`audit-log.md`](audit-log.md)). |
| **Commit-message generation** | The "Generate with Copilot" button is missing from the commit dialog. |
| **PR summaries** | The "Generate summary" Copilot button is missing from the PR description editor. |
| **Code review** | Copilot does not appear as a requestable reviewer; existing review requests are removed. |

The pattern: **disabled features hide their UI entirely** rather than showing an error. This is intentional (less noise) but means developers may not realise the feature is intentionally off — point them at this guide.

---

## Step-by-Step: change a policy

1. On github.com, click your profile picture → **Your organizations**.
2. Click the org name.
3. Click **Settings** → **Copilot** → **Policies**.
4. Locate the toggle for the feature you want to change.
5. Set the toggle (Enabled / Disabled / No policy).
6. Click **Save** at the bottom of the section (some sections auto-save on change — confirm via a green confirmation banner).
7. Verify the change in the audit log: filter `action:copilot.policy_change actor:<your-handle> created:>=<today>` (see [`audit-log.md`](audit-log.md)).

The change takes effect for org members within seconds. IDE sessions may need a Copilot restart to pick up the new state.

---

## How this maps to our repo

We don't currently track org-policy state in this repo — the org settings are the source of truth. When a policy change affects how this repo's agents are allowed to operate (e.g. enabling/disabling the coding agent, tightening MCP allow-list), record the change as a note in [`docs/AGENT_PLAYBOOK.md`](../AGENT_PLAYBOOK.md) so future agents understand the constraint.

If we later need a per-team policy carve-out (e.g. "only the platform team can use the coding agent"), document the rationale alongside the policy change.

---

*Source: [GitHub Docs — Managing policies and features for Copilot in your organization](https://docs.github.com/en/copilot/managing-copilot/managing-github-copilot-in-your-organization/setting-policies-for-copilot-in-your-organization/managing-policies-for-copilot-in-your-organization) (verified May 2026). The toggle catalogue and labels change as GitHub ships new Copilot features; verify against the live UI if a specific toggle name matters.*
