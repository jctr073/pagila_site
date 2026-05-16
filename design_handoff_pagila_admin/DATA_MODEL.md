# Pagila Data Model — Queries for Every Screen

Every SQL block below targets the real Pagila schema. All queries use parameterized arguments (`$1`, `$2`, …) — never interpolate user input.

## 0. Schema overview (relevant tables)

```
film         ─< film_category >─ category
   │
   ├─< film_actor >─ actor
   │
   ├─ language  (language_id, original_language_id)
   │
   └─< inventory >─< rental >─< payment
                       │
                       └─ staff ─ store ─ address ─ city ─ country
```

Key columns:

| Table | Columns of interest |
|---|---|
| `film` | `film_id, title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating, last_update, special_features text[]` |
| `category` | `category_id, name` (16 rows: Action, Animation, …) |
| `inventory` | `inventory_id, film_id, store_id` — one row per physical copy |
| `rental` | `rental_date, inventory_id, customer_id, return_date, staff_id` — return_date IS NULL = currently out |
| `payment` | `amount numeric(5,2), payment_date` |
| `staff` | `staff_id, first_name, last_name, email, store_id, active, username` |
| `store` | `store_id, manager_staff_id, address_id` |

Useful helpers: Pagila ships with a view `film_list` that already joins category + actors as comma-separated text. We avoid it for typed queries.

---

## 1. Dashboard — KPIs

### 1.1 Total films

```sql
SELECT count(*)::int AS total FROM film;
```

### 1.2 Active rentals (currently out, not returned)

```sql
SELECT count(*)::int AS active
FROM rental
WHERE return_date IS NULL;
```

### 1.3 Low-stock films (< 4 copies across all stores)

```sql
SELECT count(*)::int AS low_stock
FROM (
  SELECT f.film_id, count(i.inventory_id) AS copies
  FROM film f
  LEFT JOIN inventory i ON i.film_id = f.film_id
  GROUP BY f.film_id
  HAVING count(i.inventory_id) < 4
) t;
```

### 1.4 MTD revenue (sum of payments since start of month)

```sql
SELECT coalesce(sum(amount), 0)::numeric AS revenue
FROM payment
WHERE payment_date >= date_trunc('month', current_date);
```

### 1.5 Sparkline for each KPI

Replace the mocked sparkline arrays with the last 8 day-buckets:

```sql
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
ORDER BY d.day;
```

(swap `sum(p.amount)` for `count(r.rental_id)` from `rental` where `return_date IS NULL` snapshotted per day if you want active-rental sparkline)

---

## 2. Dashboard — Rentals last 14 days bar chart

```sql
WITH days AS (
  SELECT generate_series(
    current_date - interval '13 days',
    current_date,
    interval '1 day'
  )::date AS day
)
SELECT d.day,
       count(r.rental_id)::int AS rentals
FROM days d
LEFT JOIN rental r ON r.rental_date::date = d.day
GROUP BY d.day
ORDER BY d.day;
```

The two trailing "future" bars in the design are illustrative — leave them as a separate forecast/placeholder block or drop them.

### Per-store rental averages (for the mini-tiles)

```sql
SELECT s.store_id,
       round(count(r.rental_id)::numeric / 30, 0)::int AS avg_per_day
FROM store s
LEFT JOIN inventory i ON i.store_id = s.store_id
LEFT JOIN rental r
  ON r.inventory_id = i.inventory_id
  AND r.rental_date >= current_date - interval '30 days'
GROUP BY s.store_id
ORDER BY s.store_id;
```

### Avg rental duration

```sql
SELECT round(avg(extract(epoch FROM (return_date - rental_date)) / 86400)::numeric, 1) AS avg_days
FROM rental
WHERE return_date IS NOT NULL
  AND rental_date >= current_date - interval '30 days';
```

### Overdue rentals (out longer than the film's rental_duration)

```sql
SELECT count(*)::int AS overdue
FROM rental r
JOIN inventory i ON i.inventory_id = r.inventory_id
JOIN film f ON f.film_id = i.film_id
WHERE r.return_date IS NULL
  AND r.rental_date < current_date - (f.rental_duration || ' days')::interval;
```

---

## 3. Dashboard — Top films this month

