<!--
  DORMANT — this prompt does not execute in this repo today.

  GitHub Copilot is configured as a dormant alternative to Claude Code in
  this repo (see [README.md](../../README.md) and [CLAUDE.md](../../CLAUDE.md)).
  No Copilot license is active, so the `.github/prompts/` directory is kept
  syntactically valid but is not invoked. The active equivalent is the
  Claude skill at [`.claude/skills/postmortem/SKILL.md`](../../.claude/skills/postmortem/SKILL.md);
  both files share the same schema and discipline so a future Copilot
  activation picks up the same lesson without rewiring.
-->
---
agent: ask
description: Draft a blameless postmortem for a prior PR where an agent took a visible wrong turn. Read-only. Output is a Markdown file in the schema at docs/agent-failures/_template.md plus a one-line proposed rule and where to put it.
---

You are drafting a blameless postmortem of an agent failure in `london-premium-transfers`. Your output is a Markdown file the human can commit to `docs/agent-failures/` plus a one-line rule they can paste into the instruction files.

## Inputs you will be given

- A PR URL or number (required).
- Optionally: a hint about which wrong turn to focus on, if the PR had more than one.

## Required reading

Before drafting, read each of these:

1. [`AGENTS.md`](../../AGENTS.md) — the operating contract. The postmortem's "Rule" section must fit inside the contract's vocabulary (autonomy levels, hard rules, anti-patterns).
2. [`docs/agent-failures/_template.md`](../../docs/agent-failures/_template.md) — the schema. Output must match it exactly.
3. [`docs/agent-failures/README.md`](../../docs/agent-failures/README.md) — when to file vs. when not to file. If the incident fails the "when to file" criteria, stop and say so instead of producing an entry.
4. The PR itself, fetched fresh:
   - `gh pr view <n> --json title,body,comments,files,additions,deletions,commits,reviews`
   - `gh pr diff <n>`
5. Any path-scoped instruction file (`.github/instructions/*.instructions.md`) matching files in the diff.

## Steps

1. **Fetch the PR data** with the `gh` commands above. If the PR is large, focus on the commits/comments around the wrong turn the user named (or, if none named, the most-commented-on stretch).
2. **Reconstruct the trace** as a bullet list: commit SHAs, comment URLs, agent actions, check failures. Each entry one line. Anchors are mandatory — the reader must be able to verify any step.
3. **Categorise** the failure as exactly one of `reasoning` (wrong conclusion from correct inputs), `tool-misuse` (wrong tool or wrong invocation), `context` (missing/stale/unclear instruction or doc), or `other`. Justify the pick in one paragraph.
4. **Identify root cause** as *what the agent had to work with* — which instructions, which tools, which documents were in or out of its context. Never frame this as "the agent should have known" or "the agent failed to". If a doc was missing, name it. If a tool returned ambiguous output, name the tool and the ambiguity.
5. **Name the fix** — the specific change that resolved this instance. Link to the fixing commit/PR.
6. **Extract the rule.** Short imperative — "Do not X when Y" or "Always Y when X". Two tests:
   - **Specific**: names a concrete trigger condition, not "be careful with things."
   - **Narrow**: covers this one incident's lesson, not a sweeping principle. "Always think carefully" / "always validate inputs" means you've over-generalised — back up and look for the specific case that actually went wrong.
7. **Suggest where the rule lives.** Default: both [`CLAUDE.md`](../../CLAUDE.md) (Lessons section) and [`.github/copilot-instructions.md`](../copilot-instructions.md) (Lessons section). If a path-scoped instruction file fits better (e.g. the rule only applies under `.github/workflows/`), name that file instead.

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
