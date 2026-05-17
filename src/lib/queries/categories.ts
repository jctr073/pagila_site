import { getPool, query } from "@/lib/db";
import type { CategoryListRow } from "@/lib/types";

const SORT_COLUMNS = {
  id: "c.category_id",
  name: "c.name",
  films: "film_count",
  updated: "c.last_update",
} as const;

export type CategoriesSortKey = keyof typeof SORT_COLUMNS;
export type CategoriesSortDir = "asc" | "desc";

const VALID_SORT = new Set<string>(Object.keys(SORT_COLUMNS));
const VALID_DIR = new Set<string>(["asc", "desc"]);

type CategoryRowSql = {
  id: number;
  name: string;
  film_count: number;
  last_update: Date;
};

export async function listCategoriesForTable(
  opts: { sort?: CategoriesSortKey; dir?: CategoriesSortDir } = {},
): Promise<CategoryListRow[]> {
  const sortKey: CategoriesSortKey =
    opts.sort && VALID_SORT.has(opts.sort) ? opts.sort : "name";
  const dir =
    opts.dir && VALID_DIR.has(opts.dir) ? opts.dir.toUpperCase() : "ASC";
  const sortCol = SORT_COLUMNS[sortKey];

  // Both `sortCol` and `dir` are pulled from the whitelists above — safe to
  // interpolate. Secondary sort by category_id keeps pagination stable when
  // the primary key has ties (e.g. two categories renamed to the same name).
  const sql = `
    SELECT
      c.category_id AS id,
      c.name        AS name,
      c.last_update AS last_update,
      (SELECT count(*) FROM film_category fc
        WHERE fc.category_id = c.category_id)::int AS film_count
    FROM category c
    ORDER BY ${sortCol} ${dir}, c.category_id ASC
  `;
  const { rows } = await query<CategoryRowSql>(sql);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    filmCount: r.film_count,
    lastUpdate: r.last_update.toISOString(),
  }));
}

export async function createCategory(name: string): Promise<number> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("name is required");
  const { rows } = await query<{ category_id: number }>(
    `INSERT INTO category (name) VALUES ($1) RETURNING category_id`,
    [trimmed],
  );
  return rows[0]!.category_id;
}

export async function renameCategory(id: number, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("name is required");
  await query(
    `UPDATE category SET name = $1, last_update = NOW() WHERE category_id = $2`,
    [trimmed, id],
  );
}

/**
 * Delete a category and unlink it from any films that reference it.
 * `film_category` is the only FK pointing at `category`, so a transactional
 * pair of DELETEs is enough — no separate trigger work required.
 */
export async function deleteCategoryCascade(id: number): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM film_category WHERE category_id = $1`, [id]);
    await client.query(`DELETE FROM category WHERE category_id = $1`, [id]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
