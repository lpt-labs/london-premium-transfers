# GitHub Agentic Workflows — frontmatter, compile step, and guardrails

> **Why this file exists.** The repo's [`README.md`](../../README.md) and [root `CLAUDE.md`](../../CLAUDE.md) keep GitHub Copilot configured as a *dormant alternative* to Claude Code. This guide documents one such dormant artifact: [`.github/workflows/daily-repo-status.md`](../../.github/workflows/daily-repo-status.md), a GitHub Agentic Workflow (gh-aw) source file that would, on activation, run an autonomous scheduled agent and open a daily `[repo-status]` issue. The active equivalent — a Claude Code Routine that does the same job from Claude's web UI — is documented at [`docs/CLAUDE_ROUTINES/daily-repo-status.md`](../CLAUDE_ROUTINES/daily-repo-status.md). This file explains the gh-aw side: what the file *is*, how its boundaries are enforced, why it is dormant here, and what activation would look like.
>
> Read alongside [`AGENTS.md`](../../AGENTS.md) (the operating contract — every agent reads it), [`.github/workflows/CLAUDE.md`](../../.github/workflows/CLAUDE.md) (workflow-edit rules), and [`docs/COPILOT_STUDY/agent-firewall.md`](./agent-firewall.md) (the outbound-network policy that complements the in-workflow guardrails described below).

## Contents

