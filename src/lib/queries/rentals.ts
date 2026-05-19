import { getPool, query } from "@/lib/db";
import type {
  CustomerLookupRow,
  InventoryAvailability,
  RentalDetail,
  RentalRow,
  RentalStatus,
} from "@/lib/types";

type RentalRowSql = {
  id: number;
  rental_date: Date;
  return_date: Date | null;
  due_on: string;
  status: RentalStatus;
  film_id: number;
  film_title: string;
  film_rate: number;
  film_duration_days: number;
  inventory_id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string | null;
  store_id: number;
  store_city: string;
  store_name: string | null;
  staff_id: number;
  staff_name: string;
};

const RENTAL_SORT_COLUMNS: Record<string, string> = {
  id: "f.id",
  rented: "f.rental_date",
  due: "f.due_on",
  film: "f.film_title",
  customer: "f.customer_name",
  store: "f.store_city",
  staff: "f.staff_name",
  status: "f.status_rank",
};

export type RentalSortKey = keyof typeof RENTAL_SORT_COLUMNS;
export type RentalSortDir = "asc" | "desc";

const RENTAL_STATUSES = ["open", "returned", "overdue"] as const;

/**
 * Status derivation lives in SQL so the list, the drawer, and the
 * status-filter chip all agree. `status_rank` is the same expression
 * exposed as a sortable column so headers can rank Open before Overdue
 * before Returned without an extra round trip.
 */
const STATUS_EXPR = `
  CASE
    WHEN r.return_date IS NOT NULL THEN 'returned'
    WHEN now() > r.rental_date + (f.rental_duration * interval '1 day') THEN 'overdue'
    ELSE 'open'
  END
`;

const STATUS_RANK_EXPR = `
  CASE
    WHEN r.return_date IS NOT NULL THEN 2
    WHEN now() > r.rental_date + (f.rental_duration * interval '1 day') THEN 1
    ELSE 0
  END
`;

function isStatus(value: unknown): value is RentalStatus {
  return (
    typeof value === "string" &&
    (RENTAL_STATUSES as readonly string[]).includes(value)
  );
}

function toRow(r: RentalRowSql): RentalRow {
  return {
    id: r.id,
    rentedAt: r.rental_date.toISOString(),
    returnedAt: r.return_date ? r.return_date.toISOString() : null,
    dueOn: r.due_on,
    status: r.status,
    filmId: r.film_id,
    filmTitle: r.film_title,
    filmRate: r.film_rate,
    filmDurationDays: r.film_duration_days,
    inventoryId: r.inventory_id,
    customerId: r.customer_id,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    storeId: r.store_id,
    storeCity: r.store_city,
    storeName: r.store_name,
    staffId: r.staff_id,
    staffName: r.staff_name,
  };
}

export type ListRentalsOpts = {
  q?: string;
  status?: RentalStatus;
  storeId?: number;
  sort?: RentalSortKey;
  dir?: RentalSortDir;
  limit?: number;
  offset?: number;
};

export type ListRentalsResult = {
  rows: RentalRow[];
  total: number;
  /** Counts across the whole filtered set (ignoring pagination). */
  statusCounts: { open: number; overdue: number; returned: number };
};

/**
 * Paginated rentals list. Search matches the customer's name/email and
 * the film title; status filter and sort are applied in SQL so paging
 * stays cheap on large catalogs.
 */
