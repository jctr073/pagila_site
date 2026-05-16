import { Avatar, Btn, Chip } from "@/components/ui";
import type { RentalsByDay } from "@/lib/types";

export type RentalsChartProps = {
  data: RentalsByDay[];
  /** Number of dashed placeholder bars after the historical bars. */
  futureBars?: number;
  storeAvgs: { store_id: number; avg_per_day: number }[];
  avgDuration: number;
  overdue: number;
};

/** Format an ISO date (yyyy-mm-dd) as "MMM D" (e.g. "May 3"). */
function formatShort(iso: string): string {
  // Parse explicit UTC so we don't shift back a day in negative TZs.
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const month = dt.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${month} ${dt.getUTCDate()}`;
}

/**
 * Compute the WoW percentage change from the last 7 days vs. the prior 7.
 * Returns `null` when there isn't enough data on either side.
 */
function wowPercent(data: RentalsByDay[]): number | null {
  if (data.length < 14) return null;
  const last7 = data.slice(-7).reduce((acc, r) => acc + r.rentals, 0);
  const prev7 = data.slice(-14, -7).reduce((acc, r) => acc + r.rentals, 0);
  if (prev7 === 0) return null;
  return ((last7 - prev7) / prev7) * 100;
}

/**
 * Pure presentational SVG-free bar chart. Ports the `db-bars` block from
 * design_handoff_pagila_admin/designs/dashboard.jsx verbatim, then
 * appends the 2×2 mini-tile grid (per-store averages, avg duration,
 * overdue) seen in the same design.
 *
 * The chart auto-scales to the max historical rental count. The "today"
 * bar (the last entry in `data`) renders with the solid accent fill;
 * `futureBars` placeholders trail it with dashed borders.
 */
export default function RentalsChart({
  data,
  futureBars = 2,
  storeAvgs,
  avgDuration,
  overdue,
}: RentalsChartProps) {
  const total = data.length;
  const max = Math.max(1, ...data.map((d) => d.rentals));
  const todayIdx = total - 1;

  const totalCols = total + futureBars;
  const gridTemplate = `repeat(${totalCols}, 1fr)`;

  const wow = wowPercent(data);
  const wowLabel =
    wow === null
      ? "WoW"
      : `${wow >= 0 ? "+" : ""}${Math.round(wow)}% WoW`;
  const wowTone: "success" | "danger" | "default" =
    wow === null ? "default" : wow >= 0 ? "success" : "danger";

  // Axis labels: first historical day, today, plus a midpoint marker.
  const firstLabel = data[0] ? formatShort(data[0].day) : "";
  const midIdx = Math.floor(total / 2);
  const midLabel = data[midIdx] ? formatShort(data[midIdx].day) : "";

  const store1 = storeAvgs.find((s) => s.store_id === 1);
  const store2 = storeAvgs.find((s) => s.store_id === 2);

  return (
    <div className="pa-card" style={{ display: "flex", flexDirection: "column" }}>
      <div className="db-section-h">
        <h3>Rentals last 14 days</h3>
        <span className="sub">Daily check-outs across both stores</span>
        <div className="spacer" />
        <Chip tone={wowTone} dot>
          {wowLabel}
        </Chip>
        <Btn size="sm" variant="ghost" rightIcon="chevron-down">
          Daily
        </Btn>
      </div>

      <div className="db-chart">
        <div className="db-bars" style={{ gridTemplateColumns: gridTemplate }}>
          {data.map((d, i) => {
            const pct = (d.rentals / max) * 100;
            const isToday = i === todayIdx;
            return (
              <div
                key={d.day}
                className={`db-bar${isToday ? " db-bar--today" : ""}`}
                style={{ height: `${Math.max(2, pct)}%` }}
                title={`${formatShort(d.day)} · ${d.rentals} rentals`}
              />
            );
          })}
          {Array.from({ length: futureBars }).map((_, i) => (
            <div
              key={`future-${i}`}
              className="db-bar db-bar--future"
              style={{ height: i === 0 ? "70%" : "65%" }}
            />
          ))}
        </div>
        <div className="axis">
          <span>{firstLabel}</span>
          <span>{midLabel}</span>
          <span>today</span>
        </div>
      </div>

      <hr className="pa-divider" />

      <div className="db-tiles">
        <div className="db-tile">
          <Avatar initials="1" tone="accent" size={32} />
          <div>
            <div className="num">
              {store1?.avg_per_day ?? 0}
              <span className="unit">/day avg</span>
            </div>
            <div className="lbl">Store #1</div>
          </div>
        </div>
        <div className="db-tile">
          <Avatar initials="2" tone="teal" size={32} />
          <div>
            <div className="num">
              {store2?.avg_per_day ?? 0}
              <span className="unit">/day avg</span>
            </div>
            <div className="lbl">Store #2</div>
          </div>
        </div>
        <div className="db-tile">
          <div>
            <div className="num warn">
              {avgDuration}
              <span className="unit">days</span>
            </div>
            <div className="lbl">Avg rental duration</div>
          </div>
        </div>
        <div className="db-tile">
          <div>
            <div className={`num${overdue > 0 ? " warn" : ""}`}>{overdue}</div>
            <div className="lbl">Overdue rentals</div>
          </div>
        </div>
      </div>
    </div>
  );
}
