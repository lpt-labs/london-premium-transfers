# Eval scorecard

What we measure on every Vercel preview, why we measure it, and what counts as good.

> **Status: informational only.** None of the thresholds below block merge today. The scorecard is a PR comment + uploaded artifact, the same soft-rollout posture as `agent-artifact-check.yml` and `drift-check.yml` (see [`WORKFLOWS.md`](WORKFLOWS.md)). Promotion of any individual signal to a required status check is a future `infra-change`-labelled PR, taken only after the metric has been green on a handful of real PRs.

## Why a scorecard at all

Reviewers can't eyeball Lighthouse Performance or axe-core violations from a diff. The eval workflow runs four cheap, well-understood tools against the live preview deploy and posts the numbers as a PR comment *before* approval, so quality regressions surface in the same place the diff is reviewed — not in a Slack thread two weeks after merge.

The cost is ~8 CI minutes per PR (4 parallel jobs, each under 2 minutes) and one extra marker-based PR comment. We accept that on Hobby; if the budget becomes a constraint, we drop to a single-run Lighthouse or gate on labels.

## Quant thresholds

Each threshold is the value the [`eval.yml`](../.github/workflows/eval.yml) workflow compares against when rendering the ✅ / ❌ column of the scorecard. They are documentation of expectations, not enforcement.

| Signal | Threshold | What it measures |
| --- | --- | --- |
| Lighthouse Performance | ≥ 90 | Page-load speed proxy — composite of First Contentful Paint, Largest Contentful Paint, Total Blocking Time, Cumulative Layout Shift, and Speed Index. Score is 0–100; ≥ 90 is Google's "good" band. |
| Lighthouse Accessibility | ≥ 95 | Audits for axe-derived a11y rules at the markup level (alt text, labels, contrast, ARIA validity). Higher bar than Performance because a11y bugs are usually cheap to fix and harm the most. |
| Lighthouse Best Practices | ≥ 90 | HTTPS, console errors, deprecated APIs, image aspect ratios, sandboxed iframes. Catches obvious footguns. |
| Lighthouse SEO | ≥ 90 | Basic crawlability — title, meta description, viewport, anchor text, robots.txt reachability. Bar is low because we aren't optimising for organic search yet, but a sub-90 score usually means something genuinely broken (e.g. missing `<title>`). |
| axe-core violations | 0 critical, 0 serious | Standalone a11y scan, more thorough than Lighthouse's a11y category. Violations are tiered: **critical** (blocks the user, e.g. missing form labels), **serious** (significant barrier, e.g. low contrast on body text), **moderate** (degraded experience), **minor** (cosmetic). We block-list critical + serious; moderate + minor are reported but not thresholded. |
| Broken links | 0 | `lychee` crawls all links rendered on the preview URL and reports HTTP 4xx/5xx (and DNS failures). Catches stale internal anchors and dead external citations. |
| Type coverage | ≥ 95% | `type-coverage --strict` measures the ratio of *explicitly typed* variables and expressions vs. ones that fall back to `any`. 95% is generous on day one — we're scaffolding, and `any` will sneak in via third-party type holes. Tighten later. |

Lighthouse on a cold-cache preview is noisy — single-run scores swing 10+ points on minor pages. [`/.lighthouserc.json`](../.lighthouserc.json) runs each audit three times and reports the median. This is also why the thresholds are documented here and not hardcoded as failing assertions in the lhci config.

## Qual fidelity checklist (for PRs touching `app/` or `components/`)

The quant thresholds catch regressions in measurable signals; this checklist catches things tools won't notice. Reviewers should mentally tick each box before approving a feature PR. It is not enforced — there is no workflow that fails on a missed box.

