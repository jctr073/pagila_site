import { query } from "@/lib/db";

type LookupRow = { id: number; name: string };

export async function listCategories(): Promise<LookupRow[]> {
  const sql = `
    SELECT category_id AS id, name
    FROM category
    ORDER BY name
  `;
  const { rows } = await query<LookupRow>(sql);
  return rows;
}

export async function listLanguages(): Promise<LookupRow[]> {
  const sql = `
    SELECT language_id AS id, trim(name) AS name
    FROM language
    ORDER BY name
  `;
  const { rows } = await query<LookupRow>(sql);
  return rows;
}
