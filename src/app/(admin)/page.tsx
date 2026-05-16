/**
 * Dashboard (`/`) — Phase 5.
 *
 * Server component. Fires every read in parallel, then hands plain
 * objects down to presentational children. No client islands are needed
 * here yet — the only interactive control on this screen (the "Daily"
 * dropdown) is a Phase-11 concern.
 *
 * `force-dynamic` keeps the KPIs fresh on every navigation; the queries
 * are cheap (a handful of indexed counts) so we can afford it for the
 * MVP. Switch to `revalidate = 60` if the dashboard ever becomes the
 * hot path.
 */

import {
  ActivityFeed,
  KpiRow,
  PageHeader,
  RentalsChart,
  TopFilmsList,
} from "@/components/dashboard";
import {
  getAvgRentalDuration,
  getKpis,
  getOverdueRentals,
  getPerStoreRentalAverages,
  getRecentActivity,
  getRentalsByDay,
  getTopFilms,
} from "@/lib/queries/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [kpis, rentals14, storeAvgs, avgDuration, overdue, topFilms, activity] =
    await Promise.all([
      getKpis(),
      getRentalsByDay(14),
      getPerStoreRentalAverages(),
      getAvgRentalDuration(),
      getOverdueRentals(),
      getTopFilms(5),
      getRecentActivity(10),
    ]);

  return (
    <>
      <PageHeader greetingName="there" lastSyncAt={new Date()} />

      <KpiRow kpis={kpis} />

      <div className="db-row">
        <RentalsChart
          data={rentals14}
          futureBars={2}
          storeAvgs={storeAvgs}
          avgDuration={avgDuration}
          overdue={overdue}
        />
        <div className="db-side">
          <TopFilmsList films={topFilms} />
          <ActivityFeed items={activity} />
        </div>
      </div>
    </>
  );
}
