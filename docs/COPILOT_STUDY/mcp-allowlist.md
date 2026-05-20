# MCP Allow-List — Copilot Org Policy Walkthrough

> **Why this file exists.** Part of the MCP governance study guides for this repo. Covers the organization-level Copilot policy UI for controlling which MCP servers developers are permitted to use.
>
> Read alongside [`docs/mcp/README.md`](../mcp/README.md) (concepts) and [`mcp-enterprise.md`](mcp-enterprise.md) (enterprise-level equivalent).

---

## Purpose

The MCP allow-list is a Copilot policy that determines which MCP servers members of your GitHub organization can connect to. It prevents developers from wiring agents to arbitrary external servers and is the primary governance control for MCP at the org level.

---

## UI Path

```
github.com
└── Your profile picture → Organizations
    └── <your-org>
        └── Settings
            └── Copilot (sidebar)
                └── Policies
                    └── Features section → MCP servers in Copilot
```

The exact labels may shift between GitHub releases; the workflow (org → Settings → Copilot → Policies) is stable.

---

## Step-by-Step

### 1. Navigate to org Copilot policies

1. On github.com, click your profile picture in the top-right corner.
2. Select **Your organizations**.
3. Click the org name (e.g. `lpt-labs`).
4. Click **Settings** in the org navigation bar.
5. In the left sidebar, click **Copilot**, then **Policies**.

### 2. Enable MCP servers in Copilot

In the **Features** section, confirm **MCP servers in Copilot** is set to **Enabled**.

If it is disabled, Copilot will not offer MCP tooling to org members regardless of other settings.

### 3. (Optional) Configure a custom registry

In the **MCP Registry URL** field:

1. Paste your registry's base URL. Example:
   ```
   https://mcp-registry.example.com
   ```
   If using **Azure API Center**, paste the base endpoint URL only — do *not* append `/v0.1/servers`; Copilot appends the path itself.
2. Click **Save**.

Once saved, the registry becomes the source from which org members can discover available MCP servers in their IDEs.

### 4. Set the allow-list mode

In the **Restrict MCP access to registry servers** field, choose one of two modes:

| Mode | What it does |
|---|---|
| **Allow all** | No restrictions. Developers can add and use any MCP server URL, including ones not in the registry. |
| **Registry only** | Only servers defined in the configured registry are permitted. Local servers must appear in the registry with matching server IDs — Copilot verifies the ID before allowing the connection. |

Click **Save** after selecting a mode. The policy takes effect immediately for all org members.

---

## Sample Config (resulting .vscode/mcp.json at developer level)

When **Registry only** is active and the registry lists the GitHub MCP server, a developer's workspace config looks like:

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

A local server (`http://localhost:3000`) would only appear if it is also registered in the org's custom registry with the same `local-docs` server ID.

---

## Expected Behaviour

| Policy set | Developer experience |
|---|---|
| MCP disabled | No MCP panel in Copilot Chat; no server configuration options |
| Enabled + Allow all | MCP panel visible; developer can add any URL; no registry required |
| Enabled + Registry only (no registry URL) | Copilot may show an empty server list or fall back to the default GitHub registry |
| Enabled + Registry only + registry URL configured | Developer sees only registry-approved servers; attempts to add an unlisted URL are blocked |

---

## Comparison: Org vs Enterprise level

The org-level policy applies to members of a single GitHub organization. For orgs that belong to an enterprise, the **enterprise-level** AI controls (Settings → AI controls → MCP) can set policies that cascade down to all child orgs — org admins cannot override enterprise-level restrictions. See [`mcp-enterprise.md`](mcp-enterprise.md) for the enterprise UI walkthrough.

---

*Sources: [Microsoft Learn — MCP servers, registries, and allow lists](https://learn.microsoft.com/en-us/training/modules/agent-tooling-mcp-execution-environments/3-model-context-protocol-servers-registries-allow-lists) (verified May 2026). UI labels are current as of that date; verify against the live UI if steps diverge.*
