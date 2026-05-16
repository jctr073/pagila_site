import { query } from "@/lib/db";
import type { StaffRow, StoreRow } from "@/lib/types";

type StoreRowSql = {
  id: number;
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
      b.id, b.address, b.city, b.country, b.phone,
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
