# Claude Code Routine — daily repo status

> **What this file is.** A snapshot of a Claude Code Routine configured in the Claude web UI at <https://claude.ai/code>. The routine itself is not versioned in this repo — its source of truth is the web UI. This file is a best-effort reference describing what is configured today, so a reviewer reading the repo can answer "what scheduled autonomous agents run against this codebase, and what are they allowed to do?" without leaving the repo.
>
> A Claude Code Routine is Anthropic's research-preview equivalent of a scheduled autonomous workflow: a saved prompt plus a schedule plus a set of connectors (here, the GitHub repo). The runtime lives on Anthropic's side; this repo only ever receives the *outputs* (an opened issue). The parity reference on the GitHub side is the dormant gh-aw file at [`.github/workflows/daily-repo-status.md`](../../.github/workflows/daily-repo-status.md), documented in [`docs/COPILOT_STUDY/agentic-workflows.md`](../COPILOT_STUDY/agentic-workflows.md).

## Status

- [ ] Active
- [ ] Paused
- [ ] Not yet configured

*(User: tick the right box after the routine is created. Update on any state change.)*

## Prompt (verbatim)

> Produce a daily repo status report for `lpt-labs/london-premium-transfers` (issues, PRs, commits in the last 24h, risks, recommended next steps). Open an issue labelled `report` titled with prefix `[repo-status] <date>`.

## Schedule

Daily at 09:00 UTC.

## Connectors

- GitHub repo: `lpt-labs/london-premium-transfers` (read access to issues, PRs, commits; write access only as needed to open the one daily issue).

## Expected output

One issue per day in `lpt-labs/london-premium-transfers`:

- Title prefix: `[repo-status] ` followed by the date (e.g., `[repo-status] 2026-05-22`).
- Label: `report`.
- Body: bulleted digest covering issues, PRs, commits in the last 24h plus risks and recommended next steps, with links to the referenced issues/PRs/commits.

If a day produces two issues with the same title prefix, the routine has misfired (re-ran inside the same 24h window) or two routines are configured. Disable the duplicate.

## Where to confirm the live config

Open <https://claude.ai/code>, navigate to the Routines / scheduled-tasks section, and find the routine named "daily repo status" (or whatever the user chose at creation time). The prompt, schedule, and connectors shown there are authoritative. If the values there disagree with this doc, update this doc — the web UI wins.

## How to disable

Open the routine in the web UI and either **pause** it (keeps the config, stops the schedule) or **delete** it (removes the config entirely). Either action takes effect immediately and stops further daily issues. No repo-side change is required to disable.

## Relation to the dormant gh-aw file

The dormant [`.github/workflows/daily-repo-status.md`](../../.github/workflows/daily-repo-status.md) is the *same job, different runtime*: identical prompt intent (24h digest, risks, next steps), identical output shape (one `[repo-status]` issue with label `report`), identical schedule (09:00 UTC). If the gh-aw file is ever activated, pause this routine first to avoid duplicate daily issues.
