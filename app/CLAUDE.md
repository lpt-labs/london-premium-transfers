# app/CLAUDE.md

Rules for any agent (Claude, Copilot, future agents) working anywhere under `app/`. This file is loaded **in addition to** the root [`CLAUDE.md`](../CLAUDE.md) and [`AGENTS.md`](../AGENTS.md), not in place of them.

## Rendering model

- **Default to Server Components.** Every file under `app/` is a Server Component unless it begins with `"use client";`. Server Components render to HTML on the server, ship zero React JavaScript to the browser, and can do data fetching directly with `await`.
- **Opt into `"use client"` only when you need browser-only APIs**: `useState`, `useEffect`, `useRef` against a DOM node, event handlers (`onClick`, `onChange`, etc.), or a library that touches `window`/`document`. When you add `"use client"`, write a one-line comment above it stating *which* browser API forced the boundary.
- **Move the boundary down, not up.** If only a button needs to be interactive, make the button a small client component imported into a server-rendered page — don't make the entire page a client component.

## Styling

- **All colour, font, radius, shadow, and spacing values come from the design tokens.** Use the Tailwind utilities generated from the `@theme` block in [`globals.css`](./globals.css) (`bg-paper`, `text-ink`, `text-ink-soft`, `text-accent`, `rounded-l`, `shadow-s2`, `px-pad`, `font-serif`, etc.). If a value you need isn't a token yet, **add it to [`lib/design-tokens.ts`](../lib/design-tokens.ts) and [`app/globals.css`](./globals.css) first**, then use it.
- **No raw hex codes, rgb(), or hard-coded px paddings in TSX.** Exception: arbitrary values needed for one-off animation curves or non-design pixel-perfect alignments — comment why and link to the design.
- **No `style={{ … }}` props for visual concerns.** They bypass Tailwind and the tokens and silently drift from the brand. Reserved only for animated transform/opacity values Tailwind genuinely can't express.
- **Fonts**: `font-sans` (Geist) for body and headings, `font-serif` (Instrument Serif, italic) for editorial emphasis inside headings, `font-mono` (JetBrains Mono) for code and micro-labels. Don't introduce additional fonts.

## Accessibility baseline (non-negotiable)

- Every `<button>` has accessible text or `aria-label`.
- Every `<a>` that looks like a button still semantically links to a URL.
- Every `<img>` has `alt`. Use `next/image` (`<Image>`) for any non-decorative image.
- Every form `<input>` has an associated `<label>`. Placeholders are not labels.
- Every interactive element shows a visible focus ring (Tailwind's `focus-visible:` variants).
- Colour contrast meets WCAG AA against the paper background.

## App Router conventions

- `page.tsx` — route entry. URL is the folder path.
- `layout.tsx` — wraps everything in the same folder and below. Layouts persist across navigation; they don't remount.
- `loading.tsx`, `error.tsx`, `not-found.tsx` — automatic UI for the matching states. Prefer these over manual state machines.
- `route.ts` — REST/JSON endpoints colocated with the route. Use sparingly; prefer Server Actions for mutations.
- Data fetching: prefer fetching inside a Server Component with `await fetch()` (caching defaults are Next's responsibility). Avoid `useEffect`-fetch on the client.

## TypeScript

- `strict: true` is on. **No `any`** without a written one-line justification on the same line.
- Prefer `as const` and `satisfies` over loose object types when you want literal-type propagation (see [`lib/design-tokens.ts`](../lib/design-tokens.ts) for the pattern).

## Imports

- Use the `@/` alias (`import { tokens } from "@/lib/design-tokens"`), never deep relative paths (`../../../lib/...`).
- Sort: `react`/`next` → other packages → `@/` aliases → relative paths.

## When unsure

Stop and ask. Cheaper than a wrong-looking PR.
