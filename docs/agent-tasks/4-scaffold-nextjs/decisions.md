# Decisions: Scaffold Next.js 16 + Tailwind v4 + extract brand design tokens

> Long-term log of decisions made during this task. Survives the task — never trim.
> Each decision is one entry. Append; do not overwrite.
>
> Companions: [plan.md](plan.md) (the implementation contract), [extracted-tokens.md](extracted-tokens.md) (design provenance), [memory.md](memory.md) (task-time scratchpad).

## Entries

### 2026-05-20 — pnpm 11 build-script gate: approve sharp + unrs-resolver

- **Decision:** commit `pnpm-workspace.yaml` with `allowBuilds: { sharp: true, unrs-resolver: true }` and add the file to the task scope.
- **Alternatives considered:**
  - *B.* commit `pnpm-workspace.yaml` with both builds left ignored (matches scaffolder default) — image optimization would fall back to a slower JS path.
  - *C.* stop and update issue #4's *Repository scope* before committing anything — strictly correct per AGENTS.md, but adds a back-and-forth round for a discovery that's not load-bearing.
- **Rationale:** pnpm 11 auto-creates `pnpm-workspace.yaml` to gate native build scripts as a supply-chain safety measure. `sharp` is the Next-recommended path for `next/image` production optimization (we'll need it for the brand site's hero imagery), and `unrs-resolver` is a Rust-based module resolver used by some ESLint plugins. Both are standard Next.js stack deps; approving them resolves `ERR_PNPM_IGNORED_BUILDS` and makes `pnpm install` clean. Scope expansion is recorded in plan.md (commit `bb85ab4`) so drift-check (when it lands) won't flag the file.
- **By:** @mafaq229 (picked option A in chat).
- **Reversibility:** easy — single-file revert; flipping `true` → `false` re-disables the builds with no migration.
- **Commits:** `69286d5` (file committed), `bb85ab4` (plan scope updated).

### 2026-05-20 — Tailwind v4 token sync: convention over generation

- **Decision:** hand-write the `@theme` block in `app/globals.css` to mirror `lib/design-tokens.ts` verbatim. Sync between TS and CSS is enforced by convention (header comments in both files pointing at each other) plus a planned CI lint step in a later PR.
- **Alternatives considered:**
  - *B.* build-time generator (`scripts/build-tokens.ts`) that emits `@theme` from `tokens` before `next dev` / `next build` — single source of truth automatically, but ~100 lines of TS for ~30 lines of CSS.
  - *C.* invert the relationship: CSS as source of truth, derive TS from a parser — loses TS literal-type propagation for token names.
- **Rationale:** the token surface is small (≈30 lines), changes rarely, and the cost of a build script + maintenance is higher than the cost of a one-time manual sync on token edits. Reviewer responsibility is the gate until a CI sync-check exists. Convention + documentation beats premature automation at this scale.
- **By:** @mafaq229 (picked option A in chat). Aligns with the user-memory note "prefer convention + documentation over enforcement automation".
- **Reversibility:** moderate — adopting the generator later requires writing it once and adding a build hook; no migration of existing data.
- **Commits:** `f45ba55` (decision recorded in design provenance, now superseded by this entry), `6afa288` (implementation).

### 2026-05-20 — Token naming: preserve source vocabulary, override Tailwind defaults where they collide

- **Decision:** keep the design source's own token names verbatim in both TS keys (camelCase: `inkSoft`, `accent2`) and CSS variables (kebab-case: `--color-ink-soft`, `--color-accent-2`). No `brand-` prefix; no rename to align with Tailwind's default scale names. Where a brand value collides with a Tailwind default (notably `--radius-xl`), the `@theme` value wins.
- **Alternatives considered:**
  - *B.* prefix every brand token with `brand-` (`--radius-brand-l`, `--shadow-brand-s2`) — eliminates collisions but adds verbosity and clutters utility class names (`rounded-brand-l`).
  - *C.* rename brand tokens to match Tailwind's default scale (`--radius-md` instead of `--radius-s`) — preserves Tailwind vocabulary but loses the design source's semantic naming.
- **Rationale:** the brand vocabulary is the project's vocabulary; readers of TSX should see `rounded-l` and recognize it as "the brand's large radius" rather than translating from Tailwind's default scale. Collisions are intentional overrides, not accidents.
- **By:** implicit (not separately approved in chat; no objection raised when the @theme block landed).
- **Reversibility:** moderate — a rename touches `lib/design-tokens.ts`, `app/globals.css`, every TSX usage, and the docs. Worth doing in one mechanical pass if the team's preference shifts.
- **Commits:** `a982b90` (TS tokens), `6afa288` (@theme block).

### 2026-05-20 — Font loading via `next/font/google`, not Google Fonts `<link>`

- **Decision:** load `Geist`, `Instrument_Serif`, and `JetBrains_Mono` via `next/font/google` in `app/layout.tsx`, exposing each as a CSS variable (`--font-sans`, `--font-serif`, `--font-mono`) that the `@theme` block references.
- **Alternatives considered:**
  - *B.* port the design source's `<link rel="stylesheet" href="fonts.googleapis.com/...">` block verbatim into `app/layout.tsx` — simpler, matches what the design exported, but adds a render-blocking external request and produces CLS during font load.
- **Rationale:** `next/font/google` downloads the font files at build time, self-hosts them on the same origin, adds `font-display: swap` automatically, and produces no layout shift. The performance + Core Web Vitals win outweighs the slightly higher conceptual overhead of the indirection through CSS variables.
- **By:** implicit (proposed in extracted-tokens.md "Open decisions" before implementation; no objection raised).
- **Reversibility:** easy — swap `next/font` import for a `<link>` tag and remove the `font.variable` className wiring.
- **Commits:** `6afa288`.

### 2026-05-20 — `lib/design-tokens.ts` shape: six groups, not three

- **Decision:** export `tokens` with six top-level keys: `colors`, `fonts`, `spacing`, `radii`, `shadows`, `layout`. The TS file is the single source of truth for every brand-named value used anywhere in the codebase.
- **Alternatives considered:**
  - *B.* export only the three keys issue #4 requires (`colors`, `fonts`, `spacing`) and put `radii` / `shadows` / `layout` values directly in `app/globals.css` only — strictly satisfies the success criterion but creates a parallel source of truth.
- **Rationale:** issue #4 calls out `colors/fonts/spacing` as a minimum, not a maximum. Putting all brand values in one typed file means TSX code that needs a value programmatically (rare, but happens for things like inline SVG fills or Framer Motion transitions) imports from one canonical place; the `@theme` block becomes a mechanical mirror.
- **By:** @mafaq229 (picked option A in chat when asked).
- **Reversibility:** easy — collapse the file to three keys; the @theme block keeps the values either way.
- **Commits:** `a982b90`.

<!-- Append future entries below. Newest at the bottom. -->
