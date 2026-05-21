# Decisions: Homepage — hero / services / fleet / footer

> Long-term log of decisions made during this task. Survives the task — never trim.
> Companions: [plan.md](plan.md).

## Entries

### 2026-05-21 — max-w-[1440px] as arbitrary value

- **Decision:** Use `max-w-[1440px]` as a Tailwind arbitrary value for the section container max-width rather than a named utility.
- **Rationale:** `tokens.layout.maxw: "1440px"` exists in `lib/design-tokens.ts` but is not exposed as a Tailwind utility in `app/globals.css` (`@theme` has no `--max-w-*` or `--layout-*` namespace). The value is directly traceable to the design token. Adding `--max-w-layout: 1440px` to the `@theme` block is the right long-term fix; deferred to a follow-up task to avoid modifying `app/globals.css` outside the authorized scope.
- **Reversibility:** Mechanical — grep for `max-w-[1440px]` and replace with `max-w-layout` once the token is registered.

### 2026-05-21 — Fleet image placeholders

- **Decision:** Use a styled `<div aria-hidden="true" className="aspect-video bg-paper-3 ...">` placeholder in each fleet card instead of `<Image>` from `next/image`.
- **Rationale:** The design source URL was inaccessible at implementation time. Vehicle images are not committed to `public/`. A placeholder ships to preview so the reviewer can assess layout and spacing; it is clearly labelled in a code comment. Wiring real vehicle assets is a natural follow-up task.
- **Reversibility:** Direct — replace the `<div>` with `<Image src="..." alt="..." fill />` once assets are committed.

### 2026-05-21 — Numbered service indicators instead of SVG icons

- **Decision:** Use `font-mono` numbered labels (`01`–`04`) as service card indicators rather than inline SVG icons.
- **Rationale:** No icon set is installed (adding one would require a new dependency, which the issue prohibits without prior approval). Typographic indicators are on-brand for the editorial/British aesthetic and require zero additional markup. If the design source shows icons, replace these indicators in a follow-up.
- **Reversibility:** Direct — swap the `<p>` indicator for an `<svg>` element once the design's icon vocabulary is confirmed.

### 2026-05-21 — Dark (bg-ink) hero background

- **Decision:** Hero section uses `bg-ink text-paper` rather than the `bg-paper text-ink` used in the placeholder.
- **Rationale:** The design source was inaccessible; design choice made on brand context. Dark-on-light is common for premium chauffeur services (Blacklane, Carey). Creates strong visual contrast against the warm `bg-paper-2` services section that follows. If the design source shows a light hero, update `bg-ink` → `bg-paper` and `text-paper` → `text-ink` in Hero.tsx.
- **Reversibility:** Two class changes in `components/Hero.tsx`.

<!-- Append future entries below. Newest at the bottom. -->