1. [What the file is](#what-the-file-is)
2. [The compile step](#the-compile-step)
3. [Five guardrails](#five-guardrails)
4. [Why this repo's file is dormant](#why-this-repos-file-is-dormant)
5. [Activation steps](#activation-steps)

---

## What the file is

A GitHub Agentic Workflow source is a Markdown file with a YAML frontmatter block. It is a **two-part contract**:

- **Frontmatter declares boundaries.** When the workflow runs (`on:`), what the agent process is allowed to read (`permissions:`), which tools and MCP servers it can call (`tools:`), and what side effects it is permitted to propose (`safe-outputs:`). Nothing outside this declaration can happen at runtime — the frontmatter is enforced, not advisory.
- **The Markdown body is the prompt.** Plain prose describing the intent: what the agent should produce, what to cover, what to link. The body is what the model sees at runtime; the frontmatter is what the platform enforces around the body.

The split matters: the body can be rewritten freely without re-reviewing security posture, and the frontmatter can be tightened without re-reviewing the prompt. Reviewers can split attention the same way a hardware/software separation lets two teams move at different speeds.

In this repo the dormant example file lives at [`.github/workflows/daily-repo-status.md`](../../.github/workflows/daily-repo-status.md), matching the current upstream `gh-aw` convention (workflow sources colocated with regular Actions YAML; the `.md` extension is what distinguishes them from runnable `.yml` workflows).

## The compile step

A `.md` source is not what GitHub Actions runs. The `gh-aw` toolchain — a GitHub Next CLI plus a GitHub App — **compiles** each source into a sibling `<name>.lock.yml` workflow. That lock file is a regular GitHub Actions workflow, committed alongside the source, and it is what the Actions runner actually executes on schedule. One cycle, end to end:

1. Author edits the `.md` source (changes the prompt, tightens a permission, adds a tool).
2. `gh-aw` compiles. The output is a new `<name>.lock.yml` with the updated frontmatter baked into job-level `permissions:`, `env:`, and step structure.
3. The new lock file is committed in the same PR as the source change. The diff on the lock file is what reviewers actually read for blast-radius questions — the source-file diff is for intent.
4. On the next scheduled tick, GitHub Actions runs the lock file. The agent process starts with exactly the boundaries the frontmatter declared.

Two things follow from this design. First, the source and the lock file are a matched pair — drift between them means a stale review, which is why compile-on-edit is part of the normal authoring loop. Second, an audit of "what is the platform actually executing today?" is a `git log` on the lock file, not the source.

## Five guardrails

These are the structural protections that hold even if the model itself is misled by a prompt injection from data it reads. Each is enforced outside the model's control.

### 1. Read-only tokens by default

The agent process runs with the minimum scopes the frontmatter declares — in this repo's dormant file, `contents: read`, `issues: read`, `pull-requests: read`, and nothing else. No `write` anywhere on the agent itself. If a malicious page in a fetched URL convinces the model to "open a PR deleting the production deploy workflow," the model can decide to try, but the token it holds simply cannot perform the call. The control is **token-shaped, not policy-shaped**: there is no string for the model to talk its way past.

### 2. Safe-outputs run as a separate gated step

Anything that mutates the repo — issue creation, comments, labels, PRs — is declared in `safe-outputs:` and applied by a **separate post-agent step** that runs after the agent process exits. The agent does not hold a write token at any point; it produces a *proposal* (the issue body, the title, the labels) and the gated step is what calls the GitHub API. The dormant file in this repo declares `safe-outputs.create-issue` with `title-prefix: "[repo-status] "` and `labels: [report]` — that is the entire mutation surface. Any other write attempt by the agent process is a runtime failure, not a successful write the gated step then has to defend against.

### 3. No plaintext secrets in the agent process

Secrets — API keys, MCP server credentials, anything the gated step needs — are injected into the **post-agent step's environment**, not the agent's. The agent process never sees them. This bounds the prompt-injection surface: a successful injection might convince the model to emit "please print the value of `MY_SECRET`," but `MY_SECRET` is not in the environment the model can introspect. The same envelope-shape thinking as guardrail 1: the secret isn't withheld by policy, it isn't present.

### 4. Sandbox plus network allowlist

The agent runs in an ephemeral sandbox with an outbound network allowlist. Calls to hosts outside the allowlist are denied at the resolver, before any TLS handshake. This is the same model the Copilot Coding Agent firewall uses (see [`agent-firewall.md`](./agent-firewall.md)) and exists for the same reason: if the model is talked into exfiltrating data, "the network call to `attacker.example.com` simply did not resolve" is a stronger guarantee than "we trained the model to refuse exfiltration."

### 5. Threat detection on proposed outputs

Before the gated step applies any proposed `safe-outputs:` mutation, the proposal is scanned. The scan looks for prompt-injection patterns inside the proposed text (e.g., the agent has been convinced to embed an instruction aimed at the *next* agent that reads the issue), unexpected output shapes (a 50KB body when the prompt asked for bullets), and known-bad patterns. Suspicious proposals are quarantined rather than applied. This is the last layer — it catches cases where the model produced output the upstream guardrails didn't filter.

The combination is defense-in-depth: token shape (1), separation of steps (2), secret placement (3), network reachability (4), and content review (5). Bypassing one is not enough.

## Why this repo's file is dormant

Three independent gates are currently closed, any one of which would keep the file inert:

- **No `gh-aw` installation.** The CLI + GitHub App that compiles `.md` sources to `.lock.yml` is not installed against `lpt-labs/london-premium-transfers`. Nothing watches the file or produces a lock.
- **No Copilot license.** The `gh-aw` runtime expects an active GitHub Copilot subscription; the user does not currently hold one.
- **GitHub Actions ignores `.md` in `.github/workflows/`.** The runner only consumes `.yml` and `.yaml`. A bare `.md` source with no `.lock.yml` next to it is invisible to Actions.

To validate the file is *syntactically* valid without running it, parse the frontmatter directly:

```bash
yq eval '.permissions' .github/workflows/daily-repo-status.md
# expected: a map with contents/issues/pull-requests, each value `read`
```

The visual check is against the gh-aw frontmatter reference at <https://github.com/githubnext/gh-aw> — confirm `on.schedule`, `permissions:`, `tools:`, and `safe-outputs:` keys are all recognised top-level fields. Note that the HTML comment above the frontmatter is tolerated by markdown-with-frontmatter parsers but may need to move inside the body if a stricter parser is used at activation time.

## Activation steps

For the day a Copilot license arrives and `gh-aw` is enabled against this repo:

1. **Install the `gh-aw` GitHub App** on the `lpt-labs` organisation and grant it access to `london-premium-transfers`. The app is what watches `.github/workflows/*.md` and produces the matching `.lock.yml`.
2. **Push a no-op commit** that touches the source file (e.g., trim trailing whitespace, re-save). This triggers the first compile.
3. **Verify the generated `.lock.yml`** lands in `.github/workflows/daily-repo-status.lock.yml`. Read the diff — job-level `permissions:` should match the source frontmatter exactly; `safe-outputs.create-issue` should appear as a separate post-agent step in the compiled workflow, not as a step the agent itself executes.
4. **Remove the DORMANT header comment** from the source file — same PR as activation, same diff. Update this guide to flip the file's status from dormant to active.
5. **Watch the first scheduled run** (the file schedules `0 9 * * *` — daily 09:00 UTC). Confirm one issue lands with title prefix `[repo-status] ` and label `report`. If it does not, check the workflow run logs for whether the agent process exited cleanly and whether the gated post-agent step then ran and was authorized to write.
6. **Re-review the Claude Code Routine** at [`docs/CLAUDE_ROUTINES/daily-repo-status.md`](../CLAUDE_ROUTINES/daily-repo-status.md). Two daily issues with the same prefix is probably not what we want; either pause the routine in Claude's web UI, change one prefix, or accept the duplicate as a deliberate cross-check.
