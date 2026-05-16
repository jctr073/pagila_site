import { describe, expect, it } from "vitest";

import { query } from "@/lib/db";
import { listFilms } from "@/lib/queries/films";
import { listCategories } from "@/lib/queries/lookups";

describe("test database", () => {
  it("uses the isolated pagila_test database", async () => {
    const { rows } = await query<{ database_name: string }>(
      "SELECT current_database() AS database_name",
    );

    expect(rows[0]?.database_name).toBe("pagila_test");
  });

  it("loads the Pagila schema without copying dev data", async () => {
    const { rows } = await query<{
      film_table: string | null;
      rating_type: string | null;
      film_count: number;
    }>(`
      SELECT
        to_regclass('public.film')::text AS film_table,
        to_regtype('public.mpaa_rating')::text AS rating_type,
        (SELECT count(*)::int FROM public.film) AS film_count
    `);

    expect(rows[0]).toEqual({
      film_table: "film",
      rating_type: "mpaa_rating",
      film_count: 0,
    });
  });

  it("runs read queries against the empty test schema", async () => {
    await expect(listCategories()).resolves.toEqual([]);
    await expect(listFilms({ pageSize: 10 })).resolves.toEqual({
      rows: [],
      total: 0,
    });
  });
});
