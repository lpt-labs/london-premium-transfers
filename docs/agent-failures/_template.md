<!--
  Postmortem template for agent failures.

  Copy this file to `docs/agent-failures/<YYYY-MM-DD>-<short-slug>.md` and
  fill in every section. Date is the date the incident was diagnosed (not
  when the failing commit landed); the slug is 2–4 lower-kebab words that
  describe the *rule* the postmortem produced, not the symptom.

  Examples of good filenames:
    2026-05-22-pin-action-shas.md
    2026-05-22-no-mocked-db-in-integration.md

  Read `docs/agent-failures/README.md` first if you haven't filed a
  postmortem in this repo before — it covers when to file, when NOT to
  file, and how the index gets updated.
-->
---
date: YYYY-MM-DD
pr: 0
title: <one-line description of the wrong turn, not the symptom>
category: reasoning | tool-misuse | context | other
severity: minor | moderate | high
status: open | resolved
---

## Symptom

<!-- What was observed at the surface? The wrong behavior, as a reviewer or CI run would have seen it. One paragraph. No root cause yet — just the visible signal. -->

## Trace

<!-- Sequence of events with concrete anchors: commit SHAs, comment URLs, agent actions, check failures. The reader should be able to reconstruct what happened from this list alone. Bullets, not prose. Link to the PR thread at the top. -->

- PR: <link>
- <SHA>: <what the agent did>
- <comment URL>: <what the reviewer flagged>
- <SHA>: <what the agent did next>
- …

## Category

<!-- Pick one of: `reasoning` (the agent reached a wrong conclusion from correct inputs), `tool-misuse` (the agent invoked a tool incorrectly or used the wrong tool), `context` (the agent didn't have the information it needed — missing doc, missing instruction, stale file), `other`. One paragraph justifying the pick. -->

## Root cause

<!-- Why did the agent do the wrong thing? Frame this as "what the agent had to work with" — which instructions did it read, which tools were available, what was in context. NOT "the agent failed to…" or "the agent should have known…". If a doc was missing or unclear, name the doc. If a tool returned ambiguous output, name the tool. The goal is to find the gap in the agent's environment, not to assign blame. -->

## Fix

<!-- The specific change that resolved this incident. Link to the fixing commit or PR. One paragraph. This section is about the local fix, not the rule. -->

## Rule

<!-- The general invariant extracted from this incident. Format: a short imperative starting with "Do not X" or "Always Y". Two tests it must pass:

  1. **Specific** — names a concrete trigger ("when editing files under `.github/workflows/`…", "when a step writes to `lychee.json`…"). Not a platitude.
  2. **Narrow** — covers this one incident's lesson, not every possible variant. If you're tempted to write "always be careful with X", you're over-generalising.

  One sentence. Maybe two if the trigger needs qualifying. -->

## Where rule lives

<!-- Tick the files where this rule has been (or will be) added. Mirror the same wording so both ecosystems pick it up. -->

- [ ] `CLAUDE.md` (Lessons section)
- [ ] `.github/copilot-instructions.md` (Lessons section)
- [ ] Other: <path + section>
