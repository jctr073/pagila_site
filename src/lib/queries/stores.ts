import { getPool, query } from "@/lib/db";
import type {
  CustomerSummary,
  StaffRow,
  StoreDetail,
  StoreEditPatch,
  StoreListRow,
  StoreRow,
} from "@/lib/types";
import { countryCodeFor } from "@/lib/countryCodes";

type StoreRowSql = {
  id: number;
  name: string | null;
  address: string;
  city: string;
  country: string;
  phone: string;
  manager: string;
  manager_email: string;
  manager_id: number;
  inventory: number;
  active_rentals: number;
  staff: number;
};

/**
 * `listStores` merges §9.1 (stores + manager + address) with §9.2 (per-store
 * rollups) into a single CTE — both queries scan the same `store` rows and
 * the dashboard always wants them together, so one round-trip beats two.
 */
export async function listStores(): Promise<StoreRow[]> {
  const sql = `
    WITH base AS (
      SELECT
        st.store_id              AS id,
        st.name                  AS name,
        a.address                AS address,
        c.city                   AS city,
        co.country               AS country,
        a.phone                  AS phone,
        (mgr.first_name || ' ' || mgr.last_name) AS manager,
        mgr.email                AS manager_email,
        mgr.staff_id             AS manager_id
      FROM store st
      JOIN address a   ON a.address_id = st.address_id
      JOIN city c      ON c.city_id = a.city_id
      JOIN country co  ON co.country_id = c.country_id
      JOIN staff mgr   ON mgr.staff_id = st.manager_staff_id
    )
    SELECT
      b.id, b.name, b.address, b.city, b.country, b.phone,
      b.manager, b.manager_email, b.manager_id,
      (SELECT count(*) FROM inventory i WHERE i.store_id = b.id)::int AS inventory,
      (SELECT count(*) FROM rental r
         JOIN inventory i ON i.inventory_id = r.inventory_id
        WHERE i.store_id = b.id
          AND r.return_date IS NULL)::int AS active_rentals,
      (SELECT count(*) FROM staff s
        WHERE s.store_id = b.id AND s.active)::int AS staff
    FROM base b
    ORDER BY b.id
  `;
  const { rows } = await query<StoreRowSql>(sql);
  return rows.map((r) => ({
    id: r.id,
    name: r.name ?? null,
    address: r.address,
    city: r.city,
    country: r.country,
    phone: r.phone,
    manager: r.manager,
    managerEmail: r.manager_email,
    managerId: r.manager_id,
    inventory: r.inventory,
    activeRentals: r.active_rentals,
    staff: r.staff,
  }));
}

type StaffRowSql = {
  id: number;
  name: string;
  username: string;
  email: string;
  store: number;
  role: "Manager" | "Clerk";
  active: boolean;
  started: Date;
  rentals_mtd: number;
};

export async function listStaff(opts: { storeId?: number } = {}): Promise<
  StaffRow[]
> {
  const sql = `
    SELECT
      s.staff_id   AS id,
      (s.first_name || ' ' || s.last_name) AS name,
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
    ORDER BY s.store_id, role DESC, s.last_name
  `;
  const { rows } = await query<StaffRowSql>(sql, [opts.storeId ?? null]);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    username: r.username,
    email: r.email,
    store: r.store,
    role: r.role,
    active: r.active,
    started: r.started.toISOString(),
    rentalsMtd: r.rentals_mtd,
  }));
}

type StoreListRowSql = StoreRowSql & {
  address2: string | null;
  district: string;
  postal: string | null;
  customers: number;
};

/**
 * Richer variant of `listStores` for the /stores table — adds
 * address2 / district / postal_code, a per-store customer count, and a
 * JS-derived ISO country code. Kept separate from `listStores()` so the
 * Phase 9 callers and their integration tests stay untouched.
 *
 * Sorting happens in SQL with a whitelisted column to avoid string
 * concatenation.
 */
const STORE_SORT_COLUMNS: Record<string, string> = {
  id: "b.id",
  city: "b.city",
  country: "b.country",
  address: "b.address",
  inventory: "inventory",
  customers: "customers",
  staff: "staff",
};

export type StoreSortKey = keyof typeof STORE_SORT_COLUMNS;
export type StoreSortDir = "asc" | "desc";

