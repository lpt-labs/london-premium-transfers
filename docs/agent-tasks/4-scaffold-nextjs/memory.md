# Memory: Scaffold Next.js 16 + Tailwind v4 + extract brand design tokens

> Short-term scratchpad from when this task ran. Captures observations and open threads worth carrying into the next adjacent task — but not durable enough for `decisions.md`.
>
> When the task closes (PR merged), trim this file to the minimum that a future agent picking up an adjacent task would actually benefit from reading. Move anything load-bearing into `decisions.md`.

## Files inspected

- `travel-website/project/index.html` (in the design bundle at `/tmp/lpt-design/`) — the canonical brand token source. Only the `:root{}` block (lines 12–44) was deeply audited; the rest of the 635-line file contains utility classes and components that future feature tasks will need.
- `travel-website/chats/chat1.md` — confirmed the stated design intent verbatim ("Geist + Instrument Serif italic for editorial 'British' accents, warm-white paper palette, deep forest-green accent used sparingly"). The tweaks panel offered 4 accent palettes (forest, oxblood, midnight, gold); forest is the canonical default.
- `travel-website/project/standalone-source.html`, `standalone-components.jsx`, `components.jsx`, `pages.jsx`, `app.jsx` — **not yet read**. These hold the full multi-page implementation (Home, Fleet, Services, About, Business accounts, Drivers, Account, 4-step booking flow). Future tasks that implement a specific page should start here.
- The scaffold's default `app/layout.tsx` showed the `next/font/google` pattern (`Geist({ variable: '--font-geist-sans', ... })`). The variable-injection pattern is the canonical way to expose fonts to Tailwind v4's `@theme`.
- `pnpm-workspace.yaml` — when missing, pnpm 11 auto-generates a stub with `allowBuilds: { pkg: "set this to true or false" }`. The placeholder string values are invalid; pnpm expects booleans (`true`/`false`).

## Patterns / utilities to reuse

- **`WebFetch` returns binary as a file path.** When a URL returns non-text (gzip, tar, image, PDF), `WebFetch` saves the bytes to a temp path and returns the path in its error/response. For design bundles from claude.ai/design (tar.gz), this is the intended retrieval path — pipe through `gunzip` + `tar xf`.
- **`as const` + `typeof` for typed tokens.** See `lib/design-tokens.ts` — `export const tokens = { ... } as const` plus `export type Tokens = typeof tokens` gives literal-type propagation through the whole nested tree with zero manual interface definitions. Same pattern works for any other token-shaped constant (route maps, status enums, etc.).
- **next/font variable injection.** Loading a font via `next/font/google` and passing `{ variable: "--font-sans" }` registers the font under that CSS variable on whatever element you stamp `font.variable` onto. Putting all `font.variable` classes on `<html>` in `RootLayout` makes the variables available everywhere — and that's what `@theme` references.
- **Tailwind v4 `@theme` namespace → utility mapping.** `--color-X` → `bg-X` / `text-X` / `border-X`. `--font-X` → `font-X`. `--radius-X` → `rounded-X`. `--shadow-X` → `shadow-X`. `--spacing-X` → `p-X` / `m-X` / `gap-X` / `w-X` / `h-X`. The variable name *is* the utility name with the namespace prefix stripped — no manual binding step.

## Open questions

- [ ] `spacing.section` value (`clamp(72px, 9vw, 144px)`) is **proposed, not validated** against the full design source. Only `:root{}` was audited; if the rest of `index.html` defines explicit section-padding values, those should override the proposed clamp. Worth checking in the next page-level feature task.
- [ ] No CI lint exists yet that catches drift between `lib/design-tokens.ts` and `app/globals.css`. Convention + header comments + reviewer responsibility cover it for now (per `decisions.md`). Sibling task to plan-gate / drift-check.
- [ ] The tweaks panel in the design source offers 3 alternate accent palettes (oxblood, midnight, gold). Only the default forest is wired today. If the brand decides to support theme switching (a useful product capability for distinct service tiers, e.g. corporate vs. private), it's a self-contained future feature — swap the `--color-accent` / `--color-accent-2` pair via a class on `<html>`.
- [ ] `--gold` is committed in tokens but not used anywhere yet. Keeping it (per `extracted-tokens.md` open-decision 2) so future pages can opt in without re-extending the token surface.

## Side observations

- The design bundle contains 17 screen JPGs in `travel-website/project/screens/`. The README explicitly says "don't render these unless asked" — but for visual review during a page-level implementation task, these are the source of truth, not screenshots from a running dev server.
- `London Premium Transfers.html` in the bundle is the **standalone build** with all images inlined (6.4MB). It will open offline in a browser as-is — useful as a visual reference when implementing a specific section, e.g. the booking widget or the fleet grid.
- The design uses font-feature-settings `"ss01"` + `"cv11"` on body — these are Geist's stylistic alternates (the "a" with curved tail, etc.). They're now in `app/globals.css`'s `body {}` rule; future TSX should not override font-feature-settings without a deliberate reason.
- The design's nav is sticky with `backdrop-filter: saturate(1.4) blur(14px); background: rgba(250,250,247,0.78);` — when the topbar is implemented in a future task, this is the canonical effect. Not yet a token because the rgba/blur values are too specific to abstract usefully.
- ESLint's `next/font/google` import works only when the font name is a string literal — dynamic import would silently fall back to the runtime path. Keep font imports inlined at the top of `layout.tsx`.

## Side observations worth graduating to issues (post-merge)

- A `scripts/check-tokens-sync.ts` lint to enforce `lib/design-tokens.ts` ↔ `app/globals.css` parity (mentioned in `decisions.md` as a planned future PR).
- Implementing the full Home page from the design bundle — large enough to be its own task; not a continuation of issue #4.
- The `pnpm-workspace.yaml` allowlist will need re-review whenever a new dep with a native build script is added. A short workflow that diffs the allowlist on PRs touching `package.json` would be nice.