```sql
SELECT f.film_id AS id,
       f.title,
       cat.name AS category,
       count(r.rental_id)::int AS rentals
FROM film f
JOIN film_category fc ON fc.film_id = f.film_id
JOIN category cat ON cat.category_id = fc.category_id
JOIN inventory i ON i.film_id = f.film_id
JOIN rental r ON r.inventory_id = i.inventory_id
WHERE r.rental_date >= date_trunc('month', current_date)
GROUP BY f.film_id, f.title, cat.name
ORDER BY rentals DESC
LIMIT 5;
```

> Pagila uses one category per film (PK on `film_category.film_id`). If multi-cat is added later this query needs `string_agg`.

---

## 4. Dashboard — Recent activity feed

Pagila has no first-class audit log. Two options:

**a)** Synthesize from `payment` + `rental` + `last_update` columns. Example:

```sql
SELECT 'payment' AS kind, p.payment_date AS at,
       (s.first_name || ' ' || s.last_name) AS who,
       f.title AS what,
       p.amount::text AS detail
FROM payment p
JOIN staff s    ON s.staff_id = p.staff_id
JOIN rental r   ON r.rental_id = p.rental_id
JOIN inventory i ON i.inventory_id = r.inventory_id
JOIN film f      ON f.film_id = i.film_id
ORDER BY p.payment_date DESC
LIMIT 10;
```

**b)** Add a small `activity` table for real audit logging (recommended long-term):

```sql
CREATE TABLE activity (
  id bigserial PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_staff_id int REFERENCES staff(staff_id),
  kind text NOT NULL,              -- 'film.update' | 'inventory.add' | 'film.archive' | …
  target_kind text,                -- 'film' | 'staff' | …
  target_id int,
  detail jsonb
);
CREATE INDEX activity_recent ON activity (occurred_at DESC);
```

Then `INSERT` from every server action that mutates state. MVP can ship with (a); migrate to (b) when adding the audit screen.

---

## 5. Films list

### 5.1 Paginated list

Pagila's `film_list` view has comma-separated actor names — handy for the prototype's "10 actors · English" meta line but inefficient. Better:

```sql
SELECT
  f.film_id        AS id,
  f.title          AS title,
  f.release_year   AS year,
  cat.name         AS category,
  f.rating::text   AS rating,
  f.length         AS length,
  f.rental_rate    AS rate,
  f.replacement_cost AS replace,
  lang.name        AS lang,
  f.last_update    AS updated,
  f.special_features AS features,
  (SELECT count(*) FROM film_actor fa WHERE fa.film_id = f.film_id)::int AS actors,
  (SELECT count(*) FROM inventory i WHERE i.film_id = f.film_id)::int AS inventory
FROM film f
JOIN film_category fc ON fc.film_id = f.film_id
JOIN category cat     ON cat.category_id = fc.category_id
JOIN language lang    ON lang.language_id = f.language_id
WHERE  ($1::text IS NULL OR f.title ILIKE '%' || $1 || '%')
   AND ($2::int IS NULL  OR cat.category_id = $2)
   AND ($3::text IS NULL OR f.rating = $3::mpaa_rating)
ORDER BY
  CASE WHEN $4 = 'title'    AND $5 = 'asc'  THEN f.title       END ASC,
  CASE WHEN $4 = 'title'    AND $5 = 'desc' THEN f.title       END DESC,
  CASE WHEN $4 = 'rate'     AND $5 = 'asc'  THEN f.rental_rate END ASC,
  CASE WHEN $4 = 'rate'     AND $5 = 'desc' THEN f.rental_rate END DESC,
  CASE WHEN $4 = 'updated'  AND $5 = 'asc'  THEN f.last_update END ASC,
  CASE WHEN $4 = 'updated'  AND $5 = 'desc' THEN f.last_update END DESC,
  f.film_id ASC                                       -- stable tiebreaker
LIMIT $6 OFFSET $7;
```

Or build the ORDER BY clause in app code (whitelist sort columns!) — Postgres can't pick a column dynamically without `CASE`/`format()`.

### 5.2 Total count for footer

```sql
SELECT count(*)::int FROM film f
JOIN film_category fc ON fc.film_id = f.film_id
WHERE ($1::text IS NULL OR f.title ILIKE '%' || $1 || '%')
  AND ($2::int IS NULL OR fc.category_id = $2)
  AND ($3::text IS NULL OR f.rating = $3::mpaa_rating);
```

