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

export type CityLookupRow = {
  id: number;
  city: string;
  country: string;
  countryId: number;
};

export async function listCities(): Promise<CityLookupRow[]> {
  const sql = `
    SELECT
      c.city_id     AS id,
      c.city        AS city,
      co.country    AS country,
      co.country_id AS country_id
    FROM city c
    JOIN country co ON co.country_id = c.country_id
    ORDER BY co.country, c.city
  `;
  const { rows } = await query<{
    id: number;
    city: string;
    country: string;
    country_id: number;
  }>(sql);
  return rows.map((r) => ({
    id: r.id,
    city: r.city,
    country: r.country,
    countryId: r.country_id,
  }));
}
