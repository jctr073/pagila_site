export type RatingValue = "G" | "PG" | "PG-13" | "R" | "NC-17";

/**
 * Rating — MPAA-style pill. Tone map is ported verbatim from
 * designs/primitives.jsx RATING_TONES:
 *   G     → success
 *   PG    → teal
 *   PG-13 → warning
 *   R     → accent (solid)
 *   NC-17 → danger
 *
 * The design uses a dedicated .pa-rating element (smaller, mono font,
 * 4px radius) rather than a generic .pa-chip, so we render that directly
 * instead of routing through <Chip>.
 */

const TONES: Record<
  RatingValue,
  { bg: string; fg: string; bd: string }
> = {
  G: { bg: "var(--success-soft)", fg: "var(--success)", bd: "transparent" },
  PG: { bg: "var(--teal-soft)", fg: "var(--teal)", bd: "transparent" },
  "PG-13": {
    bg: "var(--warning-soft)",
    fg: "var(--warning)",
    bd: "transparent",
  },
  R: {
    bg: "var(--accent-soft)",
    fg: "var(--accent)",
    bd: "var(--accent-soft-border)",
  },
  "NC-17": {
    bg: "var(--danger-soft)",
    fg: "var(--danger)",
    bd: "transparent",
  },
};

export default function Rating({ value }: { value: RatingValue }) {
  const t = TONES[value] ?? TONES.PG;
  return (
    <span
      className="pa-rating"
      style={{ background: t.bg, color: t.fg, borderColor: t.bd }}
    >
      {value}
    </span>
  );
}
