/**
 * Brand design tokens — single source of truth for colours, typography,
 * spacing, radii, shadows, and layout constants used across the site.
 *
 * Values are lifted verbatim from the design source. Provenance and the
 * rationale behind each grouping live in:
 *   docs/agent-tasks/4-scaffold-nextjs/extracted-tokens.md
 *
 * These tokens are re-exported into Tailwind via the @theme block in
 * app/globals.css, so utilities like `bg-ink-soft` and `text-accent`
 * resolve to the values below. TSX code can also import `tokens`
 * directly when it needs to read a value programmatically.
 */

export const tokens = {
  colors: {
    paper: "#fafaf7",
    paper2: "#f1ede4",
    paper3: "#ebe6d8",
    ink: "#0b0b0c",
    ink2: "#1c1c1d",
    inkSoft: "#525053",
    inkMute: "#8b8783",
    line: "#e6e0d3",
    lineSoft: "#efeae0",
    accent: "#1d3a2e",
    accent2: "#264a3c",
    gold: "#9a7e3c",
    danger: "#b03a3a",
    ok: "#1d6b4c",
  },
  fonts: {
    sans: "'Geist', ui-sans-serif, system-ui, -apple-system, sans-serif",
    serif: "'Instrument Serif', ui-serif, Georgia, serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  spacing: {
    pad: "clamp(20px, 4vw, 56px)",
    section: "clamp(72px, 9vw, 144px)",
    navHeight: "76px",
  },
  radii: {
    s: "6px",
    m: "10px",
    l: "18px",
    xl: "28px",
    full: "999px",
  },
  shadows: {
    s1: "0 1px 0 rgba(11,11,12,0.04), 0 1px 2px rgba(11,11,12,0.04)",
    s2: "0 8px 20px -10px rgba(11,11,12,0.12), 0 2px 6px rgba(11,11,12,0.04)",
    s3: "0 30px 60px -30px rgba(11,11,12,0.25), 0 8px 20px -10px rgba(11,11,12,0.10)",
  },
  layout: {
    maxw: "1440px",
  },
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof Tokens["colors"];
export type FontToken = keyof Tokens["fonts"];
export type SpacingToken = keyof Tokens["spacing"];
export type RadiusToken = keyof Tokens["radii"];
export type ShadowToken = keyof Tokens["shadows"];
