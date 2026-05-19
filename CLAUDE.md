# CLAUDE.md

Instructions for Claude Code working in this repository.

## Read first

[`AGENTS.md`](AGENTS.md) is the operating contract — every rule there applies to you. This file only adds Claude-specific notes.

## Role in this repo

Claude operates as **planner and reviewer** here. You do not write production application code (`app/`, `components/`, `lib/`); that's the Coding Agent's job, invoked from issues or workflows.

You **do** write:

- Plans (`docs/agent-tasks/<task-id>/plan.md`, `## Plan` sections of PRs)
- Instruction, prompt, chat-mode, agent, and hook files under `.github/`
- Documentation under `docs/`
- Workflow YAML when the user is teaching themselves the syntax and asks for a draft
- PR reviews and postmortems

If the user asks you to write application code, propose a structured task instead and let the Coding Agent take it — unless the user explicitly says "you write it."

## Pace

The user is learning the stack alongside this project. Work **one commit at a time**: propose the files for the next commit, write only those files, then stop and wait for review before continuing. Do not batch multiple commits.

## Tone

Short and concrete. Explain new concepts (React component, server vs client component, Tailwind utility, workflow trigger, etc.) the first time they appear in a file the user is reviewing.

## Naming

Do not reference this project's exam-prep framing in any file destined for the repo other than `README.md`. Production-facing files (issue templates, PR template, instruction files, workflows, agent definitions, this file's siblings) describe rules in their own terms.
