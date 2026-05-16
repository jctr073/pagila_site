import { cn } from "./cn";

export type StockBarProps = {
  count: number;
  max?: number;
};

/**
 * StockBar — inventory progress pill ported from designs/films-list.jsx.
 *
 * Color thresholds:
 *   count ≤ 3 → `crit` (danger)
 *   count ≤ 5 → `lo`   (warning)
 *   otherwise → success (default)
 *
 * Default max is 8 per the Phase 2 spec; the design uses max=10 in calls.
 * Pure presentational — server-renderable.
 */
export default function StockBar({ count, max = 8 }: StockBarProps) {
  const safeMax = Math.max(1, max);
  const pct = Math.min(100, Math.round((count / safeMax) * 100));
  const tone = count <= 3 ? "crit" : count <= 5 ? "lo" : "";
  return (
    <span className={cn("fl-stockbar", tone)}>
      <span className="bar">
        <i style={{ width: `${pct}%` }} />
      </span>
      {count}
    </span>
  );
}
