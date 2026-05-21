# Cloud Agent Firewall — Copilot Coding Agent outbound controls

> **Why this file exists.** The repo's [`README.md`](../../README.md) and [root `CLAUDE.md`](../../CLAUDE.md) state that GitHub Copilot is configured as a *dormant alternative* to Claude Code: the `.github/` instruction files, custom agents, prompts, and hooks are kept valid so the day a Copilot license is available, Copilot can take over without rewiring the repo. The hook layer that landed in this PR — `.github/hooks/*.json` (dormant) and [`.claude/settings.json`](../../.claude/settings.json) (active) — addresses what an agent is allowed to **do** locally (which commands it can run). This guide addresses the orthogonal question: what hosts the agent is allowed to **reach** when it does run. The two together form the agent's safety envelope.
>
> Read this alongside [`AGENTS.md`](../../AGENTS.md) (the operating contract — both agents read it), [`docs/COPILOT_STUDY/cloud-agent-assignment.md`](./cloud-agent-assignment.md) (where the agent runs end-to-end), and [`.github/workflows/CLAUDE.md`](../../.github/workflows/CLAUDE.md) (the workflow-level controls that gate CI egress, which the firewall complements rather than replaces).

## Contents

1. [What the firewall is, and what it isn't](#what-the-firewall-is-and-what-it-isnt)
2. [UI path](#ui-path)
3. [Enabling the firewall](#enabling-the-firewall)
4. [Switching to a custom allowlist](#switching-to-a-custom-allowlist)
5. [Typical allowlist entries for this repo](#typical-allowlist-entries-for-this-repo)
6. [What happens when the agent contacts a denied host](#what-happens-when-the-agent-contacts-a-denied-host)
7. [Relation to workflow-level controls](#relation-to-workflow-level-controls)
8. [Operational notes](#operational-notes)
9. [Verification — sources and inferred content](#verification--sources-and-inferred-content)

---

## What the firewall is, and what it isn't

The Copilot Coding Agent firewall is an **outbound network policy** applied to the ephemeral sandbox VM that runs the agent. When the agent (or any tool it invokes — `pnpm install`, `curl`, `gh`, a fetch in a build script) opens a TCP connection or makes an HTTPS request, the connection is filtered through the policy before it leaves the sandbox.

What it controls:

- DNS resolution for hosts not on the allowlist (failed at the resolver, so the request never goes on the wire).
- HTTPS/HTTP egress to disallowed hosts.
- Outbound connections from any process spawned inside the agent's session (including subprocesses of `pnpm`, build hooks, etc.).

What it does **not** control:

- Inbound connections (there are none; the sandbox isn't reachable from outside).
- Local filesystem access (that's the per-tool hooks' job — `.claude/settings.json` PreToolUse on the Claude side, `.github/hooks/pre-tool-use.json` on the dormant Copilot side).
- Which commands the agent is *willing* to run (that's the agent's own policy + the local hook).
- What happens in a workflow run on GitHub Actions infrastructure. That's a separate environment with its own network policy and is covered by `.github/workflows/CLAUDE.md`.

Mental model: the local hooks decide *whether the command runs at all*; the firewall decides *what the command can reach* if it does.

## UI path

```
github.com/lpt-labs/london-premium-transfers
  → Settings
  → Copilot
  → Coding agent
  → Firewall
```

Exact label wording drifts (Microsoft renames Copilot surfaces frequently). If the path above is stale, look for any tab under repo *Settings → Copilot* whose subtitle mentions "network", "egress", "allowlist", or "outbound". The settings exist at the **repository** level; org-level defaults can be inherited but per-repo overrides win.

You need repo admin permissions to view or edit this page. Read-only members see nothing under *Settings*.

## Enabling the firewall

By default, the firewall is **on but in permissive mode** — Copilot ships with a default allowlist that covers common package registries, GitHub itself, and the agent's own control plane (Anthropic/OpenAI API endpoints depending on the model the agent uses). The first decision is whether to keep the default or move to a stricter custom list.

Toggle the page setting *Firewall*: **Enabled** (recommended; the alternative is *Disabled* which permits all egress and is intended only for short debugging sessions). When enabled, two modes appear:

1. **Default allowlist** — Microsoft-maintained set of hosts the agent is expected to reach. Good starting point.
2. **Custom allowlist** — your own list. Overrides the default entirely; the default is *not* implicitly included.

If you switch to custom, you take over responsibility for the package-manager and registry entries that came with the default — leaving them out will silently break `pnpm install` and similar commands.

## Switching to a custom allowlist

The custom-allowlist editor accepts entries one per line. Each entry is a host pattern:

| Pattern | Matches |
| --- | --- |
| `registry.npmjs.org` | Exact host. |
| `*.githubusercontent.com` | Any single-level subdomain of `githubusercontent.com`. |
| `**.vercel.app` | Any subdomain depth (preview deploys with random slugs). |
| `api.anthropic.com:443` | Host plus port (use only when you want to restrict the port too). |

IP ranges (CIDR) are accepted in some rollouts, not others. Prefer host patterns when possible — they survive infrastructure changes upstream.

Save publishes the change immediately to **future** sessions. Sessions already running keep their original policy until they finish.

## Typical allowlist entries for this repo

Below is the minimum set you'd put in the custom allowlist to let Copilot execute the work this repo does. Each entry is annotated with what would break without it.

```
# Package managers
registry.npmjs.org              # pnpm install, npm registry metadata
*.npmjs.org                     # CDN edges for tarballs

# GitHub
github.com                      # git fetch/push, gh CLI, REST/GraphQL API
api.github.com                  # gh CLI authenticated calls
*.githubusercontent.com         # raw file fetches, release tarballs

# Node / build toolchain
nodejs.org                      # node version checks, occasional postinstall fetches
*.vercel.app                    # preview-deploy URL probes during verification
vercel.com                      # vercel CLI auth flow
api.vercel.com                  # vercel CLI deployments

# Fonts and assets (Next.js + next/font defaults)
fonts.googleapis.com            # next/font/google metadata
fonts.gstatic.com               # font binary CDN

# The agent's own control plane
api.anthropic.com               # if Copilot is wired to Claude as backend model
api.openai.com                  # if Copilot is wired to GPT as backend model
# (only one of the two is needed; org admin chooses the backing model)
```

Hosts you'd deliberately leave **out** unless a task requires them:

- Public paste services (`pastebin.com`, `gist.github.com` as a non-API host) — agent has no business writing data off-repo.
- Generic webhooks (`hooks.slack.com`, `discord.com/api/webhooks`) — agent shouldn't post to external chat from inside a session.
- Crypto/RPC endpoints, public LLM proxies, scraping APIs — out of scope for this repo's work.

If a task genuinely needs an unusual host (e.g., a one-off fetch from a design partner's CDN), add it for the duration of the session and remove it afterwards. The agent does not need standing access to every host any task might ever need.

## What happens when the agent contacts a denied host

Concretely: the connection fails at the DNS or TLS handshake layer. The error surfaces to whichever tool was making the request:

- `pnpm install` against a denied registry — `ETIMEDOUT` or `ENOTFOUND` printed by pnpm. The install aborts.
- `curl https://denied.example.com` — `Could not resolve host` and exit code 6.
- A `fetch()` call inside a build script — `TypeError: fetch failed` with cause `getaddrinfo ENOTFOUND`.
- The agent's own backend call (if you misconfigured the allowlist) — the agent session itself fails to start, with a message on the PR like *"I'm unable to reach my model endpoint. Check the firewall allowlist."*

The session log records the denied attempt. This matters for debugging: a workflow that suddenly fails after a default-allowlist change will show the denied host in the log, not a cryptic timeout chain. Always start triage there.

The firewall **does not** kill the session — it just blocks the connection. The agent can retry, fall back, or report the problem in the PR. That's the same posture the per-tool hooks take (fail-open on internal hook errors, exit 2 only on a deliberate block).

## Relation to workflow-level controls

The firewall and the workflow-level controls live in different layers and protect against different threats. Both are needed.

| Layer | What it controls | Where it's configured | Threat addressed |
| --- | --- | --- | --- |
| Per-tool hook | Whether a command runs at all | `.claude/settings.json` (active) / `.github/hooks/*.json` (dormant) | Agent attempts a destructive local command (`rm -rf /`, force-push to main, `gh repo delete`). |
| Cloud agent firewall | What the running session can reach | Repo *Settings → Copilot → Coding agent → Firewall* | Agent (compromised, confused, or misled by a prompt-injection) attempts exfiltration to an attacker-controlled host, or pulls a malicious dependency from an unexpected registry. |
| Workflow permissions | What `GITHUB_TOKEN` can write to | `permissions:` block in each workflow file; documented in [`.github/workflows/CLAUDE.md`](../../.github/workflows/CLAUDE.md) and [`.github/instructions/workflows.instructions.md`](../../.github/instructions/workflows.instructions.md) | Workflow runs with more authority than the job needs (e.g., `contents: write` granted "just in case"). |
| Branch protection | Whether `main` accepts a push at all | Repo *Settings → Rules* (ruleset `protect-main`) | Bypass of review on the default branch, regardless of which agent or which workflow produced the commit. |

Reading the table top to bottom: the hook decides *if the command runs*, the firewall decides *what the network reaches*, the workflow permissions decide *what the CI job can write*, and branch protection decides *what gets to land on `main`*. Skipping any one of those layers leaves a hole the other three can't compensate for.

The closest sibling to the firewall is the workflow `permissions:` discipline — both are about least-privilege at runtime. Where they differ: workflow permissions are GitHub-API scoped (can this job write to `contents`?), firewall rules are network-scoped (can this session reach this host?). A workflow can have `contents: read` and still attempt to upload to an external service; the firewall stops the second half. Conversely, the firewall can be wide-open but the workflow's `permissions:` block keeps the `GITHUB_TOKEN` from doing damage inside GitHub.

## Operational notes

These are the things that come up in practice. Documenting them here so future-you doesn't burn a session learning them the hard way.

1. **A custom allowlist replaces the default; it doesn't extend it.** This is the most common foot-gun. After switching to custom, copy the default entries first, then prune — don't start from empty unless you mean it.

2. **Changes apply to new sessions only.** A running agent keeps its policy until the session ends. If you change the allowlist mid-PR to unblock the agent, you'll need to ask the agent to start a new session (e.g., assign the issue again, or `@copilot retry`).

3. **Per-task scope ≠ per-task allowlist.** The allowlist is repo-wide; there's no per-task or per-PR overlay. If a task needs a one-off host, add it, run the task, remove it. Keep the diff narrow by changing the allowlist in a dedicated PR that's labeled `infra-change` (same hygiene as touching `.github/workflows/`).

4. **DNS over HTTPS / DoH can bypass the firewall on some rollouts.** If a process resolves DNS through `1.1.1.1` over HTTPS, the firewall (which often hooks the system resolver) may not see the lookup. In practice this hasn't been a problem for the tools this repo uses, but it's worth knowing if a denied host mysteriously still works.

5. **Default-allowlist drift.** Microsoft updates the default allowlist over time. Pinning a custom list gives you a stable baseline at the cost of having to track upstream changes manually (e.g., when npm adds a new CDN host). For most teams the default is fine until something breaks.

6. **The firewall does not log to the audit log in the repo.** Denied attempts appear in the **session log comment** on the PR. They are not piped into `.agent-scratch/audit.log`, because that log is local to the Claude/Copilot tool layer, not the cloud sandbox. The two log surfaces are independent.

7. **No equivalent exists for Claude Code today.** Claude runs locally; outbound network policy is whatever your machine and your shell allow. If you want network-layer control on the Claude side, that lives at the OS firewall, not in `.claude/settings.json`. This is an asymmetry between the two agents worth keeping in mind.

---

## Verification — sources and inferred content

This guide is written by Claude Code from a mix of:

- **Verified against this repo's actual files**: every cross-link, every file path under `.github/` and `.claude/`, the dormant-vs-active framing, the table of layers in [Relation to workflow-level controls](#relation-to-workflow-level-controls). If a reference here doesn't match what's on disk, the file on disk wins.
- **Verified from public GitHub Copilot Coding Agent documentation** (knowledge cutoff: January 2026): the existence of a per-repo firewall toggle under *Settings → Copilot → Coding agent*, the default-vs-custom-allowlist split, the failure mode on a denied host (DNS / connection failure surfaced to the calling tool), the session-log surfacing of denied attempts. The high-level shape is documented; specific UI strings may drift.
- **Inferred from documented behaviour but not literally observed**: the exact wording of error strings ("Could not resolve host", "I'm unable to reach my model endpoint"); the precise CIDR-vs-host-pattern support matrix (varies by rollout); the DoH bypass observation. Treat these as plausibly-correct illustrations, not click-by-click ground truth. **The author has not personally configured the firewall against this repo or any other** — when in doubt, consult the live documentation at https://docs.github.com/en/copilot/customizing-copilot.
- **Out of scope intentionally**: org-level Copilot policy that overrides per-repo settings (covered separately in GitHub Enterprise admin docs); audit-log integration with external SIEM tools; firewall behaviour during scheduled (non-interactive) agent runs.

If a future reader configures the firewall for the first time and notices a step diverges from what's written here, **update this file** — it's a living document.
