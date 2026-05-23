# Copilot Audit Log — Org Admin Walkthrough

> **Why this file exists.** Part of the Copilot governance study guides for this repo. Covers the organization-level audit log: what Copilot-related events it captures, how to filter and export them, and how long entries stick around.
>
> Read alongside [`org-policies.md`](org-policies.md) (the policy screens that *produce* most of the events recorded here) and [`content-exclusions.md`](content-exclusions.md) (one specific category of event).

---

## Purpose

The audit log is the **canonical record** of who did what, when, in your GitHub organization. For Copilot, it answers questions like:

- "Which user enabled the coding agent for our team last week?"
- "Did any developer hit a content-exclusion block during yesterday's incident window?"
- "Show me every MCP allow-list policy change in the last 30 days."
- "Did the agent's PR actually get assigned by `@alice`, or by automation?"

It is the source of truth for compliance reviews, post-incident timelines, and confirming that policy changes you made in the UI actually took effect.

---

## UI Path

```
github.com
└── Your profile picture → Organizations
    └── <your-org>
        └── Settings
            └── Logs (sidebar)
                └── Audit log
```

Enterprise-owned orgs also expose an enterprise-level audit log at **Enterprise → Settings → Audit log**, which aggregates across all member orgs. Org admins see only their own org's entries.

---

## What Copilot writes to the audit log

The exact event names use a `copilot.*` prefix. The categories below cover the ones most relevant to this repo:

| Category | Example events | Why you'd look |
| --- | --- | --- |
| **Seat management** | seat assigned, seat removed, billing role changed | Who has Copilot, who lost it, who can grant it |
| **Policy changes** | feature toggled on/off, MCP allow-list edited, content-exclusion rule added | Confirms a UI change actually persisted; ties a change to an actor |
| **Agent invocations** | coding agent task created, task assigned, task completed | Trail of every Copilot-coding-agent run that touched a repo |
| **Content-exclusion blocks** | suggestion skipped because path matched an exclusion rule | Verifies exclusions are firing; debugging "why is Copilot not suggesting in this file" |
| **MCP events** | MCP server connection attempted, allow-list block | Tracks which external tools agents actually reached for |
| **Admin actions** | org admin added, audit-log accessed, export started | Standard org-level admin trail |

The audit log captures the *action* and the *actor*. It does **not** capture prompt content or suggestion text — those would be content, not events.

---

## Step-by-Step

### 1. Open the audit log

1. On github.com, click your profile picture → **Your organizations**.
2. Click the org name.
3. Click **Settings** → **Logs** → **Audit log**.

The default view shows the most recent events across all event categories.

### 2. Filter to Copilot events only

In the search bar, use the GitHub audit-log search syntax. The most useful filters for Copilot work:

| Query | Returns |
| --- | --- |
| `action:copilot` | All Copilot events |
| `action:copilot.policy_change` | Only policy edits |
| `action:copilot.coding_agent.task_created` | Only coding-agent task starts |
| `actor:alice` | All events by user `alice` |
| `created:>2026-05-01` | Events on or after that date |
| `repo:lpt-labs/london-premium-transfers` | Events scoped to a single repo |

Combine them with spaces, treated as AND. Example:

```
action:copilot.content_exclusion.block actor:alice created:>2026-05-10
```

### 3. Export entries

From the audit log page:

1. Click the **Export** menu.
2. Choose **JSON** (machine-friendly) or **CSV** (spreadsheet-friendly).
3. The export honours the current filter — apply your filter *before* exporting so you don't have to download every event in the org.

Larger exports are produced asynchronously and emailed to the org owner when ready. Programmatic alternatives (the audit-log REST/GraphQL APIs, or audit-log streaming to a SIEM) live alongside the UI export — see the source URL at the bottom for the API reference.

---

## Retention

Audit-log entries are retained per GitHub's current org-tier retention policy. The exact window has moved more than once and varies between GitHub Free / Team / Enterprise tiers, so this guide deliberately does **not** quote a number that may already be stale.

Source of truth: the Microsoft Learn / GitHub Docs page linked at the bottom of this file. If you need to commit to a number for a compliance question, check the live docs first.

For long-term retention beyond GitHub's window, configure **audit-log streaming** to an external store (S3, Azure Blob, Splunk, etc.). That is configured at the enterprise level and is the only way to retain past GitHub's default.

---

## Expected Behaviour

| Scenario | What you should see |
| --- | --- |
| Org admin changes an MCP allow-list policy | New `action:copilot.policy_change` entry, actor = that admin, within seconds |
| Developer hits a content-exclusion rule | New `action:copilot.content_exclusion.block` entry, actor = that developer, repo set |
| Coding agent assigned to an issue | New `action:copilot.coding_agent.task_created` entry, actor = the assignee (the human who clicked **Assign**) |
| Audit-log export started | New `action:org.audit_log_export` entry — the export itself is auditable |
| Filter syntax has a typo | The page returns zero results without error; check the filter |

---

## How this maps to our repo

We don't currently stream the audit log anywhere — for this repo, "audit-log access" means an org admin opens the UI, filters to the relevant event, and screenshots the result into a PR or postmortem. The screenshot location is documented in [`../AUDIT.md`](../AUDIT.md) under "Screenshots".

If we later wire audit-log streaming to a SIEM, document the destination in `docs/AUDIT.md` "Audit-log access" and add a study-guide pointer here.

---

*Source: [GitHub Docs — Reviewing the audit log for your organization](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization) (verified May 2026). Event names and retention defaults are current as of that date; verify against the live docs if specifics matter for a compliance question.*
