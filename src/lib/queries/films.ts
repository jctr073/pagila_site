import { getPool, query } from "@/lib/db";
import type {
  FilmCastMember,
  FilmDetail,
  FilmInventoryByStore,
  FilmRow,
  Rating,
} from "@/lib/types";

/**
 * Whitelist of sortable columns for the films list.
 * Keys come from the URL/UI; values are hard-coded SQL fragments — only
 * values that pass this lookup ever reach the query string.
 */
const SORT_COLUMNS = {
  id: "f.film_id",
  title: "f.title",
  rate: "f.rental_rate",
  length: "f.length",
  updated: "f.last_update",
} as const;

export type SortKey = keyof typeof SORT_COLUMNS;

const VALID_SORT = new Set<string>(Object.keys(SORT_COLUMNS));
const VALID_DIR = new Set<string>(["asc", "desc"]);

type ListFilmsOpts = {
  search?: string;
  categoryId?: number;
  rating?: Rating;
  sort?: SortKey;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

type FilmRowSql = {
  id: number;
  title: string;
  year: number;
  categories: string[] | null;
  rating: string;
  length: number;
  rate: number;
  replace: number;
  lang: string;
  updated: Date;
  features: string[] | null;
  actors: number;
  inventory: number;
};

export async function listFilms(
  opts: ListFilmsOpts = {},
): Promise<{ rows: FilmRow[]; total: number }> {
  const sortKey: SortKey =
    opts.sort && VALID_SORT.has(opts.sort) ? opts.sort : "updated";
  const dir =
    opts.dir && VALID_DIR.has(opts.dir)
      ? opts.dir.toUpperCase()
      : "DESC";
  const sortCol = SORT_COLUMNS[sortKey];

  const pageSize = opts.pageSize ?? 25;
  const page = opts.page ?? 1;
  const offset = (page - 1) * pageSize;

  const params = [
    opts.search ?? null,
    opts.categoryId ?? null,
    opts.rating ?? null,
  ];

  // `sortCol` and `dir` are both pulled from constants the user can't
  // influence past the whitelist check above — safe to interpolate.
  //
  // Categories arrive via a correlated subquery (array_agg) so films with
  // multiple film_category rows produce ONE row here, not N. The category
  // filter uses EXISTS for the same reason.
  const listSql = `
    SELECT
      f.film_id          AS id,
      f.title            AS title,
      f.release_year     AS year,
      (SELECT array_agg(c.name ORDER BY c.name)
         FROM film_category fc
         JOIN category c ON c.category_id = fc.category_id
        WHERE fc.film_id = f.film_id) AS categories,
      f.rating::text     AS rating,
      f.length           AS length,
      f.rental_rate      AS rate,
      f.replacement_cost AS replace,
      lang.name          AS lang,
      f.last_update      AS updated,
      f.special_features AS features,
      (SELECT count(*) FROM film_actor fa WHERE fa.film_id = f.film_id)::int AS actors,
      (SELECT count(*) FROM inventory i  WHERE i.film_id  = f.film_id)::int AS inventory
    FROM film f
    JOIN language lang    ON lang.language_id = f.language_id
    WHERE ($1::text IS NULL OR f.title ILIKE '%' || $1 || '%')
      AND ($2::int  IS NULL OR EXISTS (
            SELECT 1 FROM film_category fc2
             WHERE fc2.film_id = f.film_id AND fc2.category_id = $2))
      AND ($3::text IS NULL OR f.rating = $3::mpaa_rating)
    ORDER BY ${sortCol} ${dir}, f.film_id ASC
    LIMIT $4 OFFSET $5
  `;

  const countSql = `
    SELECT count(*)::int AS total
    FROM film f
    WHERE ($1::text IS NULL OR f.title ILIKE '%' || $1 || '%')
      AND ($2::int  IS NULL OR EXISTS (
            SELECT 1 FROM film_category fc2
             WHERE fc2.film_id = f.film_id AND fc2.category_id = $2))
      AND ($3::text IS NULL OR f.rating = $3::mpaa_rating)
  `;

  const [listResult, countResult] = await Promise.all([
    query<FilmRowSql>(listSql, [...params, pageSize, offset]),
    query<{ total: number }>(countSql, params),
  ]);

  const rows: FilmRow[] = listResult.rows.map((r) => ({
    id: r.id,
    title: r.title,
    year: r.year,
    categories: r.categories ?? [],
    rating: r.rating as Rating,
    length: r.length,
    rate: r.rate,
    replace: r.replace,
    lang: r.lang,
    updated: r.updated.toISOString(),
    features: r.features ?? [],
    actors: r.actors,
    inventory: r.inventory,
  }));

  return { rows, total: countResult.rows[0]?.total ?? 0 };
}

type FilmDetailSql = {
  id: number;
  title: string;
  desc: string | null;
  year: number;
  duration_days: number;
  rate: number;
  length: number | null;
  replace: number;
  rating: string;
  updated: Date;
  features: string[] | null;
  category: string;
  category_id: number;
  lang: string;
  language_id: number;
  original_lang: string | null;
  original_language_id: number | null;
};

export async function getFilm(id: number): Promise<FilmDetail | null> {
  const sql = `
    SELECT
      f.film_id            AS id,
      f.title              AS title,
      f.description        AS desc,
      f.release_year       AS year,
      f.rental_duration    AS duration_days,
      f.rental_rate        AS rate,
      f.length             AS length,
      f.replacement_cost   AS replace,
      f.rating::text       AS rating,
      f.last_update        AS updated,
      f.special_features   AS features,
      cat.name             AS category,
      cat.category_id      AS category_id,
      lang.name            AS lang,
      lang.language_id     AS language_id,
      ol.name              AS original_lang,
      ol.language_id       AS original_language_id
    FROM film f
    JOIN film_category fc ON fc.film_id = f.film_id
    JOIN category cat     ON cat.category_id = fc.category_id
    JOIN language lang    ON lang.language_id = f.language_id
    LEFT JOIN language ol ON ol.language_id = f.original_language_id
    WHERE f.film_id = $1
  `;

  const { rows } = await query<FilmDetailSql>(sql, [id]);
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    desc: row.desc ?? "",
    year: row.year,
    durationDays: row.duration_days,
    rate: row.rate,
    length: row.length ?? 0,
    replace: row.replace,
    rating: row.rating as Rating,
    updated: row.updated.toISOString(),
    features: row.features ?? [],
    category: row.category,
    categoryId: row.category_id,
    lang: row.lang,
    languageId: row.language_id,
    originalLang: row.original_lang,
    originalLanguageId: row.original_language_id,
  };
}

