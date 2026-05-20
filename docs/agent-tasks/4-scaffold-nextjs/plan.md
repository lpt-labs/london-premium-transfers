# Plan: Scaffold Next.js 16 + Tailwind v4 + extract brand design tokens

> Issue: [#4](https://github.com/lpt-labs/london-premium-transfers/issues/4)
> Branch: `feat/scaffold-nextjs`

- **Goal:** Stand up a working Next.js 16 (App Router) + Tailwind v4 + TypeScript foundation with brand design tokens extracted from the supplied design, so feature PRs build on a stable dev server with the correct palette.
- **Scope (paths/files):**
  - `package.json`, `pnpm-lock.yaml`
  - `pnpm-workspace.yaml` (added during scaffold — pnpm 11 gates native build scripts here)
  - `tsconfig.json`
  - `next.config.ts`
  - `postcss.config.mjs`
  - `eslint.config.mjs`
  - `app/**` (including `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/CLAUDE.md`)
  - `lib/design-tokens.ts`
  - `public/**` (scaffold defaults only; no new assets unless required)
  - `docs/COPILOT_STUDY/cloud-agent-assignment.md`
  - `docs/agent-tasks/4-scaffold-nextjs/plan.md` (this file)
  - `.gitignore` (merge Next.js entries if scaffolder adds any not already present)
- **Steps:**
  1. Save this plan to `docs/agent-tasks/4-scaffold-nextjs/plan.md` on branch `feat/scaffold-nextjs` (current).
  2. Run `pnpm create next-app@latest .` with: TypeScript, ESLint, Tailwind, App Router, no `src/`, import alias `@/*` — accept all scaffolder defaults to keep the dependency surface minimal. Reconcile `.gitignore` with the existing file.
  3. Fetch the design source (`https://api.anthropic.com/v1/design/h/keLW2q3eaJ0TdN_OAiedcQ?open_file=index.html`), read its README + `index.html`, and extract brand colour palette, font stack, and spacing scale. Fall back to `~/Downloads/London Premium Transfers.html` only if the fetch fails.
  4. Write `lib/design-tokens.ts` exporting a typed `tokens` constant (`colors`, `fonts`, `spacing`) derived from the fetched design — values not invented by the agent.
  5. Wire Tailwind v4 to the tokens via `@theme` in `app/globals.css` so utilities like `bg-cream`, `text-ink`, etc. are generated from the same values. No separate `tailwind.config.*` file — v4 is CSS-first.
  6. Replace the scaffold `app/page.tsx` with a minimal placeholder page that renders the brand wordmark/heading using at least one token-driven utility (e.g. `bg-cream`, `text-ink`) so the wiring is provable visually.
  7. Add `app/CLAUDE.md` with rules Claude follows under `app/` (server vs client component defaults, no inline styles, token-first colour usage, accessibility baseline). Short and concrete.
  8. Write `docs/COPILOT_STUDY/cloud-agent-assignment.md` as a step-by-step walkthrough of the equivalent GitHub Copilot Cloud Agent flow (UI path, session log, PR review) for parity.
  9. Confirm `pnpm install` is clean and `pnpm dev` serves on `http://localhost:3000` without console errors before opening the PR.
  10. Open PR from `feat/scaffold-nextjs` to `main`; paste the Goal-through-Rollback bullets above between the `PLAN:BEGIN`/`PLAN:END` markers; attach evidence (dev-server screenshot, token diff).
- **Success criteria (verifiable):**
  - [ ] Required CI checks pass (plan-gate today; eval/drift/path-guard land in later PRs).
  - [ ] `pnpm install` runs cleanly with no deprecated-peer-dep warnings (captured in PR evidence).
  - [ ] `pnpm dev` serves `http://localhost:3000` with no browser-console or terminal errors (screenshot + log excerpt in PR).
  - [ ] Placeholder page renders using brand colours sourced from the fetched design — values traceable to the design file, not invented by the agent.
  - [ ] `lib/design-tokens.ts` exports a typed `tokens` constant with `colors`, `fonts`, and `spacing` keys (visible in diff).
  - [ ] At least one token-driven Tailwind utility (e.g. `bg-cream`) is applied in `app/page.tsx` and renders the expected colour (visible in screenshot).
  - [ ] `app/CLAUDE.md` exists and is valid Markdown.
  - [ ] `docs/COPILOT_STUDY/cloud-agent-assignment.md` exists with a step-by-step UI walkthrough.
  - [ ] No files modified outside the *Scope* list above (reviewer verifies; drift-check enforces in a later PR).
  - [ ] Branch is `feat/scaffold-nextjs`; no direct pushes to `main`.
- **Risks + mitigations:**
  - *Risk:* `pnpm create next-app` may pull a Next.js version other than 16 (e.g. 15 if 16 is not yet the `latest` tag at run time).
    *Mitigation:* verify version in `package.json` post-scaffold; if it lands on 15, stop and ask before pinning to a release-candidate or canary.
  - *Risk:* Tailwind v4 CSS-first config differs from v3 patterns; `@theme` token wiring is the v4-native path.
    *Mitigation:* document the `@theme` pattern in `app/CLAUDE.md` and inline-comment `globals.css` once. No `tailwind.config.*` file unless v4 requires it.
  - *Risk:* design URL returns HTML rather than parsed tokens — extracting colours/fonts requires reading the markup.
    *Mitigation:* parse `index.html` for CSS custom properties / inline styles; if ambiguous, surface the candidate palette to the user before encoding.
  - *Risk:* scaffolder adds extra dependencies (e.g. analytics, fonts) beyond the issue's "defaults only" constraint.
    *Mitigation:* accept only interactive defaults; if any unexpected dep appears, flag it in the PR body and ask before keeping.
  - *Risk:* pnpm 11 auto-generates `pnpm-workspace.yaml` to gate native build scripts (sharp, unrs-resolver); this file was not in the issue's original scope.
    *Mitigation:* added to *Scope* above; both builds approved via `allowBuilds: true` so `pnpm install` runs clean. sharp is required by `next/image` for production image optimization, unrs-resolver speeds up ESLint module resolution. Future scaffolder versions may emit additional fields here — review before committing.
  - *Risk:* `app/globals.css` `@theme` block and `lib/design-tokens.ts` drift apart as two sources of truth.
    *Mitigation:* `globals.css` is the only place tokens are registered with Tailwind; `lib/design-tokens.ts` is the TypeScript-consumable mirror. Document the relationship in `app/CLAUDE.md`. Convention, not enforcement.
- **Rollback / escalation plan:**
  - Rollback command: `gh workflow run agent-rollback.yml -f sha=<merge-sha>` (once the workflow exists; until then, manual `git revert <merge-sha>` on a follow-up PR).
  - Escalation: add label `needs-human` and tag @mafaq229.

## Autonomy level

- [ ] L0 (automated — docs/**)
- [ ] L1 (suggest only)
- [x] L2 (PR + 1 review — default for app code)
- [ ] L3 (CODEOWNERS + multi-review — workflows/infra)
- [ ] L4 (environment approval — production deploys)

## Workflow choice

Plan + Execution — the issue explicitly designates this as low-risk and reversible (no infra/secrets/auth); reading the plan alongside the diff is cheaper than a separate review round. See `docs/PLAN_FIRST_VS_PLAN_EXEC.md`.
