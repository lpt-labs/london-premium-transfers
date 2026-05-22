# Plan: PR 11 — Eval signals

> Issue: N/A (self-implemented infra; no tracking issue)
> Branch: `feat/eval-signals`

- **Goal:** Run an opinionated "eval scorecard" against every Vercel preview deploy (Lighthouse, axe-core a11y, link checker, type-coverage), surface the numbers as a single PR comment, and upload the raw reports as a traceable artifact — so reviewers see quality signals before approving instead of bolting them on after merge.

- **Scope (paths/files):**
  - `docs/agent-tasks/11-eval-signals/plan.md` (this file)
  - `docs/EVAL.md` (new — quant thresholds + qual fidelity checklist)
  - `.github/workflows/eval.yml` (new)
  - `docs/WORKFLOWS.md` (update: per-workflow table row + flowchart node)
  - `.lighthouserc.json` (new — minimal Lighthouse CI config: 3-run median, asserts on the four category scores)
  - `docs/AGENT_PLAYBOOK.md` (optional cross-reference under a new "Eval" section)

- **Steps:**
  1. Add this plan file.
  2. Add `docs/EVAL.md` documenting:
     - **Quant thresholds** (informational, not blocking on day one): Lighthouse Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90; axe-core 0 critical/serious violations; broken-link count = 0; type-coverage ≥ 95%.
     - **Qual fidelity checklist** for feature PRs that touch `app/` or `components/`: design tokens used, no ad-hoc CSS, responsive breakpoints checked, focus states visible, copy proofread.
     - When the scorecard is required (none on day one — soft rollout, same pattern as `agent-artifact-check` and `drift-check`).
  3. Add `.lighthouserc.json` with `numberOfRuns: 3` (median absorbs single-run jitter on cold-cache preview), category-score assertions, and `chromePath` left to lhci default.
  4. Add `.github/workflows/eval.yml`:
     - Triggers: `deployment_status` (the cleanest signal that a Vercel preview is live and reachable), plus `workflow_dispatch` with a `pr_number` input for manual reruns / backfilling onto already-merged PRs.
     - Skip conditions: `github.event.deployment_status.state != 'success'`, `github.event.deployment.environment != 'Preview'`, or actor is Dependabot.
     - Permissions baseline `contents: read`; elevate the summary job to `pull-requests: write` only.
     - Four parallel jobs that each emit a JSON/text artifact and step outputs:
       - **Lighthouse** — `treosh/lighthouse-ci-action` (pinned to 40-char SHA), targets the preview URL from the event payload, reads `.lighthouserc.json`.
       - **axe** — install `@axe-core/cli` ad-hoc in the runner (`pnpm dlx @axe-core/cli`), scan the preview URL, emit violation count by severity.
       - **links** — `lycheeverse/lychee-action` (SHA-pinned), scan the preview URL with depth 1, emit broken-link count.
       - **type-coverage** — `pnpm dlx type-coverage --strict --detail`, emit the percentage.
     - **Summary job** — collects step outputs from the four jobs, builds a find-or-update PR comment (marker `<!-- eval:scorecard -->`) with a table: tool / score / threshold / pass-fail emoji, uploads `eval-${{ github.run_id }}-${{ github.sha }}` artifact containing all four raw reports.
     - All jobs use `continue-on-error: false` for the tool itself, but the workflow exits 0 overall — eval is informational, not a blocking check.
  5. Update `docs/WORKFLOWS.md`:
     - Add `EVAL[eval.yml]` node to the "At a glance" flowchart connected from a new `VERCEL_DEPLOY_SUCCESS([Vercel preview live])` trigger node, emitting `PR_COMMENT` + a new `ARTIFACT_EVAL[/eval-RUN-SHA/]` output.
     - Add a row to the per-workflow table.
     - Add a sentence noting Dependabot is exempt (eval against a dep-bump preview rarely tells you anything new, and it'd burn CI minutes).
  6. (Optional) Add a short "Eval" subsection to `docs/AGENT_PLAYBOOK.md` linking to `EVAL.md` and explaining the scorecard.

- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (`plan-gate`, `agent-ci`, `agent-artifact-check`, `drift-check` informational).
  - [ ] `eval.yml` validates as well-formed YAML and is documented in `docs/WORKFLOWS.md`.
  - [ ] On a PR with a successful Vercel preview, the workflow fires and posts an `<!-- eval:scorecard -->` comment within ~5 minutes of preview-live.
  - [ ] The artifact `eval-<run-id>-<sha>` exists and contains the four raw reports.
  - [ ] Manually dispatching the workflow with `pr_number=8` (the homepage PR) produces a scorecard comment on PR 8 — the acceptance test from the v4 plan.
  - [ ] A Dependabot deployment_status event is skipped (no comment, no artifact).
  - [ ] `docs/EVAL.md` exists with both quant thresholds and qual checklist.

- **Risks + mitigations:**
  - *Risk:* `deployment_status` event semantics vary by integration version; the Vercel payload might not carry the PR number directly, forcing us to look it up from the deployment SHA.
    *Mitigation:* Workflow looks up the PR number from the commit SHA via `gh pr list --search "sha:<sha>"` when the event doesn't include it. Tested locally with `gh api` before pushing.
  - *Risk:* Lighthouse on a cold-cache preview is noisy; single-run scores can swing 10+ points.
    *Mitigation:* `.lighthouserc.json` runs each audit 3× and reports the median. Thresholds documented in `EVAL.md` as informational on day one; reviewers calibrate before any future promotion to required.
  - *Risk:* `pnpm dlx` pulls @axe-core/cli and type-coverage at runtime — slower CI and a supply-chain vector.
    *Mitigation:* Document the trade in `EVAL.md`. If runtime becomes a problem, move to `devDependencies` in a follow-up — but on day one, ad-hoc install keeps `package.json` clean and lets us swap tools cheaply.
  - *Risk:* Eval comment + scorecard could overwhelm the PR conversation (`agent-ci`, drift-check, agent-artifact-check, eval — that's 4 marker-based comments).
    *Mitigation:* All four use distinct HTML-comment markers, so they're individually find-or-update — no comment duplication. Comment density is the cost of the agentic SDLC; reviewers will tell us if it's too noisy.
  - *Risk:* Workflow burns CI minutes on every preview deploy across the org (every PR fires Lighthouse × 3).
    *Mitigation:* Single workflow run per `deployment_status: success` event; 4 jobs parallel, each <2 min. Budget ≈ 8 CI minutes per PR. We accept that on Hobby plan; if it becomes a constraint, we drop to a single-run Lighthouse or gate on labels.

- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha> -f reason="PR 11 eval workflow misfiring"`
  - Soft rollback: delete `.github/workflows/eval.yml` in a follow-up PR; `EVAL.md` and `.lighthouserc.json` can stay (they're documentation + config, zero runtime cost).
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [ ] L2 (PR + 1 review — default for app code)
- [x] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — reversible (workflow non-blocking on day one; reports are artifacts, not gates). The workflow is large enough that reviewing YAML + thresholds doc together is cheaper than separate plan-first round. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.