---
name: postmortem
description: Draft a blameless postmortem for a prior PR where an agent took a visible wrong turn. Read-only. Output is a Markdown file in the schema at docs/agent-failures/_template.md plus a one-line proposed rule and where to put it.
---

# Postmortem of an agent failure

Invoked when the user wants a structured postmortem of a past PR — typically because a reviewer caught a wrong turn that should become a durable rule, not just a one-time correction.

## Inputs

- A PR URL or number (required).
- Optionally: a hint about which wrong turn to focus on, if the PR had more than one.

## Required reading

Before drafting, read each of these:

1. [`AGENTS.md`](../../../AGENTS.md) — the operating contract. The postmortem's "Rule" section must fit inside the contract's vocabulary (autonomy levels, hard rules, anti-patterns).
2. [`docs/agent-failures/_template.md`](../../../docs/agent-failures/_template.md) — the schema. Output must match it exactly.
3. [`docs/agent-failures/README.md`](../../../docs/agent-failures/README.md) — when to file vs. when not to file. If the incident fails the "when to file" criteria, stop and say so instead of producing an entry.
4. The PR itself, fetched fresh:
   - `gh pr view <n> --json title,body,comments,files,additions,deletions,commits,reviews`
   - `gh pr diff <n>`
5. Any path-scoped `CLAUDE.md` matching files in the diff.

## Steps

1. **Fetch the PR data** with the `gh` commands above. If the PR is large, focus on the commits/comments around the wrong turn the user named (or, if none named, the most-commented-on stretch).
2. **Reconstruct the trace.** Build the timeline as a bullet list: commit SHAs, comment URLs, agent actions, check failures. Each entry one line. Anchors are mandatory — the reader must be able to verify any step.
3. **Categorise** the failure as exactly one of `reasoning` (wrong conclusion from correct inputs), `tool-misuse` (wrong tool or wrong invocation), `context` (missing/stale/unclear instruction or doc), or `other`. Justify the pick in one paragraph.
4. **Identify root cause** as *what the agent had to work with* — which instructions, which tools, which documents were in or out of its context. Never frame this as "the agent should have known" or "the agent failed to". If a doc was missing, name it. If a tool returned ambiguous output, name the tool and the ambiguity.
5. **Name the fix** — the specific change that resolved this instance. Link to the fixing commit/PR.
6. **Extract the rule.** Short imperative — "Do not X when Y" or "Always Y when X". Two tests:
   - **Specific**: the rule names a concrete trigger condition, not "be careful with things."
   - **Narrow**: the rule covers this one incident's lesson, not a sweeping principle. If you find yourself writing "always think carefully" or "always validate inputs", you've over-generalised — back up and look for the specific case that actually went wrong.
7. **Suggest where the rule lives.** Default: both [`CLAUDE.md`](../../../CLAUDE.md) (Lessons section) and [`.github/copilot-instructions.md`](../../../.github/copilot-instructions.md) (Lessons section). If a path-scoped instruction file fits better (e.g. the rule only applies under `.github/workflows/`), name that file instead.

## Output

Emit two things:

1. **The postmortem draft**, in a fenced block, matching `docs/agent-failures/_template.md` section-for-section. Suggested filename in the form `<YYYY-MM-DD>-<short-slug>.md` where the slug describes the rule, not the symptom.
2. **A proposed rule line**, ready to paste into the Lessons section of `CLAUDE.md` and `.github/copilot-instructions.md`. Format:

   ```md
   - **<imperative-rule>** — (see [docs/agent-failures/<date>-<slug>.md](docs/agent-failures/<date>-<slug>.md))
   ```

The user takes it from there — they commit the file, update the README index, and add the rule line to both instruction files.

## Output discipline

- **Read-only.** Never edit files. The postmortem is a draft for the user to commit; the rule lines are paste targets, not direct edits.
- **No blame language.** "The agent didn't…" / "the agent should have…" are bans. Use "the agent's context did not include…" or "the tool returned…".
- **No fabricated anchors.** Every SHA, comment URL, and check link must come from the `gh` output. If you don't have a real anchor for a step, drop the step.
- **One clarifying question at a time** if the diff or comments are ambiguous about what the wrong turn actually was — pick the single highest-leverage question and ask before drafting.
- **Stop if the incident fails the "when to file" test** (one-off slip, style nit, off-topic complaint). Say which test it failed and what the user could do instead.
- **No flattery, no preamble.** Go straight to the draft.
