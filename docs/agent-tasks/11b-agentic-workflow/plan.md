# Plan: PR 11b — Agentic workflow (dual-track)

> Issue: N/A (self-implemented infra; no tracking issue)
> Branch: `feat/agentic-workflow`

- **Goal:** Practice the autonomous-scheduled-workflow pattern from two angles — add a syntactically-valid GitHub Agentic Workflow file (dormant, no Copilot license active) plus a study guide explaining its frontmatter and guardrails, and document an equivalent live Claude Code Routine configured in the Claude web UI. This is the first time the repo hosts an *autonomous* automation (no PR trigger, no human invocation step); the doubled track means we have both a parity reference and a working signal.

- **Scope (paths/files):**
  - `docs/agent-tasks/11b-agentic-workflow/plan.md` (this file)
  - `.github/workflows/daily-repo-status.md` (new — dormant GitHub Agentic Workflow; path matches the current `githubnext/gh-aw` spec verified at implementation time — workflow sources live alongside Actions YAML and are distinguished by the `.md` extension, which GitHub Actions itself ignores)
  - `docs/COPILOT_STUDY/agentic-workflows.md` (new — frontmatter semantics + guardrails)
  - `docs/CLAUDE_ROUTINES/daily-repo-status.md` (new — Claude web-UI routine config snapshot)
  - `docs/WORKFLOWS.md` (small update — add a "Dormant configs" subsection noting the file does not fire in this repo today)
  - `docs/AGENT_PLAYBOOK.md` (optional cross-reference under a new "Scheduled / autonomous workflows" subsection)

- **Steps:**
  1. Add this plan file.
  2. Add the dormant agentic workflow at `.github/workflows/daily-repo-status.md` (path verified at implementation time against the latest `githubnext/gh-aw` README — current spec colocates `.md` sources with Actions YAML; the `.md` extension keeps the file invisible to the Actions runner while still being parseable by gh-aw). Frontmatter shape:
     - `on: schedule: { cron: "0 9 * * *" }` — daily 09:00 UTC.
     - `permissions:` read-only across `contents`, `issues`, `pull-requests`.
     - `safe-outputs: create-issue:` with `title-prefix: "[repo-status] "` and `labels: [report]` — the only side effect this workflow may produce.
     - `tools: [github]` — GitHub MCP only; no shell, no filesystem.
     - Body (Markdown): prompt asking for a 24-hour activity digest with risks + next steps, concise, links to issues/PRs.
     - Header comment block above the frontmatter stating "DORMANT — requires GitHub Copilot license to activate. See docs/COPILOT_STUDY/agentic-workflows.md."
  3. Add `docs/COPILOT_STUDY/agentic-workflows.md` explaining (in your own words, no copy-paste from Microsoft Learn):
     - The two-part file shape: **frontmatter defines the contract** (when, what permissions, what tools, what outputs); **Markdown body describes intent** (what the agent should produce).
     - The compile step: GitHub compiles the `.md` to a `.lock.yml` workflow that's what actually executes; the `.lock.yml` is committed alongside in normal use.
     - **Guardrails by design**: read-only tokens are the default; `safe-outputs` is the only sanctioned write surface and runs as a separate gated step (the agent process itself never has write tokens); zero plaintext secrets in the agent's environment; sandbox + network allowlist; threat detection on proposed outputs before they're applied.
     - Why this file is dormant in this repo (no Copilot license) and how to verify it's syntactically valid without running it.
  4. Add `docs/CLAUDE_ROUTINES/daily-repo-status.md` documenting the parallel Claude Code Routine the user configured in the web UI:
     - **Prompt**: "Produce a daily repo status report for `lpt-labs/london-premium-transfers` (issues, PRs, commits in the last 24h, risks, recommended next steps). Open an issue labelled `report` titled with prefix `[repo-status] <date>`."
     - **Schedule**: daily 09:00.
     - **Connectors**: GitHub repo `lpt-labs/london-premium-transfers`.
     - **Expected output**: one issue per day, labelled `report`, prefixed `[repo-status]`.
     - **Where to verify**: link to the Claude Code Routines settings page; note that the routine itself isn't versioned in this repo (lives in Claude's web UI).
  5. Update `docs/WORKFLOWS.md`:
     - Do NOT add the agentic file to the flowchart or sequence diagram (it doesn't fire here).
     - Add a short **"Dormant configurations"** subsection below "Composite actions and shared files" listing `.github/workflows/daily-repo-status.md` with one sentence on its purpose and license dependency.
     - Add a sibling **"External scheduled agents"** subsection pointing to `docs/CLAUDE_ROUTINES/daily-repo-status.md` so readers know the active equivalent lives there.
  6. (Optional) Cross-reference both files from `docs/AGENT_PLAYBOOK.md` under a new "Scheduled / autonomous workflows" subsection — one line each.

- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, `agent-ci`, `agent-artifact-check`, `drift-check` informational, `eval` informational).
  - [ ] `.github/workflows/daily-repo-status.md` parses as well-formed YAML frontmatter + Markdown body. Verified with a `yamllint`/`yq` step locally OR by visual review against the gh-aw README.
  - [ ] `docs/COPILOT_STUDY/agentic-workflows.md` covers all five guardrail items (read-only token default, safe-outputs as separate gated step, no plaintext secrets, sandbox + network allowlist, threat detection) — each in the author's own words, no verbatim text from Microsoft Learn.
  - [ ] `docs/CLAUDE_ROUTINES/daily-repo-status.md` exists and reflects the actual routine the user configured (prompt, schedule, connectors).
  - [ ] At least one daily `[repo-status]` issue with `report` label has been created by the Claude Routine (or the user has explicitly noted the routine is configured and a first run is pending; this can land before the routine has fired once if needed).
  - [ ] `docs/WORKFLOWS.md` "Dormant configurations" and "External scheduled agents" subsections exist.