export async function getFilmInventoryByStore(
  id: number,
): Promise<FilmInventoryByStore[]> {
  const sql = `
    SELECT s.store_id,
           count(i.inventory_id)::int AS units,
           count(r.rental_id) FILTER (WHERE r.return_date IS NULL)::int AS out
    FROM store s
    LEFT JOIN inventory i ON i.store_id = s.store_id AND i.film_id = $1
    LEFT JOIN rental r    ON r.inventory_id = i.inventory_id
    GROUP BY s.store_id
    ORDER BY s.store_id
  `;
  const { rows } = await query<FilmInventoryByStore>(sql, [id]);
  return rows;
}

export async function getFilmCast(id: number): Promise<FilmCastMember[]> {
  const sql = `
    SELECT a.actor_id, a.first_name, a.last_name
    FROM film_actor fa
    JOIN actor a ON a.actor_id = fa.actor_id
    WHERE fa.film_id = $1
    ORDER BY a.last_name, a.first_name
  `;
  const { rows } = await query<FilmCastMember>(sql, [id]);
  return rows;
}

type Film30dSql = {
  cur_30d: number;
  prev_30d: number;
  delta_pct: string | null;
};

export async function getFilm30dPerformance(
  id: number,
): Promise<{ cur30d: number; prev30d: number; deltaPct: number | null }> {
  const sql = `
    WITH cur AS (
      SELECT count(*)::int AS n
      FROM rental r JOIN inventory i ON i.inventory_id = r.inventory_id
      WHERE i.film_id = $1 AND r.rental_date >= current_date - interval '30 days'
    ),
    prev AS (
      SELECT count(*)::int AS n
      FROM rental r JOIN inventory i ON i.inventory_id = r.inventory_id
      WHERE i.film_id = $1
        AND r.rental_date >= current_date - interval '60 days'
        AND r.rental_date <  current_date - interval '30 days'
    )
    SELECT cur.n  AS cur_30d,
           prev.n AS prev_30d,
           CASE WHEN prev.n = 0 THEN NULL
                ELSE round(((cur.n - prev.n)::numeric / prev.n) * 100, 0)
           END   AS delta_pct
    FROM cur, prev
  `;
  const { rows } = await query<Film30dSql>(sql, [id]);
  const row = rows[0];
  if (!row) return { cur30d: 0, prev30d: 0, deltaPct: null };

  // `round(...)` returns numeric → the OID 1700 parser turns it into a JS
  // number already, but the column might also come back null. Normalise.
  const delta =
    row.delta_pct === null || row.delta_pct === undefined
      ? null
      : typeof row.delta_pct === "number"
        ? row.delta_pct
        : parseFloat(row.delta_pct);

  return {
    cur30d: row.cur_30d,
    prev30d: row.prev_30d,
    deltaPct: delta,
  };
}