### 5.3 Inline-edit mutations

**Update rate:**
```sql
UPDATE film
SET rental_rate = $2, last_update = now()
WHERE film_id = $1
RETURNING film_id;
```

**Update category** (delete + insert because `film_category` PK is `film_id`):
```sql
DELETE FROM film_category WHERE film_id = $1;
INSERT INTO film_category (film_id, category_id, last_update) VALUES ($1, $2, now());
```

Wrap in a transaction.

### 5.4 Bulk actions

**Bulk set category:**
```sql
WITH del AS (DELETE FROM film_category WHERE film_id = ANY($1::int[]))
INSERT INTO film_category (film_id, category_id, last_update)
SELECT unnest($1::int[]), $2, now();
```

**Bulk archive** — Pagila has no `archived_at` column. Add one:
```sql
ALTER TABLE film ADD COLUMN archived_at timestamptz NULL;
```
Then:
```sql
UPDATE film SET archived_at = now(), last_update = now()
WHERE film_id = ANY($1::int[]);
```
Filter archived films out of every list query (`AND archived_at IS NULL`).

**Bulk duplicate:** Copy the row + its `film_category` + `film_actor` rows. Use a transaction with `RETURNING film_id` from the first insert to fan out.

---

## 6. Per-row demand sparkline (films list)

12 day-buckets per film. Run once for the whole page:

```sql
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
LEFT JOIN rental r ON r.inventory_id = i.inventory_id AND r.rental_date::date = d.day
GROUP BY fi.film_id, d.day
ORDER BY fi.film_id, d.day;
```

In the app, group by `film_id` → `[counts...]`.

---

## 7. Film detail (drawer + edit page)

### 7.1 Single film + joined fields

```sql
SELECT
  f.film_id          AS id,
  f.title,
  f.description      AS desc,
  f.release_year     AS year,
  f.rental_duration  AS duration_days,
  f.rental_rate      AS rate,
  f.length,
  f.replacement_cost AS replace,
  f.rating::text     AS rating,
  f.last_update      AS updated,
  f.special_features AS features,
  cat.name           AS category,
  cat.category_id    AS category_id,
  lang.name          AS lang,
  lang.language_id   AS language_id,
  ol.name            AS original_lang,
  ol.language_id     AS original_language_id
FROM film f
JOIN film_category fc ON fc.film_id = f.film_id
JOIN category cat     ON cat.category_id = fc.category_id
JOIN language lang    ON lang.language_id = f.language_id
LEFT JOIN language ol ON ol.language_id = f.original_language_id
WHERE f.film_id = $1;
```

### 7.2 Inventory per store (for the drawer's inventory table)

```sql
SELECT s.store_id,
       count(i.inventory_id)::int AS units,
       count(r.rental_id) FILTER (WHERE r.return_date IS NULL)::int AS out
FROM store s
LEFT JOIN inventory i ON i.store_id = s.store_id AND i.film_id = $1
LEFT JOIN rental r ON r.inventory_id = i.inventory_id
GROUP BY s.store_id
ORDER BY s.store_id;
```

### 7.3 Cast list

```sql
SELECT a.actor_id, a.first_name, a.last_name
FROM film_actor fa
JOIN actor a ON a.actor_id = fa.actor_id
WHERE fa.film_id = $1
ORDER BY a.last_name, a.first_name;
```

### 7.4 30-day rental count + delta + sparkline (for the rental-performance card)

```sql
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
SELECT cur.n AS cur_30d,
       prev.n AS prev_30d,
       CASE WHEN prev.n = 0 THEN NULL
            ELSE round(((cur.n - prev.n)::numeric / prev.n) * 100, 0)
       END AS delta_pct
FROM cur, prev;
```

---

## 8. Film edit form — mutations

### 8.1 Atomic film update

```sql
UPDATE film
SET title             = $2,
    description       = $3,
    release_year      = $4,
    language_id       = $5,
    original_language_id = $6,
    rental_duration   = $7,
    rental_rate       = $8,
    length            = $9,
    replacement_cost  = $10,
    rating            = $11::mpaa_rating,
    special_features  = $12::text[],
    last_update       = now()
WHERE film_id = $1
RETURNING film_id;
```

### 8.2 Category change

See §5.3.

### 8.3 Cast diff

