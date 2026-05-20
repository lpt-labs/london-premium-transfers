# Extracted brand tokens — decisions record

> Companion to [plan.md](plan.md). This file records the canonical token values pulled from the design source so that `lib/design-tokens.ts` and the Tailwind `@theme` block in `app/globals.css` have a single, auditable origin. Keep this file accurate if tokens change.

## Provenance

- Original design source URL: `https://api.anthropic.com/v1/design/h/AuM-Pdsb1aQ1E6TJ2JET6w?open_file=index.html` (returns a tar.gz bundle from claude.ai/design).
- Local extraction path used: `/tmp/lpt-design/travel-website/project/index.html` (lines 12–44 — the `:root {}` block).
- Bundle README: `/tmp/lpt-design/travel-website/README.md`.
- Chat transcript: `/tmp/lpt-design/travel-website/chats/chat1.md` — confirms the stated design system:

  > Geist + Instrument Serif italic for editorial "British" accents, warm-white paper palette, deep forest-green accent used sparingly, hairline rules, generous spacing — Apple/Blacklane-adjacent without imitating either.

- Tone words from the brief: **Premium, British, Trustworthy, Modern**.
- Tweaks panel offered four accent palettes (forest, oxblood, midnight, gold); **forest** is the canonical default and the only one we ship.

## Color tokens

All values are verbatim from the design source's `:root` block. Names preserved.

### Paper (warm-white background scale)

| Name | Value | Role |
|---|---|---|
| `paper` | `#fafaf7` | Page background, default surface |
| `paper-2` | `#f1ede4` | Secondary panel / muted section |
| `paper-3` | `#ebe6d8` | Deeper paper accent |

### Ink (text scale, near-black)

| Name | Value | Role |
|---|---|---|
| `ink` | `#0b0b0c` | Primary text / dark surfaces |
| `ink-2` | `#1c1c1d` | Slightly softer ink |
| `ink-soft` | `#525053` | Body / muted copy |
| `ink-mute` | `#8b8783` | Captions, labels, hints |

### Line (hairline rules)

| Name | Value | Role |
|---|---|---|
| `line` | `#e6e0d3` | Default hairline rule, card border |
| `line-soft` | `#efeae0` | Lighter rule for nested surfaces |

### Accent (brand mark — forest green)

| Name | Value | Role |
|---|---|---|
| `accent` | `#1d3a2e` | Deep forest green — used sparingly on CTAs, brand dots, accent chips |
| `accent-2` | `#264a3c` | Hover state for accent |

### Secondary (rare-use, used for tone)

| Name | Value | Role |
|---|---|---|
| `gold` | `#9a7e3c` | Tertiary accent (offered but not the default palette) |

### Semantic (status colours)

| Name | Value | Role |
|---|---|---|
| `danger` | `#b03a3a` | Errors / destructive actions |
| `ok` | `#1d6b4c` | Success / confirmation |

## Typography

The design loads three Google-hosted families. The exact `<link>` from the source:

```
https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap
```

### Font stacks (verbatim)

| Token | Stack |
|---|---|
| `fonts.sans` | `'Geist', ui-sans-serif, system-ui, -apple-system, sans-serif` |
| `fonts.serif` | `'Instrument Serif', ui-serif, Georgia, serif` |
| `fonts.mono` | `'JetBrains Mono', ui-monospace, monospace` |

### Weights to load

- **Geist**: 300, 400, 500, 600, 700
- **Instrument Serif**: 400 regular + 400 italic (italic is the editorial use)
- **JetBrains Mono**: 400, 500

### Role assignments (from source)

- `body` → `fonts.sans` (Geist), 16px / 1.5, with OpenType features `ss01` and `cv11` enabled.
- Display / `h1` / `h2` headings → `fonts.sans` weight 400 with extreme negative letter-spacing (`-0.035em` down to `-0.025em`).
- Editorial italics inside headings (`<em>` inside `.h-display`, `.h-1`, `.h-2`) → `fonts.serif` italic. This is the British / editorial accent the brief asked for.
- `h-3` (subheadings) → `fonts.sans` weight 500, 22px.
- `eyebrow` labels → `fonts.sans` weight 500, 11px, uppercase, `0.18em` letter-spacing.
- Code / micro labels → `fonts.mono`.

## Radii

| Name | Value |
|---|---|
| `radius.s` | `6px` |
| `radius.m` | `10px` |
| `radius.l` | `18px` |
| `radius.xl` | `28px` |
| `radius.full` | `999px` (used on buttons / chips — derived, not in `:root`, but ubiquitous in the source) |

## Shadows (elevation scale)

Verbatim from `:root`:

| Name | Value |
|---|---|
| `shadow.1` | `0 1px 0 rgba(11,11,12,0.04), 0 1px 2px rgba(11,11,12,0.04)` |
| `shadow.2` | `0 8px 20px -10px rgba(11,11,12,0.12), 0 2px 6px rgba(11,11,12,0.04)` |
| `shadow.3` | `0 30px 60px -30px rgba(11,11,12,0.25), 0 8px 20px -10px rgba(11,11,12,0.10)` |

## Layout constants

| Name | Value | Role |
|---|---|---|
| `layout.maxw` | `1440px` | Container max-width |
| `layout.pad` | `clamp(20px, 4vw, 56px)` | Responsive horizontal page padding |

## Spacing scale — *derived, not in source*

The design does **not** declare a named spacing scale. It uses Tailwind-default-compatible 4-based values directly (gaps of 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 56) plus the responsive `pad`. Decision:

- Do **not** redefine a parallel spacing scale in `lib/design-tokens.ts` — Tailwind v4 already exposes `space-1`/`space-2`/... at 0.25rem increments, which match the design's usage.
- Export a small set of *named* design-specific layout values that Tailwind doesn't give us by default:

  | Name | Value | Why named |
  |---|---|---|
  | `spacing.pad` | `clamp(20px, 4vw, 56px)` | Responsive page padding — unique to this design |
  | `spacing.section` | `clamp(72px, 9vw, 144px)` | *Proposed* — common vertical-rhythm section padding inferred from screens (to be validated against more page-level CSS in a later commit) |
  | `spacing.navHeight` | `76px` | Sticky topbar height (`.topbar-inner` in source) |

  This satisfies the issue's "exports … spacing keys" requirement without inventing a confusing parallel scale.

## Open decisions

1. **Token naming style**: source uses kebab-case CSS variables (`--ink-soft`). We'll mirror the *semantic* names in TS as camelCase (`inkSoft`) and re-export them to CSS as kebab in the `@theme` block. Tailwind utilities will end up as `bg-ink-soft`, `text-accent`, etc.
2. **Gold palette**: source includes `--gold` but the chat shows it's a tweak-panel alternative, not the canonical brand. Keep the token (so a future page can opt in) but **don't** use it in the placeholder page.
3. **Spacing.section**: marked *proposed* — confirm against fuller page-level CSS once we read the rest of `index.html` (we've only audited the `:root` block + utilities so far). If the design has explicit section-padding values further down the file, those override the proposed clamp.
4. **Font loading**: in Next.js we'll prefer `next/font/google` for Geist/Instrument-Serif/JetBrains-Mono (better performance — self-hosts + adds `font-display: swap` automatically) rather than the `<link>` tag from the source. Decision goes into the actual implementation commit, not into the tokens file.