type DemandRowSql = {
  film_id: number;
  day: Date;
  rentals: number;
};

export async function getFilmDemandSparklines(
  ids: number[],
): Promise<Map<number, number[]>> {
  const out = new Map<number, number[]>();
  if (ids.length === 0) return out;

  const sql = `
    WITH days AS (
      SELECT generate_series(
        current_date - interval '11 days',
        current_date,
        interval '1 day'
      )::date AS day
    ),
    film_ids AS (
      SELECT unnest($1::int[]) AS film_id
    )
    SELECT fi.film_id,
           d.day,
           count(r.rental_id)::int AS rentals
    FROM film_ids fi
    CROSS JOIN days d
    LEFT JOIN inventory i ON i.film_id = fi.film_id
    LEFT JOIN rental r
      ON r.inventory_id = i.inventory_id
      AND r.rental_date::date = d.day
    GROUP BY fi.film_id, d.day
    ORDER BY fi.film_id, d.day
  `;
  const { rows } = await query<DemandRowSql>(sql, [ids]);

  for (const r of rows) {
    let bucket = out.get(r.film_id);
    if (!bucket) {
      bucket = [];
      out.set(r.film_id, bucket);
    }
    bucket.push(r.rentals);
  }
  return out;
}

export async function updateFilmRate(id: number, rate: number): Promise<void> {
  await query(
    `UPDATE film
       SET rental_rate = $2, last_update = now()
     WHERE film_id = $1`,
    [id, rate],
  );
}

export async function updateFilmCategory(
  id: number,
  categoryId: number,
): Promise<void> {
  // `film_category` PK is `film_id` so we delete+insert; both in one tx.
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM film_category WHERE film_id = $1`, [id]);
    await client.query(
      `INSERT INTO film_category (film_id, category_id, last_update)
       VALUES ($1, $2, now())`,
      [id, categoryId],
    );
    await client.query(
      `UPDATE film SET last_update = now() WHERE film_id = $1`,
      [id],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Atomic film update — only fields present on `patch` are written, but the
 * SQL always issues all column assignments (using COALESCE to fall back).
 * This keeps the statement parameterised + cacheable while letting callers
 * pass a sparse patch.
 */
export async function updateFilm(
  id: number,
  patch: Partial<FilmDetail>,
): Promise<void> {
  const sql = `
    UPDATE film
       SET title                = COALESCE($2,  title),
           description          = COALESCE($3,  description),
           release_year         = COALESCE($4,  release_year),
           language_id          = COALESCE($5,  language_id),
           original_language_id = CASE WHEN $13::boolean THEN $6 ELSE original_language_id END,
           rental_duration      = COALESCE($7,  rental_duration),
           rental_rate          = COALESCE($8,  rental_rate),
           length               = COALESCE($9,  length),
           replacement_cost     = COALESCE($10, replacement_cost),
           rating               = COALESCE($11::mpaa_rating, rating),
           special_features     = COALESCE($12::text[], special_features),
           last_update          = now()
     WHERE film_id = $1
     RETURNING film_id
  `;

  // `original_language_id` is nullable in the table, so we can't use
  // COALESCE-NULL to mean "leave it". Use an explicit "touch this field?"
  // flag ($13) instead.
  const touchOriginalLang = Object.prototype.hasOwnProperty.call(
    patch,
    "originalLanguageId",
  );

  await query(sql, [
    id,
    patch.title ?? null,
    patch.desc ?? null,
    patch.year ?? null,
    patch.languageId ?? null,
    patch.originalLanguageId ?? null,
    patch.durationDays ?? null,
    patch.rate ?? null,
    patch.length ?? null,
    patch.replace ?? null,
    patch.rating ?? null,
    patch.features ?? null,
    touchOriginalLang,
  ]);
}

export async function bulkSetCategory(
  ids: number[],
  categoryId: number,
): Promise<void> {
  if (ids.length === 0) return;
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM film_category WHERE film_id = ANY($1::int[])`,
      [ids],
    );
    await client.query(
      `INSERT INTO film_category (film_id, category_id, last_update)
       SELECT unnest($1::int[]), $2, now()`,
      [ids, categoryId],
    );
    await client.query(
      `UPDATE film SET last_update = now() WHERE film_id = ANY($1::int[])`,
      [ids],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// TODO(phase 6): add archived_at migration before exposing bulk archive
//   ALTER TABLE film ADD COLUMN archived_at timestamptz NULL;
// Until that ships, this UPDATE will fail at runtime — keep the function
// signature stable so callers compile, but don't wire it into any UI yet.
export async function bulkArchiveFilms(ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  await query(
    `UPDATE film
        SET archived_at = now(),
            last_update = now()
      WHERE film_id = ANY($1::int[])`,
    [ids],
  );
}