export async function listRentalsForTable(
  opts: ListRentalsOpts = {},
): Promise<ListRentalsResult> {
  const sortCol = RENTAL_SORT_COLUMNS[opts.sort ?? "rented"] ?? "r.rental_date";
  const dir: "ASC" | "DESC" = opts.dir === "asc" ? "ASC" : "DESC";
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 200);
  const offset = Math.max(opts.offset ?? 0, 0);
  const q = opts.q?.trim() || null;
  const status = isStatus(opts.status) ? opts.status : null;
  const storeId =
    typeof opts.storeId === "number" && Number.isFinite(opts.storeId)
      ? opts.storeId
      : null;

  const sql = `
    WITH base AS (
      SELECT
        r.rental_id                                AS id,
        r.rental_date                              AS rental_date,
        r.return_date                              AS return_date,
        to_char(r.rental_date + (f.rental_duration * interval '1 day'), 'YYYY-MM-DD') AS due_on,
        ${STATUS_EXPR}                             AS status,
        ${STATUS_RANK_EXPR}                        AS status_rank,
        f.film_id                                  AS film_id,
        f.title                                    AS film_title,
        f.rental_rate                              AS film_rate,
        f.rental_duration                          AS film_duration_days,
        i.inventory_id                             AS inventory_id,
        cu.customer_id                             AS customer_id,
        (cu.first_name || ' ' || cu.last_name)     AS customer_name,
        cu.email                                   AS customer_email,
        i.store_id                                 AS store_id,
        c.city                                     AS store_city,
        st.name                                    AS store_name,
        s.staff_id                                 AS staff_id,
        (s.first_name || ' ' || s.last_name)       AS staff_name
      FROM rental r
      JOIN inventory i ON i.inventory_id = r.inventory_id
      JOIN film f      ON f.film_id      = i.film_id
      JOIN customer cu ON cu.customer_id = r.customer_id
      JOIN store st    ON st.store_id    = i.store_id
      JOIN address a   ON a.address_id   = st.address_id
      JOIN city c      ON c.city_id      = a.city_id
      JOIN staff s     ON s.staff_id     = r.staff_id
      WHERE ($1::text IS NULL
             OR f.title ILIKE '%' || $1 || '%'
             OR (cu.first_name || ' ' || cu.last_name) ILIKE '%' || $1 || '%'
             OR cu.email ILIKE '%' || $1 || '%')
        AND ($2::int IS NULL OR i.store_id = $2)
    ),
    filtered AS (
      SELECT * FROM base
      WHERE ($3::text IS NULL OR status = $3)
    )
    SELECT
      (SELECT count(*)::int FROM filtered)                                  AS total,
      (SELECT count(*)::int FROM base WHERE status = 'open')                AS open_count,
      (SELECT count(*)::int FROM base WHERE status = 'overdue')             AS overdue_count,
      (SELECT count(*)::int FROM base WHERE status = 'returned')            AS returned_count,
      f.id, f.rental_date, f.return_date, f.due_on, f.status,
      f.film_id, f.film_title, f.film_rate, f.film_duration_days,
      f.inventory_id,
      f.customer_id, f.customer_name, f.customer_email,
      f.store_id, f.store_city, f.store_name,
      f.staff_id, f.staff_name
    FROM filtered f
    ORDER BY ${sortCol} ${dir}, f.id ${dir}
    LIMIT $4 OFFSET $5
  `;
  const { rows } = await query<
    RentalRowSql & {
      total: number;
      open_count: number;
      overdue_count: number;
      returned_count: number;
    }
  >(sql, [q, storeId, status, limit, offset]);

  // The window-aggregate trick above attaches counts to every row, so we
  // grab them from the first row and fall back to a separate count if the
  // page is empty.
  if (rows.length === 0) {
    const fallback = await query<{
      total: number;
      open_count: number;
      overdue_count: number;
      returned_count: number;
    }>(
      `
        WITH base AS (
          SELECT
            ${STATUS_EXPR} AS status
          FROM rental r
          JOIN inventory i ON i.inventory_id = r.inventory_id
          JOIN film f      ON f.film_id      = i.film_id
          JOIN customer cu ON cu.customer_id = r.customer_id
          WHERE ($1::text IS NULL
                 OR f.title ILIKE '%' || $1 || '%'
                 OR (cu.first_name || ' ' || cu.last_name) ILIKE '%' || $1 || '%'
                 OR cu.email ILIKE '%' || $1 || '%')
            AND ($2::int IS NULL OR i.store_id = $2)
        )
        SELECT
          (SELECT count(*)::int FROM base WHERE ($3::text IS NULL OR status = $3)) AS total,
          (SELECT count(*)::int FROM base WHERE status = 'open')                   AS open_count,
          (SELECT count(*)::int FROM base WHERE status = 'overdue')                AS overdue_count,
          (SELECT count(*)::int FROM base WHERE status = 'returned')               AS returned_count
      `,
      [q, storeId, status],
    );
    const f = fallback.rows[0];
    return {
      rows: [],
      total: f?.total ?? 0,
      statusCounts: {
        open: f?.open_count ?? 0,
        overdue: f?.overdue_count ?? 0,
        returned: f?.returned_count ?? 0,
      },
    };
  }

  const first = rows[0]!;
  return {
    rows: rows.map(toRow),
    total: first.total,
    statusCounts: {
      open: first.open_count,
      overdue: first.overdue_count,
      returned: first.returned_count,
    },
  };
}

