import { getPool, query } from "@/lib/db";

export type StoreLite = {
  id: number;
  city: string;
  name: string | null;
};

/**
 * Lightweight stores-for-picker query. Returns `{ id, city, name }` for every
 * store. Used by the "Add stock" modal — heavy `listStores()` rollups
 * aren't needed there.
 */
export async function listStoresLite(): Promise<StoreLite[]> {
  const sql = `
    SELECT s.store_id AS id,
           c.city     AS city,
           s.name     AS name
      FROM store s
      JOIN address a ON a.address_id = s.address_id
      JOIN city c    ON c.city_id    = a.city_id
     ORDER BY s.store_id
  `;
  const { rows } = await query<StoreLite>(sql);
  return rows;
}

export type AddInventoryItem = {
  storeId: number;
  units: number;
};

/**
 * Bulk-inserts physical inventory rows for a film across one or more
 * stores in a single transaction. The `inventory` table stores one row
 * per physical copy, so adding N units = inserting N rows.
 *
 * Returns the total number of rows actually inserted.
 *
 * The caller is expected to have filtered `items` down to entries with
 * `units >= 1` and valid `storeId`s — this function trusts its input.
 */
export async function addFilmInventory(
  filmId: number,
  items: AddInventoryItem[],
): Promise<number> {
  if (items.length === 0) return 0;

  const storeIds = items.map((it) => it.storeId);
  const units = items.map((it) => it.units);
  const expected = units.reduce((a, b) => a + b, 0);

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    // unnest unpacks two parallel arrays into (store_id, units) pairs;
    // generate_series expands each pair into `units` rows. One round-trip,
    // one statement — atomic.
    const result = await client.query(
      `
      INSERT INTO inventory (film_id, store_id, last_update)
      SELECT $1, t.store_id, now()
        FROM unnest($2::int[], $3::int[]) AS t(store_id, units)
        CROSS JOIN LATERAL generate_series(1, t.units) g
      `,
      [filmId, storeIds, units],
    );

    // Bump the film's last_update so list views reflect the change.
    await client.query(
      `UPDATE film SET last_update = now() WHERE film_id = $1`,
      [filmId],
    );

    await client.query("COMMIT");
    return result.rowCount ?? expected;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