export async function listStoresForTable(
  opts: { sort?: StoreSortKey; dir?: StoreSortDir } = {},
): Promise<StoreListRow[]> {
  const sortCol = STORE_SORT_COLUMNS[opts.sort ?? "id"] ?? "b.id";
  const dir: "ASC" | "DESC" = opts.dir === "desc" ? "DESC" : "ASC";

  const sql = `
    WITH base AS (
      SELECT
        st.store_id              AS id,
        st.name                  AS name,
        a.address                AS address,
        a.address2               AS address2,
        a.district               AS district,
        a.postal_code            AS postal,
        a.phone                  AS phone,
        c.city                   AS city,
        co.country               AS country,
        (mgr.first_name || ' ' || mgr.last_name) AS manager,
        mgr.email                AS manager_email,
        mgr.staff_id             AS manager_id
      FROM store st
      JOIN address a   ON a.address_id = st.address_id
      JOIN city c      ON c.city_id = a.city_id
      JOIN country co  ON co.country_id = c.country_id
      JOIN staff mgr   ON mgr.staff_id = st.manager_staff_id
    )
    SELECT
      b.id, b.name, b.address, b.address2, b.district, b.postal, b.phone,
      b.city, b.country,
      b.manager, b.manager_email, b.manager_id,
      (SELECT count(*) FROM inventory i WHERE i.store_id = b.id)::int AS inventory,
      (SELECT count(*) FROM rental r
         JOIN inventory i ON i.inventory_id = r.inventory_id
        WHERE i.store_id = b.id
          AND r.return_date IS NULL)::int AS active_rentals,
      (SELECT count(*) FROM staff s
        WHERE s.store_id = b.id AND s.active)::int AS staff,
      (SELECT count(*) FROM customer cu WHERE cu.store_id = b.id)::int AS customers
    FROM base b
    ORDER BY ${sortCol} ${dir}, b.id ASC
  `;
  const { rows } = await query<StoreListRowSql>(sql);
  return rows.map(toListRow);
}

function toListRow(r: StoreListRowSql): StoreListRow {
  return {
    id: r.id,
    name: r.name ?? null,
    address: r.address,
    address2: r.address2 ?? null,
    district: r.district,
    postal: r.postal ?? null,
    city: r.city,
    country: r.country,
    countryCode: countryCodeFor(r.country),
    phone: r.phone,
    manager: r.manager,
    managerEmail: r.manager_email,
    managerId: r.manager_id,
    inventory: r.inventory,
    activeRentals: r.active_rentals,
    staff: r.staff,
    customers: r.customers,
  };
}

type StoreDetailSql = StoreListRowSql & {
  opened: Date | null;
  rentals_7d: number;
};

/**
 * Single-store payload for the drawer. The `opened` and `rentals7d`
 * fields come from `store.last_update` and a 7-day rental count — the
 * latter feeds the drawer's sparkline summary.
 */
export async function getStoreDetail(
  storeId: number,
): Promise<StoreDetail | null> {
  const sql = `
    WITH base AS (
      SELECT
        st.store_id              AS id,
        st.name                  AS name,
        st.last_update           AS opened,
        a.address                AS address,
        a.address2               AS address2,
        a.district               AS district,
        a.postal_code            AS postal,
        a.phone                  AS phone,
        c.city                   AS city,
        co.country               AS country,
        (mgr.first_name || ' ' || mgr.last_name) AS manager,
        mgr.email                AS manager_email,
        mgr.staff_id             AS manager_id
      FROM store st
      JOIN address a   ON a.address_id = st.address_id
      JOIN city c      ON c.city_id = a.city_id
      JOIN country co  ON co.country_id = c.country_id
      JOIN staff mgr   ON mgr.staff_id = st.manager_staff_id
      WHERE st.store_id = $1
    )
    SELECT
      b.id, b.name, b.opened,
      b.address, b.address2, b.district, b.postal, b.phone,
      b.city, b.country,
      b.manager, b.manager_email, b.manager_id,
      (SELECT count(*) FROM inventory i WHERE i.store_id = b.id)::int AS inventory,
      (SELECT count(*) FROM rental r
         JOIN inventory i ON i.inventory_id = r.inventory_id
        WHERE i.store_id = b.id
          AND r.return_date IS NULL)::int AS active_rentals,
      (SELECT count(*) FROM staff s
        WHERE s.store_id = b.id AND s.active)::int AS staff,
      (SELECT count(*) FROM customer cu WHERE cu.store_id = b.id)::int AS customers,
      (SELECT count(*) FROM rental r
         JOIN inventory i ON i.inventory_id = r.inventory_id
        WHERE i.store_id = b.id
          AND r.rental_date >= now() - interval '7 days')::int AS rentals_7d
    FROM base b
  `;
  const { rows } = await query<StoreDetailSql>(sql, [storeId]);
  const r = rows[0];
  if (!r) return null;
  return {
    ...toListRow(r),
    opened: (r.opened ?? new Date()).toISOString().slice(0, 10),
    rentals7d: r.rentals_7d,
  };
}

