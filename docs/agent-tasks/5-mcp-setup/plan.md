# Plan: Configure MCP servers and document org/enterprise governance UIs

> Issue: [#8](https://github.com/lpt-labs/london-premium-transfers/issues/8)
> Branch: `claude/issue-8-20260520-1128`

- **Goal:** Add `.vscode/mcp.json` wiring a remote GitHub MCP server and a local placeholder, and write study guides covering MCP server/registry/allow-list concepts plus the Copilot org and enterprise governance UIs.
- **Scope (paths/files):**
  - `.vscode/mcp.json`
  - `docs/mcp/README.md`
  - `docs/COPILOT_STUDY/mcp-allowlist.md`
  - `docs/COPILOT_STUDY/mcp-custom-registry.md`
  - `docs/COPILOT_STUDY/mcp-enterprise.md`
  - `docs/agent-tasks/5-mcp-setup/plan.md` (this file)
- **Steps:**
  1. Save this plan to `docs/agent-tasks/5-mcp-setup/plan.md` and commit it as the first commit on the branch.
  2. Create `.vscode/mcp.json` with two entries: `github` (type `http`, URL `https://api.githubcopilot.com/mcp/`) and `local-docs` (type `http`, URL `http://localhost:3000`). No secrets or credentials in the file.
  3. Create `docs/mcp/README.md` explaining the three composing concepts — MCP server, registry, and allow-list — in own words, not copied from Microsoft Learn.
  4. Create `docs/COPILOT_STUDY/mcp-allowlist.md`: org-level Copilot policy walkthrough (UI path, two allow-list modes, expected behaviour).
  5. Create `docs/COPILOT_STUDY/mcp-custom-registry.md`: hosting a custom MCP registry (v0.1 spec endpoints, CORS headers, Azure API Center alternative).
  6. Create `docs/COPILOT_STUDY/mcp-enterprise.md`: enterprise-level AI controls MCP UI path and what differs from the org-level screens.
  7. Open a Draft PR from branch to `main`; paste Goal-through-Rollback bullets between `PLAN:BEGIN`/`PLAN:END` markers; add `Closes #5` in description.
- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (plan-gate).
  - [ ] `.vscode/mcp.json` parses as valid JSON (`jq . .vscode/mcp.json` exits 0).
  - [ ] `.vscode/mcp.json` contains the GitHub remote MCP entry at exactly `https://api.githubcopilot.com/mcp/`.
  - [ ] `.vscode/mcp.json` contains a second local-pattern entry (`http://localhost:3000`).
  - [ ] `docs/mcp/README.md` distinctly explains server, registry, and allow-list as three separate composing concepts.
  - [ ] Each of the three `docs/COPILOT_STUDY/mcp-*.md` files is self-contained: states purpose, UI path, sample config or screen, expected behaviour.
  - [ ] No secrets, tokens, API keys, or credentials appear in any committed file.
  - [ ] No files modified outside the scope list above.
  - [ ] Branch is not `main` (no direct push to main).
- **Risks + mitigations:**
  - *Risk:* JSON doesn't support comments; the `local-docs` placeholder purpose won't be obvious from the file alone.
    *Mitigation:* document the placeholder pattern in `docs/mcp/README.md` and note it in the PR body.
  - *Risk:* Microsoft Learn content may describe UI paths that shift between releases.
    *Mitigation:* capture the UI path and note that labels may move; the workflow (goal → sidebar → policy) is stable even if button labels drift.
  - *Risk:* `plan-gate` workflow requires non-empty content between PLAN markers in the PR body.
    *Mitigation:* paste the Goal-through-Rollback bullets verbatim into the PR description between the markers.
- **Rollback / escalation plan:**
  - Rollback command: `git revert <merge-sha>` on a follow-up PR (the `agent-rollback.yml` workflow lands in PR 7).
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [x] L2 (PR + 1 review — default for app code)
- [ ] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — low risk, fully reversible; all outputs are docs and one config file under `docs/` and `.vscode/`; no infra, secrets, or app code touched. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
