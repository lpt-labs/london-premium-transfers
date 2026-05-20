# MCP Custom Registry — Hosting Guide

> **Why this file exists.** Part of the MCP governance study guides for this repo. Covers what a custom MCP registry is, the spec it must follow, and the Azure API Center alternative.
>
> Read alongside [`docs/mcp/README.md`](../mcp/README.md) (concepts) and [`mcp-allowlist.md`](mcp-allowlist.md) (how the allow-list references the registry).

---

## Purpose

A custom MCP registry gives an organization control over which MCP servers appear in developers' IDE discovery panels. Instead of pointing developers at the public GitHub registry (which lists community servers), you host a catalog of org-approved servers and reference it in your Copilot policy.

This is useful when:

- Your org has internal MCP servers that aren't on the public registry.
- You want to curate a short list of approved servers rather than exposing the full community catalog.
- Compliance or security policies require all tooling to originate from an org-controlled source.

---

## Hosting Options

| Option | What it is |
|---|---|
| Fork the open-source MCP Registry | Self-host the reference implementation on your own infrastructure |
| Run locally via Docker | `docker run` the open-source image; useful for proof-of-concept |
| Build a custom implementation | Any HTTP server that meets the v0.1 spec below |
| **Azure API Center** | Microsoft-managed alternative; acts as a registry when anonymous access is enabled |

---

## MCP Registry v0.1 Spec

A registry is any HTTPS endpoint that satisfies three requirements: the required endpoints, the required CORS headers, and (if listing local servers) consistent server IDs.

### Required endpoints

```
GET /v0.1/servers
GET /v0.1/servers/{serverName}/versions/latest
GET /v0.1/servers/{serverName}/versions/{version}
```

- `GET /v0.1/servers` returns a list of available server definitions.
- The two `versions` endpoints return metadata for a specific server version, including the connection details Copilot needs to install and use the server.

### Required CORS headers

Copilot clients (including VS Code extensions running in browser contexts) must be able to fetch the registry from a different origin. Every response from the registry must include:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

Without these headers, browser-side Copilot clients will receive CORS errors and the registry will not load.

### Local server entries

If your allow-list policy is set to **Registry only** and you want developers to use local MCP servers (e.g. `http://localhost:3000`), those servers must be listed in the registry. The `serverName` in the registry entry must match the key developers use in `.vscode/mcp.json` exactly — Copilot checks the ID before permitting the connection.

---

## Azure API Center as a Managed Registry

Azure API Center can serve as an MCP registry without requiring you to run custom infrastructure.

Steps (high level):

1. Create or use an existing Azure API Center instance.
2. Register your MCP servers as APIs in API Center.
3. Enable anonymous access on the API Center instance so Copilot can read it without credentials.
4. Copy the API Center **base endpoint URL**.
5. In GitHub Copilot org or enterprise settings, paste that base URL into the **MCP Registry URL** field — do **not** append `/v0.1/servers`; Copilot appends the path automatically.

Azure API Center handles the CORS configuration and endpoint routing required by the v0.1 spec, removing the need to maintain a separate registry service.

---

## Registering the Registry in GitHub

Once your registry is hosted:

**Organization level:** Settings → Copilot → Policies → MCP Registry URL field → paste URL → Save.

**Enterprise level:** Settings → AI controls → MCP → MCP Registry URL field → paste URL → Save.

After saving, the registry becomes the discovery source for all org/enterprise members. Pair it with **Registry only** mode in the allow-list to prevent use of unapproved servers.

---

## What This Is Not

This guide describes the registry concept and spec requirements — not a step-by-step tutorial for deploying a registry. For production deployment, consult:

- The open-source MCP Registry repository for self-hosted options.
- Azure API Center documentation for the managed path.
- Your organization's infrastructure team for network, auth, and uptime requirements.

---

*Sources: [Microsoft Learn — MCP servers, registries, and allow lists](https://learn.microsoft.com/en-us/training/modules/agent-tooling-mcp-execution-environments/3-model-context-protocol-servers-registries-allow-lists) (verified May 2026).*