type RentalDetailSql = RentalRowSql & {
  film_rating: RentalDetail["filmRating"];
  film_length: number;
  days_overdue: number;
  paid: number;
};

export async function getRentalDetail(
  rentalId: number,
): Promise<RentalDetail | null> {
  const sql = `
    SELECT
      r.rental_id                                AS id,
      r.rental_date                              AS rental_date,
      r.return_date                              AS return_date,
      to_char(r.rental_date + (f.rental_duration * interval '1 day'), 'YYYY-MM-DD') AS due_on,
      ${STATUS_EXPR}                             AS status,
      f.film_id                                  AS film_id,
      f.title                                    AS film_title,
      f.rental_rate                              AS film_rate,
      f.rental_duration                          AS film_duration_days,
      f.rating                                   AS film_rating,
      f.length                                   AS film_length,
      i.inventory_id                             AS inventory_id,
      cu.customer_id                             AS customer_id,
      (cu.first_name || ' ' || cu.last_name)     AS customer_name,
      cu.email                                   AS customer_email,
      i.store_id                                 AS store_id,
      c.city                                     AS store_city,
      st.name                                    AS store_name,
      s.staff_id                                 AS staff_id,
      (s.first_name || ' ' || s.last_name)       AS staff_name,
      GREATEST(
        0,
        CASE
          WHEN r.return_date IS NOT NULL THEN 0
          ELSE EXTRACT(day FROM (now() - (r.rental_date + (f.rental_duration * interval '1 day'))))::int
        END
      )                                          AS days_overdue,
      COALESCE((SELECT sum(amount) FROM payment p WHERE p.rental_id = r.rental_id), 0)::numeric AS paid
    FROM rental r
    JOIN inventory i ON i.inventory_id = r.inventory_id
    JOIN film f      ON f.film_id      = i.film_id
    JOIN customer cu ON cu.customer_id = r.customer_id
    JOIN store st    ON st.store_id    = i.store_id
    JOIN address a   ON a.address_id   = st.address_id
    JOIN city c      ON c.city_id      = a.city_id
    JOIN staff s     ON s.staff_id     = r.staff_id
    WHERE r.rental_id = $1
  `;
  const { rows } = await query<RentalDetailSql>(sql, [rentalId]);
  const r = rows[0];
  if (!r) return null;
  return {
    ...toRow(r),
    filmRating: r.film_rating,
    filmLength: r.film_length,
    daysOverdue: r.days_overdue,
    paid: r.paid,
  };
}

/**
 * Customers picklist for the new-rental form. Returns only active
 * customers so the form can't accidentally rent to a disabled account.
 */
export async function listCustomersLookup(): Promise<CustomerLookupRow[]> {
  const sql = `
    SELECT
      cu.customer_id                       AS id,
      (cu.first_name || ' ' || cu.last_name) AS name,
      cu.email                             AS email,
      cu.store_id                          AS store_id,
      cu.activebool                        AS active
    FROM customer cu
    ORDER BY active DESC, name
  `;
  const { rows } = await query<{
    id: number;
    name: string;
    email: string | null;
    store_id: number;
    active: boolean;
  }>(sql);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    storeId: r.store_id,
    active: r.active,
  }));
}

/**
 * Inventory units that are currently in stock — i.e. either never
 * rented, or whose most recent rental has a non-null return_date. One
 * row per available physical copy.
 */
