import { Icon, Sparkline, type IconName } from "@/components/ui";

export type KpiTileProps = {
  label: string;
  iconName: IconName;
  value: string | number;
  /** e.g. " USD" or "%" — rendered in a small soft caption beside the number. */
  unit?: string;
  /** Numeric delta vs. previous window (positive or negative). */
  delta?: number;
  deltaDir?: "up" | "down";
  /** Trailing sparkline values, oldest first. */
  spark?: number[];
  sparkColor?: string;
};

function formatDelta(d: number): string {
  const sign = d > 0 ? "+" : d < 0 ? "" : "";
  // Round to one decimal if it's not a clean integer.
  const rounded =
    Math.abs(d) >= 10 || Number.isInteger(d) ? Math.round(d) : Math.round(d * 10) / 10;
  return `${sign}${rounded}%`;
}

/**
 * Pure presentational KPI tile. Mirrors the `Kpi` component in
 * design_handoff_pagila_admin/designs/dashboard.jsx (the `pa-card db-kpi`
 * block). Style rules live in src/app/_dashboard.css.
 */
export default function KpiTile({
  label,
  iconName,
  value,
  unit,
  delta,
  deltaDir,
  spark,
  sparkColor,
}: KpiTileProps) {
  const hasSpark = spark && spark.length >= 2;
  return (
    <div className="pa-card db-kpi">
      <div className="lbl">
        <Icon name={iconName} size={13} className="ico" /> {label}
      </div>
      <div className="row">
        <div className="val">
          {value}
          {unit && <span className="unit">{unit}</span>}
        </div>
        {hasSpark && (
          <Sparkline
            data={spark!}
            color={sparkColor ?? "var(--accent)"}
            width={92}
            height={32}
          />
        )}
      </div>
      {delta !== undefined && (
        <div className={`db-kpi-delta ${deltaDir ?? (delta >= 0 ? "up" : "down")}`}>
          <Icon
            name={deltaDir === "down" || delta < 0 ? "arrow-down" : "arrow-up"}
            size={11}
          />{" "}
          {formatDelta(delta)}
          <span className="ago">vs. last 30d</span>
        </div>
      )}
    </div>
  );
}
