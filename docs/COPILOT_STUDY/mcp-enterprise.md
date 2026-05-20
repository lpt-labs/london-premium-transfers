# MCP Enterprise Controls — GitHub Enterprise UI Walkthrough

> **Why this file exists.** Part of the MCP governance study guides for this repo. Covers the enterprise-level AI controls UI for MCP and how it differs from the organization-level screens.
>
> Read alongside [`docs/mcp/README.md`](../mcp/README.md) (concepts) and [`mcp-allowlist.md`](mcp-allowlist.md) (org-level equivalent).

---

## Purpose

Large organizations that belong to a GitHub Enterprise account can govern MCP at the enterprise level, setting policies that cascade down to every child organization. This is distinct from the per-organization policies covered in [`mcp-allowlist.md`](mcp-allowlist.md): enterprise-level rules take precedence, and org admins cannot override them.

---

## UI Path

```
github.com
└── Your enterprise account (e.g. enterprise.github.com/<slug>)
    └── Settings (top of enterprise admin panel)
        └── AI controls (sidebar section)
            └── MCP
```

This is one level above org settings. You reach it through the enterprise admin console, not through an individual organization's settings.

---

## Step-by-Step

### 1. Navigate to enterprise AI controls

1. On github.com, click your profile picture and select the enterprise admin link, or navigate directly to your enterprise URL.
2. In the enterprise admin navigation, click **Settings** at the top of the page.
3. In the left sidebar, find the **AI controls** section.
4. Click **MCP**.

### 2. Enable MCP servers enterprise-wide

Confirm that **MCP servers in Copilot** is set to **Enabled everywhere**.

- **Enabled everywhere** — all orgs in the enterprise have MCP available; individual org admins can choose to restrict further but cannot re-enable if enterprise disables it.
- **Disabled** — MCP is unavailable for all orgs regardless of their local settings.

### 3. Configure the enterprise registry

In the **MCP Registry URL** section:

1. Enter your enterprise-wide registry URL.
2. Click **Save**.
3. If using Azure API Center, enter the base URL only (without `/v0.1/servers`).

This registry applies to all orgs in the enterprise unless an org overrides it with its own registry URL (allowed only when the enterprise policy is **Allow all** or when org-level override is explicitly permitted).

### 4. Set the enterprise allow-list mode

In **Restrict MCP access to registry servers**, choose:

| Mode | Enterprise-wide effect |
|---|---|
| **Allow all** | Org admins can set their own mode; developers in orgs that don't restrict further can use any server |
| **Registry only** | All orgs inherit **Registry only**; org admins cannot loosen this to **Allow all** |

Click **Save**. The policy propagates to child orgs immediately.

---

## What's Different from Org-Level

| Aspect | Org level | Enterprise level |
|---|---|---|
| UI location | org → Settings → Copilot → Policies | enterprise → Settings → AI controls → MCP |
| Scope | Single organization | All orgs in the enterprise |
| Override authority | Can set its own mode (unless enterprise restricts) | Sets the ceiling — orgs cannot override |
| Registry URL | Per-org registry; org policy references it | Enterprise-wide registry; cascades to all orgs |
| Primary actor | Org admin | Enterprise admin |

In practice: if the enterprise sets **Registry only** with a corporate registry, org admins can narrow the allowed list further (by providing a subset registry) but cannot open it back to **Allow all**.

---

## Expected Behaviour

| Enterprise setting | What org admins see | What developers experience |
|---|---|---|
| MCP disabled at enterprise | MCP toggle greyed out in org settings | No MCP panel in Copilot Chat |
| Enabled + Allow all (no enterprise registry) | Can set their own mode and registry | Depends on org-level policy |
| Enabled + Registry only + enterprise registry | Inherits Registry only; can supply a narrower org registry | Only servers in the (org or enterprise) registry are available |
| Enabled + Allow all + enterprise registry | Org can override mode; enterprise registry is the default | Depends on org override |

---

## Relationship to GitHub Enterprise Server vs Cloud

- **GitHub Enterprise Cloud** (github.com + enterprise billing): the enterprise admin console is at your enterprise slug on github.com. Both local and remote MCP server configuration are supported.
- **GitHub Enterprise Server** (self-hosted): supports local MCP server configuration; the remote hosted server option (`https://api.githubcopilot.com/mcp/`) requires enterprise outbound internet access to GitHub's API infrastructure.

---

*Sources: [Microsoft Learn — MCP servers, registries, and allow lists](https://learn.microsoft.com/en-us/training/modules/agent-tooling-mcp-execution-environments/3-model-context-protocol-servers-registries-allow-lists) (verified May 2026). Enterprise admin UI labels may shift between GitHub releases; the structural path (enterprise → Settings → AI controls → MCP) is stable.*
