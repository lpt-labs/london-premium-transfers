# London Premium Transfers

Marketing site for a luxury London chauffeur and private-hire service. Built with Next.js (App Router) and Tailwind CSS, deployed on Vercel.

## Purpose

This repository serves two goals:

1. **Production site** — the public marketing surface for London Premium Transfers.
2. **GH-600 practice environment** — a hands-on testbed for [Microsoft Exam GH-600: Developing in Agentic AI Systems](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-600). Every governance artifact in this repo (instructions, chat modes, custom agents, MCP config, workflows, hooks, audit docs) maps to a specific GH-600 skill domain.

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **TypeScript**
- **pnpm** package manager
- **Vercel** hosting (preview per PR, production on `main`)

## How agents work in this repo

Most production code is written by **GitHub Copilot Coding Agent**, not by hand. Humans (and Claude Code, used as planner/reviewer) define structured tasks via the `agent-task` issue template; the agent opens a PR; merge is gated by:

- A required `## Plan` section in the PR body.
- CI status checks (lint, typecheck, build, eval, drift, path-guard).
- CODEOWNERS review.

Detailed agent operating contract lands in `AGENTS.md` (PR 2). Escalation, retry, and rollback policy land in `docs/AGENT_PLAYBOOK.md` (PR 7).

## Local development

> Setup steps land in PR 4 when the Next.js scaffold is added.

```bash
pnpm install
pnpm dev
```

## Project structure (planned)

```
app/            Next.js App Router pages
components/     React components
lib/            Shared utilities, design tokens
scripts/        One-off scripts
docs/           Agent governance docs and audit
.github/        Templates, instructions, prompts, chat modes, agents, hooks, workflows
```
