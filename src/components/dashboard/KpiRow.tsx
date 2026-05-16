import type { DashboardKpi } from "@/lib/types";
import KpiTile from "./KpiTile";

export type KpiRowProps = {
  kpis: DashboardKpi;
};

/**
 * 4-column KPI row. Wires up the four cards spec'd in README §4.1:
 * Total films · Active rentals · Low-stock films · MTD revenue.
 *
 * The Phase-4 data layer only ships a revenue sparkline, so the other
 * three tiles render without a sparkline (KpiTile gracefully omits it
 * when `spark` is missing or too short). Delta percentages are stubbed
 * with hand-picked placeholders since the query layer doesn't compute
 * period-over-period deltas yet.
 */
export default function KpiRow({ kpis }: KpiRowProps) {
  const revenueRounded = Math.round(kpis.mtdRevenue);
  const revenueFormatted = revenueRounded.toLocaleString("en-US");

  return (
    <div className="db-grid">
      <KpiTile
        label="Total films"
        iconName="film"
        value={kpis.totalFilms.toLocaleString("en-US")}
        delta={1.2}
        deltaDir="up"
      />
      <KpiTile
        label="Active rentals"
        iconName="cycle"
        value={kpis.activeRentals.toLocaleString("en-US")}
        delta={4.8}
        deltaDir="up"
        sparkColor="var(--teal)"
      />
      <KpiTile
        label="Low-stock films"
        iconName="archive"
        value={kpis.lowStock.toLocaleString("en-US")}
        delta={-2.4}
        deltaDir="down"
        sparkColor="var(--warning)"
      />
      <KpiTile
        label="MTD revenue"
        iconName="money"
        value={`$${revenueFormatted}`}
        unit=" USD"
        delta={8.2}
        deltaDir="up"
        spark={kpis.sparkRevenue}
        sparkColor="var(--success)"
      />
    </div>
  );
}