Read current `film_actor` rows, diff against the form's actor_id list, then:
```sql
DELETE FROM film_actor WHERE film_id = $1 AND actor_id = ANY($2::int[]);
INSERT INTO film_actor (actor_id, film_id, last_update)
SELECT unnest($2::int[]), $1, now();
```
Wrap in a transaction.

---

## 9. Stores & Staff

### 9.1 Stores with manager + address

```sql
SELECT
  st.store_id              AS id,
  a.address                AS address,
  c.city                   AS city,
  co.country               AS country,
  a.phone                  AS phone,
  mgr.first_name || ' ' || mgr.last_name AS manager,
  mgr.email                AS manager_email,
  mgr.staff_id             AS manager_id
FROM store st
JOIN address a   ON a.address_id = st.address_id
JOIN city c      ON c.city_id = a.city_id
JOIN country co  ON co.country_id = c.country_id
JOIN staff mgr   ON mgr.staff_id = st.manager_staff_id
ORDER BY st.store_id;
```

### 9.2 Per-store rollups for the stat strip

```sql
SELECT
  st.store_id,
  (SELECT count(*) FROM inventory i WHERE i.store_id = st.store_id)::int AS inventory,
  (SELECT count(*) FROM rental r
    JOIN inventory i ON i.inventory_id = r.inventory_id
   WHERE i.store_id = st.store_id AND r.return_date IS NULL)::int AS active_rentals,
  (SELECT count(*) FROM staff s WHERE s.store_id = st.store_id AND s.active)::int AS staff
FROM store st
ORDER BY st.store_id;
```

### 9.3 Staff list

```sql
SELECT
  s.staff_id   AS id,
  s.first_name || ' ' || s.last_name AS name,
  s.username,
  s.email,
  s.store_id   AS store,
  CASE WHEN s.staff_id IN (SELECT manager_staff_id FROM store)
       THEN 'Manager' ELSE 'Clerk' END AS role,
  s.active,
  s.last_update AS started,
  (SELECT count(*) FROM rental r
     WHERE r.staff_id = s.staff_id
       AND r.rental_date >= date_trunc('month', current_date))::int AS rentals_mtd
FROM staff s
WHERE ($1::int IS NULL OR s.store_id = $1)
ORDER BY s.store_id, role DESC, s.last_name;
```

`last_active` (the "just now / 4m ago" column) isn't in Pagila. Either:
- Use `max(rental.rental_date)` per staff as a proxy.
- Add a `staff.last_seen_at timestamptz` column and `UPDATE` it on auth.

---

## 10. Reference: enums & constraints

- `mpaa_rating` is a Postgres enum: `'G' | 'PG' | 'PG-13' | 'R' | 'NC-17'`. Cast text inputs explicitly.
- `special_features` is `text[]` with check-constrained values: `Trailers`, `Commentaries`, `Deleted Scenes`, `Behind the Scenes`.
- `film.rental_rate` is `numeric(4,2)`, `replacement_cost` is `numeric(5,2)` — both come back as JS strings from `pg` by default. Either parse to `Number` on the way out or configure `pg.types.setTypeParser(1700, parseFloat)` once at boot.

---

## 11. Sample driver code

```ts
// src/lib/queries/films.ts
import { pool } from '@/lib/db';

const SORT_COLUMNS = {
  id: 'f.film_id', title: 'f.title', rate: 'f.rental_rate',
  length: 'f.length', updated: 'f.last_update',
} as const;

export async function listFilms(opts: {
  search?: string; categoryId?: number; rating?: string;
  sort?: keyof typeof SORT_COLUMNS; dir?: 'asc'|'desc';
  page?: number; pageSize?: number;
}) {
  const sortCol = SORT_COLUMNS[opts.sort ?? 'updated'];
  const dir = opts.dir === 'asc' ? 'ASC' : 'DESC';
  const sql = `
    SELECT … (as in §5.1, but with ORDER BY ${sortCol} ${dir} hard-coded after whitelist) …
    LIMIT $4 OFFSET $5
  `;
  const { rows } = await pool.query(sql, [
    opts.search ?? null,
    opts.categoryId ?? null,
    opts.rating ?? null,
    opts.pageSize ?? 25,
    ((opts.page ?? 1) - 1) * (opts.pageSize ?? 25),
  ]);
  return rows;
}
```
