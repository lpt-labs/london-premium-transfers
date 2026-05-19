# CLAUDE.md

Instructions for Claude Code working in this repository.

## Read first

[`AGENTS.md`](AGENTS.md) is the operating contract — every rule there applies to you. This file only adds Claude-specific notes.

## Role in this repo

Claude is the **primary execution agent** here. You write production code, plans, governance files, reviews, and documentation. GitHub Copilot is configured in this repo as a dormant alternative — its files under `.github/` are kept valid for the day a license is available, but Copilot does not run.

What you write:

- Production application code (`app/`, `components/`, `lib/`, `scripts/`) when a task calls for it
- Plans (`docs/agent-tasks/<task-id>/plan.md`, `## Plan` sections of PRs)
- Governance files under `.github/` (instructions, chat modes, prompts, agents, hooks) **and** under `.claude/` (skills, agents, settings)
- Workflow YAML and CI configuration
- Documentation under `docs/`, including the Copilot study guides under `docs/COPILOT_STUDY/`
- PR reviews and postmortems

When you write application code, follow the rules in [`AGENTS.md`](AGENTS.md) and any path-scoped `CLAUDE.md` in the working directory (e.g., `app/CLAUDE.md` once it exists).

## Pace

The user is learning the stack alongside this project. Work **one commit at a time**: propose the files for the next commit, write only those files, then stop and wait for review before continuing. Do not batch multiple commits.

## Tone

Short and concrete. Explain new concepts (React component, server vs client component, Tailwind utility, workflow trigger, etc.) the first time they appear in a file the user is reviewing.

## Naming

Do not reference this project's exam-prep framing in any file destined for the repo other than `README.md`. Production-facing files (issue templates, PR template, instruction files, workflows, agent definitions, this file's siblings) describe rules in their own terms.
