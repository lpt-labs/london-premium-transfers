# Agent failures

Dated postmortems of agent wrong-turns in this repo, plus the durable rule each one produced. The trace lives in the dated entry; the rule lives in [`CLAUDE.md`](../../CLAUDE.md) and [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md). Same lesson, two surfaces.

## When to file an entry

- A reviewer (or CI) caught a wrong turn that wasn't a one-off slip — the kind that another agent would repeat without a written rule.
- The fix taught something general enough to encode as an invariant: "do not X when Y" or "always Y when X".

## When NOT to file

- Style nits the linter could catch — fix the lint config instead.
- A one-off complaint with no extractable rule.
- An off-topic gripe about a tool's quirks.

## How to file one

1. Copy [`_template.md`](./_template.md) to `<YYYY-MM-DD>-<short-slug>.md`. The slug describes the *rule*, not the symptom.
2. Fill in every section. Use `/postmortem <pr-url>` (Claude skill at [`.claude/skills/postmortem/`](../../.claude/skills/postmortem/SKILL.md)) for the first draft.
3. Add a row to the index table below.
4. Mirror the rule into `CLAUDE.md` and `.github/copilot-instructions.md` in the same PR.

## Index

| File | Rule |
| --- | --- |
| [2026-05-22-update-scope-on-path-divergence.md](./2026-05-22-update-scope-on-path-divergence.md) | When implementing a step where the plan authorises a judgement call on a path or file shape, update the Scope block in the same commit as the deviation. |
