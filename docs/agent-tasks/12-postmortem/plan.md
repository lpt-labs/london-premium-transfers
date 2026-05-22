# Plan: PR 12 — Failure analysis & instruction tuning

> Issue: N/A (self-implemented infra; no tracking issue)
> Branch: `feat/postmortem`

- **Goal:** Establish a postmortem loop for agent failures so each rough spot in a past PR becomes a durable rule in the instruction files — turning lessons into invariants instead of recollections. Adds a template, a dual-track skill (Claude active + Copilot dormant), one worked example from a real prior PR, and the rule that comes out of it landed in `CLAUDE.md` and `.github/copilot-instructions.md`.

- **Scope (paths/files):**
  - `docs/agent-tasks/12-postmortem/plan.md` (this file)
  - `docs/agent-failures/_template.md` (new — the schema)
  - `docs/agent-failures/README.md` (new — short index doc explaining the directory, with placeholder for the dated entries)
  - `.claude/skills/postmortem/SKILL.md` (new — active Claude skill, invoked as `/postmortem`)
  - `.github/prompts/postmortem.prompt.md` (new — dormant Copilot prompt; same schema)
  - `docs/agent-failures/<date>-<slug>.md` (new — one real worked example from a prior PR; date and slug filled in at commit time)
  - `CLAUDE.md` (update — add the rule extracted from the worked example under a new "Lessons" subsection)
  - `.github/copilot-instructions.md` (update — same rule, mirrored)
  - `docs/AGENT_PLAYBOOK.md` (optional cross-reference to the postmortem skill and the failures directory)

- **Steps:**
  1. Add this plan file.
  2. Add `docs/agent-failures/_template.md` with the postmortem schema. Frontmatter: `date`, `pr` (number), `title`, `category` (one of `reasoning`, `tool-misuse`, `context`, `other`), `severity` (`minor` / `moderate` / `high`), `status` (`open` / `resolved`). Body sections: Symptom (what was observed), Trace (commit/comment timeline), Category (with brief justification), Root cause (why, not just what), Fix (the specific change that resolved it), Rule (the general invariant, "do not X" or "always Y"), Where rule lives (checklist of `CLAUDE.md` / `.github/copilot-instructions.md` / other). Header comment explains naming convention: `<YYYY-MM-DD>-<short-slug>.md`.
  3. Add `docs/agent-failures/README.md` — short index doc (≤30 lines) explaining: what this directory is for, when to file an entry (anything where an agent took a wrong turn that was visible enough to need a rule), what NOT to file (style preference, off-topic complaint), how the index gets updated (manually for now; could be auto-indexed later if the directory grows past ~20 entries).
  4. Add `.claude/skills/postmortem/SKILL.md` — Claude skill invoked as `/postmortem <pr-url-or-number>`. Read-only. Required reading: AGENTS.md, the target PR's body + diff + comments via `gh`. Output: a draft postmortem file in the schema above, plus a one-line suggested rule and where it should live. Discipline notes: no blame language; root cause focuses on what the agent had to work with (instructions, tools, context window), not who-failed-where; rule must be specific enough to be actionable AND narrow enough that it isn't over-fitting to one incident.
  5. Add `.github/prompts/postmortem.prompt.md` — Copilot mirror of the skill. Same schema, same discipline. Dormant (no Copilot license active).
  6. Add the first real worked example at `docs/agent-failures/<date>-<slug>.md`. Pick a real prior PR where the agent visibly took a wrong turn — candidates: PR 4 (scaffold) had at least one round of correction; PR 8 / the homepage PR (#28 via `claude/issue-25-...`) had observable iterations. The user picks at commit time. The example must be specific enough that a reader can trace what happened from the file alone (link to commits + comments).
  7. Update `CLAUDE.md` (root) — add a new "Lessons" subsection at the bottom (or merge into an existing one) with a one-line rule extracted from the example, ending with "(see `docs/agent-failures/<date>-<slug>.md`)". The rule should be a short imperative — "do not X" or "always Y" — readable in isolation.
  8. Update `.github/copilot-instructions.md` — mirror the same rule under a parallel section so both ecosystems pick it up.
  9. (Optional) Add a one-line "Failures and lessons" entry to `docs/AGENT_PLAYBOOK.md` linking to the directory and the `/postmortem` skill.

- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, `agent-ci`, `agent-artifact-check`, `drift-check` informational, `eval` informational).
  - [ ] `docs/agent-failures/_template.md` exists with the full schema.
  - [ ] `.claude/skills/postmortem/SKILL.md` exists and is invokable — `/postmortem <pr-url>` produces a draft in the schema without editing files.
  - [ ] `.github/prompts/postmortem.prompt.md` exists with the same schema (dormant; visually parity-checked against the skill).
  - [ ] At least one real worked example exists at `docs/agent-failures/<date>-<slug>.md` and references the source PR.
  - [ ] `CLAUDE.md` has at least one "do not X (see failure dated Y)" rule pointing at the worked example.
  - [ ] `.github/copilot-instructions.md` has the mirrored rule.
  - [ ] The rule is *specific* (a reader can act on it) AND *narrow* (it isn't trying to prevent every possible variant of the original incident).

- **Risks + mitigations:**
  - *Risk:* The worked example over-fits — one incident generates a sweeping rule that prohibits useful behavior.
    *Mitigation:* Rule writing discipline: the rule must name a concrete trigger ("when editing a workflow file"), not a vague principle ("be careful"). The skill's output discipline section enforces this explicitly. Reviewers reject rules that read as platitudes.
  - *Risk:* Postmortems devolve into blame.
    *Mitigation:* Template's "Root cause" section is explicitly framed as "what the agent had to work with", not "who failed". Worked example demonstrates the tone. Skill prompt repeats the discipline.
  - *Risk:* `docs/agent-failures/` accumulates dated files without an index, making it hard to find rules.
    *Mitigation:* `README.md` in the directory holds a brief index that's updated manually at file-add time. If the directory passes ~20 entries we revisit (auto-generated index from frontmatter, or rule-keyed lookup).
  - *Risk:* The rule added to `CLAUDE.md` conflicts with an existing rule and nobody notices.
    *Mitigation:* The reviewer reads both files end-to-end during this PR's review. Adding rule conflict detection to CI is out of scope for PR 12 — could be a follow-up if it becomes a pattern.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="PR 12 postmortem rule misleading"`
  - Soft rollback: delete the rule additions in `CLAUDE.md` / `.github/copilot-instructions.md` in a follow-up PR; the template + skill + worked example can stay (zero behavioural cost).
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [x] L2 (PR + 1 review — adds `.claude/skills/` + `docs/` + edits to root instruction files; no `.github/workflows/` changes)
- [ ] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — reversible (rule additions are line edits to instruction files; skill is read-only). Workload is documentation-heavy, no CI behavior changes. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.