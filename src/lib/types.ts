/**
 * Shared row + DTO types for the Pagila admin app.
 *
 * Field names use camelCase even when the underlying SQL alias is snake_case
 * (e.g. `delta_pct` → `deltaPct`); query functions convert in JS.
 */

export type Rating = "G" | "PG" | "PG-13" | "R" | "NC-17";

/** Allowed values for `film.special_features` (text[] in Postgres). */
export type SpecialFeature =
  | "Trailers"
  | "Commentaries"
  | "Deleted Scenes"
  | "Behind the Scenes";

/** One row in the films list table (DATA_MODEL.md §5.1). */
export type FilmRow = {
  id: number;
  title: string;
  year: number;
  /** Pagila ships one category per film, but the seeded DB has many — render as a list of chips. */
  categories: string[];
  rating: Rating;
  length: number;
  /** rental_rate, numeric → number (parsed via OID 1700 type parser). */
  rate: number;
  /** replacement_cost, numeric → number. */
  replace: number;
  lang: string;
  /** ISO timestamp string (`last_update`). */
  updated: string;
  features: string[];
  actors: number;
  inventory: number;
};

/** Full film detail (DATA_MODEL.md §7.1). */
export type FilmDetail = {
  id: number;
  title: string;
  desc: string;
  year: number;
  /** rental_duration in days. */
  durationDays: number;
  rate: number;
  length: number;
  replace: number;
  rating: Rating;
  updated: string;
  features: string[];
  category: string;
  categoryId: number;
  lang: string;
  languageId: number;
  originalLang: string | null;
  originalLanguageId: number | null;
};

/** Per-store inventory rollup for a single film (§7.2). */
export type FilmInventoryByStore = {
  store_id: number;
  city: string;
  units: number;
  out: number;
};

/** Cast list entry (§7.3). */
export type FilmCastMember = {
  actor_id: number;
  first_name: string;
  last_name: string;
};

/** Dashboard top-line KPIs (§1.1–1.5). */
export type DashboardKpi = {
  totalFilms: number;
  activeRentals: number;
  lowStock: number;
  /** Sum of payments since `date_trunc('month', current_date)`. */
  mtdRevenue: number;
  /** 8-element array, oldest day first (current_date - 7 days … current_date). */
  sparkRevenue: number[];
};

/** Single bucket from the 14-day rentals bar chart (§2). */
export type RentalsByDay = {
  /** ISO date (yyyy-mm-dd). */
  day: string;
  rentals: number;
};

/** Top-films-this-month entry (§3). */
export type TopFilm = {
  id: number;
  title: string;
  category: string;
  rentals: number;
};

/** Recent activity feed entry (§4, option a). */
export type RecentActivity = {
  kind: string;
  /** ISO timestamp. */
  at: string;
  who: string;
  what: string;
  detail: string;
};

/** Merged store + rollups (§9.1 + §9.2). */
export type StoreRow = {
  id: number;
  address: string;
  city: string;
  country: string;
  phone: string;
  manager: string;
  managerEmail: string;
  managerId: number;
  inventory: number;
  activeRentals: number;
  staff: number;
};

/** Staff list entry (§9.3). */
export type StaffRow = {
  id: number;
  name: string;
  username: string;
  email: string;
  store: number;
  role: "Manager" | "Clerk";
  active: boolean;
  /** ISO timestamp (`staff.last_update` used as proxy for "started"). */
  started: string;
  rentalsMtd: number;
};
