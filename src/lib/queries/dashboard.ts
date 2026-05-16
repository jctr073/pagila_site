import { query } from "@/lib/db";
import type {
  DashboardKpi,
  RecentActivity,
  RentalsByDay,
  TopFilm,
} from "@/lib/types";

type CountRow = { n: number };
type RevenueRow = { revenue: number };
type SparkRow = { day: Date; revenue: number };

export async function getKpis(): Promise<DashboardKpi> {
  const totalFilmsSql = `SELECT count(*)::int AS n FROM film`;

  const activeRentalsSql = `
    SELECT count(*)::int AS n
    FROM rental
    WHERE return_date IS NULL
  `;

  const lowStockSql = `
    SELECT count(*)::int AS n
    FROM (
      SELECT f.film_id, count(i.inventory_id) AS copies
      FROM film f
      LEFT JOIN inventory i ON i.film_id = f.film_id
      GROUP BY f.film_id
      HAVING count(i.inventory_id) < 4
    ) t
  `;

  const mtdRevenueSql = `
    SELECT coalesce(sum(amount), 0)::numeric AS revenue
    FROM payment
    WHERE payment_date >= date_trunc('month', current_date)
  `;

  const sparkSql = `
    WITH days AS (
      SELECT generate_series(
        current_date - interval '7 days',
        current_date,
        interval '1 day'
      )::date AS day
    )
    SELECT d.day,
           coalesce(sum(p.amount), 0)::numeric AS revenue
    FROM days d
    LEFT JOIN payment p
      ON date_trunc('day', p.payment_date) = d.day
    GROUP BY d.day
    ORDER BY d.day
  `;

  const [total, active, low, rev, spark] = await Promise.all([
    query<CountRow>(totalFilmsSql),
    query<CountRow>(activeRentalsSql),
    query<CountRow>(lowStockSql),
    query<RevenueRow>(mtdRevenueSql),
    query<SparkRow>(sparkSql),
  ]);

  return {
    totalFilms: total.rows[0]?.n ?? 0,
    activeRentals: active.rows[0]?.n ?? 0,
    lowStock: low.rows[0]?.n ?? 0,
    mtdRevenue: rev.rows[0]?.revenue ?? 0,
    sparkRevenue: spark.rows.map((r) => r.revenue),
  };
}

type RentalsByDaySql = { day: Date; rentals: number };

export async function getRentalsByDay(days = 14): Promise<RentalsByDay[]> {
  const sql = `
    WITH days AS (
      SELECT generate_series(
        current_date - (($1::int - 1) || ' days')::interval,
        current_date,
        interval '1 day'
      )::date AS day
    )
    SELECT d.day,
           count(r.rental_id)::int AS rentals
    FROM days d
    LEFT JOIN rental r ON r.rental_date::date = d.day
    GROUP BY d.day
    ORDER BY d.day
  `;
  const { rows } = await query<RentalsByDaySql>(sql, [days]);
  return rows.map((r) => ({
    day: toIsoDate(r.day),
    rentals: r.rentals,
  }));
}

type StoreAvgSql = { store_id: number; avg_per_day: number };

export async function getPerStoreRentalAverages(): Promise<
  { store_id: number; avg_per_day: number }[]
> {
  const sql = `
    SELECT s.store_id,
           round(count(r.rental_id)::numeric / 30, 0)::int AS avg_per_day
    FROM store s
    LEFT JOIN inventory i ON i.store_id = s.store_id
    LEFT JOIN rental r
      ON r.inventory_id = i.inventory_id
      AND r.rental_date >= current_date - interval '30 days'
    GROUP BY s.store_id
    ORDER BY s.store_id
  `;
  const { rows } = await query<StoreAvgSql>(sql);
  return rows;
}

type AvgDurationSql = { avg_days: number | null };

export async function getAvgRentalDuration(): Promise<number> {
  const sql = `
    SELECT round(
      avg(extract(epoch FROM (return_date - rental_date)) / 86400)::numeric,
      1
    ) AS avg_days
    FROM rental
    WHERE return_date IS NOT NULL
      AND rental_date >= current_date - interval '30 days'
  `;
  const { rows } = await query<AvgDurationSql>(sql);
  return rows[0]?.avg_days ?? 0;
}

export async function getOverdueRentals(): Promise<number> {
  const sql = `
    SELECT count(*)::int AS n
    FROM rental r
    JOIN inventory i ON i.inventory_id = r.inventory_id
    JOIN film f      ON f.film_id = i.film_id
    WHERE r.return_date IS NULL
      AND r.rental_date < current_date - (f.rental_duration || ' days')::interval
  `;
  const { rows } = await query<CountRow>(sql);
  return rows[0]?.n ?? 0;
}

export async function getTopFilms(limit = 5): Promise<TopFilm[]> {
  const sql = `
    SELECT f.film_id AS id,
           f.title,
           cat.name  AS category,
           count(r.rental_id)::int AS rentals
    FROM film f
    JOIN film_category fc ON fc.film_id = f.film_id
    JOIN category cat     ON cat.category_id = fc.category_id
    JOIN inventory i      ON i.film_id = f.film_id
    JOIN rental r         ON r.inventory_id = i.inventory_id
    WHERE r.rental_date >= date_trunc('month', current_date)
    GROUP BY f.film_id, f.title, cat.name
    ORDER BY rentals DESC
    LIMIT $1
  `;
  const { rows } = await query<TopFilm>(sql, [limit]);
  return rows;
}

type RecentActivitySql = {
  kind: string;
  at: Date;
  who: string;
  what: string;
  detail: string;
};

export async function getRecentActivity(limit = 10): Promise<RecentActivity[]> {
  // §4 option (a): synthesise from payment + rental joins.
  const sql = `
    SELECT 'payment' AS kind,
           p.payment_date AS at,
           (s.first_name || ' ' || s.last_name) AS who,
           f.title AS what,
           p.amount::text AS detail
    FROM payment p
    JOIN staff s     ON s.staff_id = p.staff_id
    JOIN rental r    ON r.rental_id = p.rental_id
    JOIN inventory i ON i.inventory_id = r.inventory_id
    JOIN film f      ON f.film_id = i.film_id
    ORDER BY p.payment_date DESC
    LIMIT $1
  `;
  const { rows } = await query<RecentActivitySql>(sql, [limit]);
  return rows.map((r) => ({
    kind: r.kind,
    at: r.at.toISOString(),
    who: r.who,
    what: r.what,
    detail: r.detail,
  }));
}

/** `pg` returns DATE columns as JS `Date` (midnight local). Stringify as ISO date. */
function toIsoDate(d: Date): string {
  // Use UTC components to avoid TZ drift; the value already represents a calendar day.
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