- **Risks + mitigations:**
  - *Risk:* `gh-aw` path convention has shifted since the v4 plan was written (the spec moved through `.github/workflows/*.agent.md` → `.github/agentics/` → `.github/aw/` at various points).
    *Mitigation:* Verify against `https://github.com/githubnext/gh-aw#readme` at implementation time; pick whichever path the current spec names. Adding the file under the *wrong* path is fine — it stays dormant either way; document the chosen path in `docs/COPILOT_STUDY/agentic-workflows.md`.
  - *Risk:* Someone activates the dormant file by accident (e.g., a future license arrival), and the daily run starts opening issues immediately without review.
    *Mitigation:* Header comment in the file states DORMANT + required activation steps. Schedule is 09:00 daily, so worst case is one labelled issue before someone notices. Safe-outputs is scoped to `create-issue` only with the `report` label — bounded blast radius.
  - *Risk:* The Claude Code Routine snapshot in `docs/CLAUDE_ROUTINES/daily-repo-status.md` drifts from the actual web-UI config over time (UI changes, routine paused, etc.).
    *Mitigation:* Doc is best-effort, dated, and lists where to confirm the live config. Not a contract — a reference. If divergence becomes a problem we add a verification step to a quarterly maintenance task.
  - *Risk:* This PR adds a `.github/aw/` (or `.github/agentics/`) directory that isn't currently in the L3 path list in `AGENTS.md`.
    *Mitigation:* The PR carries `infra-change` anyway (the spirit of L3 is "anything that could affect CI if activated"). Consider opening a follow-up issue to add the chosen path to the L3 list in `AGENTS.md` — separate PR, separate scope.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="PR 11b agentic workflow file or routine doc misleading"`
  - Soft rollback: delete the four added files; nothing in CI depends on them.
  - The Claude Code Routine can be disabled from the Claude web UI independently of the repo state.
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — touches `.github/aw/` or `.github/workflows/`; PR carries `infra-change`)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — entirely reversible (no CI runs from the new file; routine lives in Claude web UI). All files are documentation or dormant configuration. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.