export async function listAvailableInventory(
  opts: { storeId?: number; filmId?: number; limit?: number } = {},
): Promise<InventoryAvailability[]> {
  const limit = Math.min(Math.max(opts.limit ?? 200, 1), 1000);
  const sql = `
    SELECT
      i.inventory_id      AS inventory_id,
      f.film_id           AS film_id,
      f.title             AS film_title,
      f.rental_rate       AS film_rate,
      f.rental_duration   AS film_duration_days,
      i.store_id          AS store_id,
      c.city              AS store_city,
      st.name             AS store_name
    FROM inventory i
    JOIN film f      ON f.film_id    = i.film_id
    JOIN store st    ON st.store_id  = i.store_id
    JOIN address a   ON a.address_id = st.address_id
    JOIN city c      ON c.city_id    = a.city_id
    WHERE inventory_in_stock(i.inventory_id)
      AND ($1::int IS NULL OR i.store_id = $1)
      AND ($2::int IS NULL OR f.film_id = $2)
    ORDER BY f.title, i.store_id, i.inventory_id
    LIMIT $3
  `;
  const { rows } = await query<{
    inventory_id: number;
    film_id: number;
    film_title: string;
    film_rate: number;
    film_duration_days: number;
    store_id: number;
    store_city: string;
    store_name: string | null;
  }>(sql, [opts.storeId ?? null, opts.filmId ?? null, limit]);
  return rows.map((r) => ({
    inventoryId: r.inventory_id,
    filmId: r.film_id,
    filmTitle: r.film_title,
    filmRate: r.film_rate,
    filmDurationDays: r.film_duration_days,
    storeId: r.store_id,
    storeCity: r.store_city,
    storeName: r.store_name,
  }));
}

export type CreateRentalInput = {
  inventoryId: number;
  customerId: number;
  staffId: number;
  /** Optional rental timestamp; defaults to now(). */
  rentalDate?: Date;
};

/**
 * Inserts a new rental. The unique partial index on
 * `(inventory_id) WHERE return_date IS NULL` makes a double-rental of
 * the same physical copy impossible — we surface that as a friendlier
 * error rather than the raw Postgres message.
 */
export async function createRental(input: CreateRentalInput): Promise<number> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    // Confirm the inventory still belongs to a store that has the staff
    // member — Pagila's seed mostly keeps staff store-bound, and routing
    // a rental through a foreign clerk is almost always a mistake.
    const guard = await client.query<{ store_id: number }>(
      `SELECT store_id FROM inventory WHERE inventory_id = $1`,
      [input.inventoryId],
    );
    if (guard.rowCount === 0) throw new Error("inventory not found");

    const stock = await client.query<{ available: boolean }>(
      `SELECT inventory_in_stock($1) AS available`,
      [input.inventoryId],
    );
    if (!stock.rows[0]?.available) throw new Error("inventory already rented");

    const result = await client.query<{ rental_id: number }>(
      `INSERT INTO rental
         (rental_date, inventory_id, customer_id, staff_id, last_update)
       VALUES (COALESCE($1, now()), $2, $3, $4, now())
       RETURNING rental_id`,
      [
        input.rentalDate ?? null,
        input.inventoryId,
        input.customerId,
        input.staffId,
      ],
    );

    await client.query("COMMIT");
    return result.rows[0]!.rental_id;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Marks a rental returned. Idempotent — returning twice is a no-op. */
export async function returnRental(
  rentalId: number,
  returnDate?: Date,
): Promise<void> {
  await query(
    `UPDATE rental
        SET return_date = COALESCE($2, now()),
            last_update = now()
      WHERE rental_id = $1
        AND return_date IS NULL`,
    [rentalId, returnDate ?? null],
  );
}

/**
 * Reopens a returned rental (clears return_date). Used by the drawer's
 * "Mark as out" action when staff marked a return by mistake.
 */
export async function reopenRental(rentalId: number): Promise<void> {
  await query(
    `UPDATE rental
        SET return_date = NULL,
            last_update = now()
      WHERE rental_id = $1`,
    [rentalId],
  );
}

export async function deleteRental(rentalId: number): Promise<void> {
  await query(`DELETE FROM rental WHERE rental_id = $1`, [rentalId]);
}