type CustomerSummarySql = {
  id: number;
  name: string;
  email: string | null;
  active: boolean;
  rentals: number;
  last_rented: Date | null;
};

/**
 * Per-store customer list for the drawer. Ordered by most-recent rental
 * date so the drawer leads with currently-active patrons; falls back to
 * `customer.create_date` for customers who have never rented.
 */
export async function listCustomersByStore(
  storeId: number,
  limit = 6,
  offset = 0,
): Promise<CustomerSummary[]> {
  const sql = `
    SELECT
      cu.customer_id                              AS id,
      (cu.first_name || ' ' || cu.last_name)      AS name,
      cu.email                                    AS email,
      cu.activebool                               AS active,
      (SELECT count(*) FROM rental r WHERE r.customer_id = cu.customer_id)::int AS rentals,
      (SELECT max(r.rental_date) FROM rental r WHERE r.customer_id = cu.customer_id) AS last_rented
    FROM customer cu
    WHERE cu.store_id = $1
    ORDER BY last_rented DESC NULLS LAST, cu.customer_id ASC
    LIMIT $2 OFFSET $3
  `;
  const { rows } = await query<CustomerSummarySql>(sql, [storeId, limit, offset]);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    active: r.active,
    rentals: r.rentals,
    lastRented: r.last_rented ? r.last_rented.toISOString() : null,
  }));
}

/**
 * Atomic store-edit write. Updates `store.name` and the joined `address`
 * row in one transaction so a partial failure can't leave the two tables
 * out of sync. COALESCE on each column lets the caller pass a sparse
 * patch; explicit "touch" flags handle nullable columns (name, address2,
 * postal_code) since COALESCE-NULL means "leave it".
 */
export async function updateStore(
  id: number,
  patch: StoreEditPatch,
): Promise<void> {
  if (!Number.isFinite(id) || id < 0) throw new Error("invalid id");

  const touchName = Object.prototype.hasOwnProperty.call(patch, "name");
  const touchAddress2 = Object.prototype.hasOwnProperty.call(patch, "address2");
  const touchPostal = Object.prototype.hasOwnProperty.call(patch, "postal");

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    if (touchName) {
      await client.query(
        `UPDATE store
            SET name = $2,
                last_update = now()
          WHERE store_id = $1`,
        [id, patch.name ?? null],
      );
    }

    // Only touch the address row if at least one address column moved.
    const touchesAddress =
      patch.address !== undefined ||
      touchAddress2 ||
      patch.district !== undefined ||
      touchPostal ||
      patch.phone !== undefined ||
      patch.cityId !== undefined;

    if (touchesAddress) {
      await client.query(
        `UPDATE address a
            SET address     = COALESCE($2, a.address),
                address2    = CASE WHEN $8::boolean THEN $3 ELSE a.address2 END,
                district    = COALESCE($4, a.district),
                postal_code = CASE WHEN $9::boolean THEN $5 ELSE a.postal_code END,
                phone       = COALESCE($6, a.phone),
                city_id     = COALESCE($7, a.city_id),
                last_update = now()
           FROM store s
          WHERE s.store_id = $1
            AND a.address_id = s.address_id`,
        [
          id,
          patch.address ?? null,
          patch.address2 ?? null,
          patch.district ?? null,
          patch.postal ?? null,
          patch.phone ?? null,
          patch.cityId ?? null,
          touchAddress2,
          touchPostal,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Seven-bucket array of rentals per day (oldest first) for the store
 * drawer's mini-sparkline. Uses `generate_series` so days with zero
 * rentals still appear as 0 rather than being dropped.
 */
export async function getStoreRentalSparkline(
  storeId: number,
): Promise<number[]> {
  const sql = `
    WITH days AS (
      SELECT generate_series(
        date_trunc('day', now()) - interval '6 days',
        date_trunc('day', now()),
        interval '1 day'
      ) AS day
    )
    SELECT
      d.day,
      (SELECT count(*) FROM rental r
         JOIN inventory i ON i.inventory_id = r.inventory_id
        WHERE i.store_id = $1
          AND r.rental_date >= d.day
          AND r.rental_date <  d.day + interval '1 day')::int AS rentals
    FROM days d
    ORDER BY d.day ASC
  `;
  const { rows } = await query<{ day: Date; rentals: number }>(sql, [storeId]);
  return rows.map((r) => r.rentals);
}
