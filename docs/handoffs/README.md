# Multi-agent handoff logs

One Markdown entry per run of [`.github/workflows/multi-agent.yml`](../../.github/workflows/multi-agent.yml). Each entry is the audit trail for a single `multi-agent`-labelled issue: which subagent did what, what the reviewer found, what merged. The workflow's `handoff-log` job writes these files automatically; humans can also add an entry by hand using [`_template.md`](./_template.md).

## Filename

`<YYYY-MM-DD>-<issue-number>-<slug>.md` — date the workflow fired, the triggering issue number, and a 2–4 lower-kebab word slug describing the change. Example: `2026-06-01-42-favicon-and-robots.md`.

## Format

Every entry has four sections, in this order: **Trigger** (issue link + label), **Implementer** (Claude subagent ID + commits + PR URL), **Reviewer** (subagent ID + review-comment URL + a one-line summary of findings), **Outcome** (merged / iterated / abandoned, with the merge SHA when applicable). See [`_template.md`](./_template.md).

## Cost note

Every multi-agent run costs Anthropic credits across two `anthropic-ai/claude-code-action` invocations (implementer + reviewer). Record the approximate credit footprint per run in the entry's Outcome section so cost stays visible over time.

## Index

| File | Issue | Outcome |
| --- | --- | --- |
| _none yet_ | — | — |
