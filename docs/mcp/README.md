# MCP: Servers, Registries, and Allow-Lists

Model Context Protocol (MCP) lets AI clients — IDE chat panels, coding agents, CLI tools — talk to external systems through a consistent interface. Three distinct concepts compose to make this work at scale in a team or enterprise setting.

---

## MCP Server

An MCP server is the component that actually exposes capabilities to an AI client.

Think of it as an adapter layer: it sits between the AI client and the real underlying system (a code host, a database, a REST API, a local filesystem), and it presents that system's actions as tools the AI can call. The client sends a structured request; the server executes the real operation and returns a structured result.

**Placement options:**

| Where the server runs | When to use |
|---|---|
| Locally on a developer's machine | Tight control, access to local files, custom setup |
| Remotely as a hosted service | Lower setup friction, shared across environments |

The GitHub MCP server (`https://api.githubcopilot.com/mcp/`) is a hosted example — connecting AI clients to GitHub repositories, issues, and pull requests. A local example (`http://localhost:3000`) represents a server you run on your own machine, useful for tooling that isn't publicly hosted.

**VS Code `.vscode/mcp.json` shape:**

```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "local-docs": {
      "type": "http",
      "url": "http://localhost:3000"
    }
  }
}
```

> `local-docs` above is a placeholder showing the local-server pattern. It is not an actively running server — replace the URL with a real endpoint before use.

---

## MCP Registry

A registry is a catalog of approved MCP servers that a client can discover automatically.

Without a registry, every developer manually edits config files to add servers. With one, a developer opens the MCP panel in their IDE, browses available servers, and installs in a few clicks — much like an extension marketplace but for tools.

**What a registry must expose (v0.1 spec):**

```
GET  /v0.1/servers
GET  /v0.1/servers/{serverName}/versions/latest
GET  /v0.1/servers/{serverName}/versions/{version}
```

**Required CORS headers** (so clients that run in browser contexts can fetch it):

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

**Hosting options:**

- Fork and self-host the open-source MCP Registry.
- Run the open-source registry locally via Docker.
- Build a custom implementation that meets the spec.
- Use **Azure API Center** as a managed alternative — enable anonymous access and use the API Center endpoint URL as the registry URL (without the `/v0.1/servers` suffix).

See [`docs/COPILOT_STUDY/mcp-custom-registry.md`](../COPILOT_STUDY/mcp-custom-registry.md) for a fuller walkthrough.

---

## Allow-List

An allow-list is an org or enterprise-wide policy that controls which MCP servers developers are permitted to use.

MCP broadens what an agent can reach. Without guardrails, a developer could wire an agent to a server that exposes sensitive internal systems or executes unsafe operations. An allow-list closes that gap by restricting connections to approved entries.

**Two modes:**

| Mode | What it allows |
|---|---|
| **Allow all** | No restrictions — developers can add and use any MCP server |
| **Registry only** | Only servers listed in the configured registry are permitted; local servers must also appear in the registry with matching IDs |

Policies are applied at either the **organization** level (Settings → Copilot → Policies) or the **enterprise** level (AI controls → MCP) — see the study guides under `docs/COPILOT_STUDY/` for UI walkthroughs of both.

---

## How They Compose

```
Developer IDE  ──calls──►  MCP Server  ──bridges──►  GitHub / DB / API
                               ▲
                          discovered via
                               │
                           Registry
                               ▲
                          filtered by
                               │
                           Allow-List (org / enterprise policy)
```

A realistic flow:

1. The org configures a registry and sets a **Registry only** allow-list.
2. Developers open the MCP panel in their IDE; they see only the registry-approved servers.
3. A developer enables the GitHub MCP server.
4. The agent uses that server's tools during a coding task — no manual config required, and no unapproved servers can be added.

The server provides capability. The registry makes servers discoverable and trustable. The allow-list decides what's permitted. Together they make MCP both scalable and governable.