- [ ] **Design tokens used.** Colours, spacing, radii, typography are imported from [`lib/design-tokens.ts`](../lib/design-tokens.ts) (or used via the matching Tailwind utility classes wired through `app/globals.css`). No raw hex codes or `px` values in component code.
- [ ] **No ad-hoc CSS files.** All styling goes through Tailwind utilities or the `@theme` block. New `*.css` files outside `app/globals.css` are a smell — call it out in review.
- [ ] **Responsive breakpoints checked on the preview.** Open the preview URL on a mobile viewport (≤ 640 px), a tablet viewport (~768 px), and desktop. Tailwind ships `sm:` / `md:` / `lg:` breakpoints at those widths.
- [ ] **Focus states visible.** Tab through interactive elements (buttons, links, form fields) on the preview. Every focused element must have a visible outline or ring — no `outline: none` without a replacement.
- [ ] **Copy proofread.** Headings, body text, button labels, alt text, and any new microcopy read at least once with a typo eye. Tools don't catch "Loginn" or "Recieve."

This checklist exists because, at L2/L3 autonomy, an agent will happily ship a pixel-perfect-looking page where every colour is a hand-typed hex and the mobile layout collapses. The qual gate is the human's responsibility; this list makes it concrete.

## Where the raw reports live

The summary job uploads an artifact named `eval-<run-id>-<sha>` per the AGENTS.md traceability rule. It contains the four raw outputs:

- `lighthouse/` — full Lighthouse HTML + JSON reports, one per category per run.
- `axe.json` — axe-core's machine-readable violation list.
- `lychee.json` — link-check output including the responding HTTP code per URL.
- `type-coverage.txt` — the `--detail` listing of every `any`-leaking site.

Artifacts retain for 90 days by default (GitHub Hobby default). For longer-lived analysis, download the artifact and check it into a follow-up plan's `decisions.md`.

## Soft-rollout posture

This workflow is **never required on day one.** The same path the other informational workflows took:

1. **Day 1 (this PR):** scorecard comment + artifact, no status-check gating.
2. **Calibration period:** run on real PRs. If a threshold flags too aggressively (false positives) or too rarely (the bar is too low), edit it here and in `.lighthouserc.json`.
3. **Promotion:** once a signal has been green on ~5 consecutive real PRs and the threshold feels right, file an `infra-change`-labelled PR that adds the relevant `eval / <job>` check to the `protect-main` branch ruleset. This is a UI change in GitHub's ruleset editor, not a code change — see the "Required status checks" section of [`WORKFLOWS.md`](WORKFLOWS.md).

Promoting before the calibration period is anti-pattern: a flaky required check trains reviewers to merge-with-failures, which then erodes the required-check discipline that `plan-gate` depends on.

## Runtime trade-off: `pnpm dlx` vs. devDependencies

Two of the four tools (`@axe-core/cli`, `type-coverage`) are pulled at workflow runtime via `pnpm dlx` rather than added to `package.json` as devDependencies. The trade:

- **Pro (current choice):** `package.json` stays focused on application dependencies. Swapping tools (e.g. replacing `type-coverage` with `tsc --strict --noEmit` plus a custom counter) is a one-line workflow edit, not a repo-wide dep bump. Lockfile churn stays low.
- **Con:** Each CI run pays a small install latency (5–15 s per tool) and pulls fresh from npm — a supply-chain vector if a tool is compromised between runs. Mitigated somewhat by `pnpm`'s default integrity checks, but not eliminated.

If runtime becomes a CI-minute problem or supply-chain posture tightens, the migration is a follow-up `infra-change` PR that pins versions in `devDependencies` and rewrites the workflow steps to `pnpm exec`. Not worth doing today.

## See also

- [`docs/agent-tasks/11-eval-signals/plan.md`](agent-tasks/11-eval-signals/plan.md) — the rolling plan for the PR that introduces the scorecard.
- [`docs/WORKFLOWS.md`](WORKFLOWS.md) — visual map of every workflow, including `eval.yml`'s trigger shape.
- [`AGENTS.md`](../AGENTS.md) — overall operating contract; the traceability rule that drives the artifact-naming pattern.
