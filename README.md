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

Most production code is written by an **AI coding agent**, not by hand. Humans define structured tasks via the `agent-task` issue template; the agent opens a PR; merge is gated by:

- A required `## Plan` section in the PR body.
- CI status checks (lint, typecheck, build, eval, drift, path-guard).
- CODEOWNERS review.

The repository keeps configuration for two agent ecosystems side by side. **Claude Code** (under `.claude/`) is the active executor. **GitHub Copilot** (under `.github/copilot-instructions.md`, `.github/agents/`, `.github/prompts/`, `.github/hooks/`) is configured as a dormant alternative — the files are kept valid and exam-shaped, ready to activate when a license is available.

The full operating contract lives in [`AGENTS.md`](AGENTS.md). Escalation, retry, and rollback policy lands in `docs/AGENT_PLAYBOOK.md`.

## Local development

### Prerequisites

- Node.js 20+ (use [Corepack](https://nodejs.org/api/corepack.html) or a version manager; Node 25 is currently tested locally)
- pnpm 10+ — install with `corepack enable` or `brew install pnpm`

### Install + run

```bash
pnpm install
pnpm dev          # → http://localhost:3000
```

The placeholder home page should render with a warm-white background, near-black headline, and an italic Instrument-Serif word in the heading — that's the brand wiring proving itself end-to-end. Tokens live in [`lib/design-tokens.ts`](lib/design-tokens.ts); Tailwind utilities are wired in [`app/globals.css`](app/globals.css).

### Other useful commands

```bash
pnpm build              # production build
pnpm start              # serve the production build
pnpm lint               # ESLint
pnpm exec tsc --noEmit  # type-check without emitting JS
```

### Troubleshooting

- **`pnpm install` errors with `ERR_PNPM_IGNORED_BUILDS`** — only `sharp` and `unrs-resolver` are approved (see [`pnpm-workspace.yaml`](pnpm-workspace.yaml)). If a new dependency needs a native build script, **don't run `pnpm approve-builds` blindly** — add it to `pnpm-workspace.yaml` in a PR so the change is reviewable.
- **Fonts look wrong on first paint** — `next/font/google` downloads font files at build time, so an offline first install can produce a layout shift. Re-run `pnpm install` once you're online.

## Project structure

```
app/                  Next.js App Router pages, layout, global CSS, app-scoped CLAUDE.md
lib/                  Shared utilities (lib/design-tokens.ts — brand tokens)
public/               Static assets served verbatim
docs/                 Agent governance docs, audit, agent-task plans
.claude/              Claude Code config: settings, skills, agents
.github/              Templates, instructions, prompts, agents, hooks, workflows
package.json          Dependencies and scripts
pnpm-lock.yaml        Resolved dependency graph (do not hand-edit)
pnpm-workspace.yaml   pnpm 11 build-script allowlist
next.config.ts        Next.js config (kept minimal; Vercel-native)
tsconfig.json         TypeScript compiler config (strict)
eslint.config.mjs     ESLint rules (eslint-config-next + TS rules)
postcss.config.mjs    PostCSS pipeline wiring Tailwind v4
```
