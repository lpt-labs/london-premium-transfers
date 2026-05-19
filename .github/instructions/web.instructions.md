---
applyTo: "app/**,components/**,lib/**"
---

# Web (Next.js + React + Tailwind) instructions

Load only when editing `app/`, `components/`, or `lib/`. Pair with [`../copilot-instructions.md`](../copilot-instructions.md) and [`../../AGENTS.md`](../../AGENTS.md).

## Components

- Function components only. No class components.
- Component files are PascalCase: `BookingForm.tsx`, not `booking-form.tsx`.
- Route folders (`app/...`) are kebab-case: `app/fleet-page/` → URL `/fleet-page`.
- One component per file. If a component is only used by one parent, colocate it as a sub-component below the parent (no extra file).
- Props are typed with an `interface` named `<Component>Props`. Don't reach for `type` unless union/intersection is required.

## Server vs client components (App Router)

- Components are **server components by default** in `app/`. Don't add `"use client"` unless the component uses state, effects, browser APIs, or event handlers.
- Server components can directly fetch data — no `useEffect`, no `getServerSideProps`. Use `async` functions and `await`.
- Push `"use client"` boundaries as far down the tree as possible. Marking a parent forces every child to be client-rendered.

## Tailwind

- Utility classes inline on JSX. No separate `.css` files unless a rule genuinely can't be expressed with utilities.
- Don't repeat long class strings — extract to a constant or a small helper component instead.
- Use design tokens from `lib/design-tokens.ts` (added in PR 4). Don't hard-code hex values in JSX.
- Use `clsx` (or the project's chosen helper) for conditional classes, not template-string concatenation.

## Accessibility

- Use semantic HTML first (`<button>`, `<nav>`, `<main>`, `<a>`). Add ARIA only when semantic HTML can't express the role.
- Every interactive element must be reachable by keyboard and have a visible focus state.
- Images need a meaningful `alt` attribute, or `alt=""` if purely decorative.
- Text/background contrast must meet WCAG AA (`4.5:1` for body, `3:1` for large text).
- No `onClick` on a non-interactive element (`<div onClick>`) — use a `<button>`.

## TypeScript

- Strict mode is on. Don't disable it locally.
- No `any` without a written justification in a comment on the same line.
- Prefer narrowing (`if (typeof x === "string")`) over assertions (`x as string`).
- Export public types from a `types.ts` next to the consumer, not from `lib/` unless reused across more than two callers.

## Anti-patterns specific to this layer

- **Don't reach for a state library** (Zustand, Redux) before there's a concrete cross-component shared-state need. URL state and server-side data covers most of this site.
- **Don't add a UI component library** (Material UI, Chakra) — Tailwind plus a few primitives is the chosen approach.
- **Don't add an animation library** for one-off transitions; Tailwind's `transition-*` utilities or a small CSS keyframe is enough.
