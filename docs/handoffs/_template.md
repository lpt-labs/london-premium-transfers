<!--
  Multi-agent handoff template.

  Copy this file to `docs/handoffs/<YYYY-MM-DD>-<issue-number>-<slug>.md`
  and fill in every section. The workflow's `handoff-log` job will do this
  automatically; humans only fill it in manually for runs done outside the
  workflow.

  Read `docs/handoffs/README.md` first for the format and the index.
-->
---
date: YYYY-MM-DD
issue: 0
pr: 0
outcome: merged | iterated | abandoned
---

## Trigger

- Issue: <link to the labelled issue>
- Label: `multi-agent`
- Triggered by: <user or workflow event>

## Implementer

- Subagent: `implementer` (`.claude/agents/implementer.md`)
- Branch: `multi-agent/<issue-number>`
- Commits: <list of SHAs the run produced, with one-line subjects>
- PR: <link to the PR the implementer opened>

## Reviewer

- Subagent: `a11y-reviewer` (`.claude/agents/a11y-reviewer.md`)
- Review comment: <link to the marker-tagged comment `<!-- multi-agent:a11y-review -->`>
- Findings (one line): <e.g. "1 serious (missing label on email input), 2 suggestions">

## Outcome

- Result: merged | iterated | abandoned
- Merge SHA (if merged): <sha>
- Anthropic credits (approx): <implementer + reviewer total>
- Follow-up: <link to follow-up issue if any, or "none">
