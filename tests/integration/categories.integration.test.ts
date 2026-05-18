/**
 * Integration tests for the categories query + action layers.
 *
 * Setup in `src/test/integration.setup.ts` truncates every table with
 * RESTART IDENTITY CASCADE before each test, so each `it` starts from
 * a known-empty DB.
 *
 * `next/cache` is mocked because actions call `revalidatePath` outside
 * a Next.js request context — we only need to assert it was invoked.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createCategory as createCategoryAction,
  deleteCategory as deleteCategoryAction,
  renameCategory as renameCategoryAction,
} from "@/lib/actions/categories";
import { query } from "@/lib/db";
import {
  createCategory,
  deleteCategoryCascade,
  listCategoriesForTable,
  renameCategory,
} from "@/lib/queries/categories";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from "next/cache";

const revalidatePathMock = vi.mocked(revalidatePath);

beforeEach(() => {
  revalidatePathMock.mockClear();
});

afterEach(() => {
  revalidatePathMock.mockReset();
});

describe("listCategoriesForTable", () => {
  it("returns id, name, filmCount, lastUpdate; includes categories with zero films", async () => {
    await seedCatalog();

    const rows = await listCategoriesForTable();

    // Default sort is name ASC with id tiebreaker.
    expect(rows.map((r) => r.name)).toEqual([
      "Action",
      "Comedy",
      "Documentary",
      "Drama",
    ]);

    const action = rows.find((r) => r.name === "Action")!;
    expect(action).toMatchObject({ id: 1, name: "Action", filmCount: 2 });
    expect(action.lastUpdate).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    // Documentary has no films — must still appear, with count 0.
    expect(rows.find((r) => r.name === "Documentary")).toMatchObject({
      filmCount: 0,
    });
  });

  it("sorts by id ascending and descending", async () => {
    await seedCatalog();

    const asc = await listCategoriesForTable({ sort: "id", dir: "asc" });
    expect(asc.map((r) => r.id)).toEqual([1, 2, 3, 4]);

    const desc = await listCategoriesForTable({ sort: "id", dir: "desc" });
    expect(desc.map((r) => r.id)).toEqual([4, 3, 2, 1]);
  });

  it("sorts by name descending", async () => {
    await seedCatalog();

    const rows = await listCategoriesForTable({ sort: "name", dir: "desc" });
    expect(rows.map((r) => r.name)).toEqual([
      "Drama",
      "Documentary",
      "Comedy",
      "Action",
    ]);
  });

  it("sorts by film count with id tiebreaker on ties", async () => {
    await seedCatalog();

    const desc = await listCategoriesForTable({ sort: "films", dir: "desc" });
    // Action=2, Comedy=1, Drama=1 (tie → id ASC), Documentary=0.
    expect(desc.map((r) => ({ id: r.id, filmCount: r.filmCount }))).toEqual([
      { id: 1, filmCount: 2 },
      { id: 2, filmCount: 1 },
      { id: 3, filmCount: 1 },
      { id: 4, filmCount: 0 },
    ]);

    const asc = await listCategoriesForTable({ sort: "films", dir: "asc" });
    expect(asc.map((r) => ({ id: r.id, filmCount: r.filmCount }))).toEqual([
      { id: 4, filmCount: 0 },
      { id: 2, filmCount: 1 },
      { id: 3, filmCount: 1 },
      { id: 1, filmCount: 2 },
    ]);
  });

  it("sorts by last_update descending", async () => {
    await seedCatalogWithStaggeredTimestamps();

    const rows = await listCategoriesForTable({
      sort: "updated",
      dir: "desc",
    });
    // Comedy(2024-03), Drama(2024-02), Action(2024-01).
    expect(rows.map((r) => r.name)).toEqual(["Comedy", "Drama", "Action"]);
  });

  it("falls back to default sort when given an unknown key", async () => {
    await seedCatalog();

    const rows = await listCategoriesForTable({
      sort: "bogus" as never,
      dir: "asc",
    });
    // Default sort is name ASC; unknown key shouldn't blow up.
    expect(rows.map((r) => r.name)).toEqual([
      "Action",
      "Comedy",
      "Documentary",
      "Drama",
    ]);
  });
});

describe("createCategory", () => {
  it("inserts a new category and returns its id", async () => {
    const id = await createCategory("Sci-Fi");

    expect(id).toBeGreaterThan(0);

    const { rows } = await query<{ name: string }>(
      `SELECT name FROM category WHERE category_id = $1`,
      [id],
    );
    expect(rows).toEqual([{ name: "Sci-Fi" }]);
  });

  it("trims surrounding whitespace before inserting", async () => {
    const id = await createCategory("   Noir   ");

    const { rows } = await query<{ name: string }>(
      `SELECT name FROM category WHERE category_id = $1`,
      [id],
    );
    expect(rows).toEqual([{ name: "Noir" }]);
  });

  it("rejects empty or whitespace-only names", async () => {
    await expect(createCategory("")).rejects.toThrow(/name is required/);
    await expect(createCategory("   ")).rejects.toThrow(/name is required/);
  });
});

describe("renameCategory", () => {
  it("updates the name and bumps last_update", async () => {
    await seedCatalog();

    const before = await fetchCategory(1);
    // Sleep 5ms so the new last_update is strictly after the original.
    await new Promise((r) => setTimeout(r, 5));

    await renameCategory(1, "Adventure");

    const after = await fetchCategory(1);
    expect(after.name).toBe("Adventure");
    expect(new Date(after.last_update).getTime()).toBeGreaterThan(
      new Date(before.last_update).getTime(),
    );
  });

  it("trims surrounding whitespace", async () => {
    await seedCatalog();

    await renameCategory(1, "   Spy   ");

    const after = await fetchCategory(1);
    expect(after.name).toBe("Spy");
  });

  it("rejects empty or whitespace-only names", async () => {
    await seedCatalog();

    await expect(renameCategory(1, "")).rejects.toThrow(/name is required/);
    await expect(renameCategory(1, "   ")).rejects.toThrow(/name is required/);

    // Original name survives.
    expect((await fetchCategory(1)).name).toBe("Action");
  });
});

describe("deleteCategoryCascade", () => {
  it("removes the category and unlinks its films", async () => {
    await seedCatalog();

    // Sanity: Action (id=1) has two film_category links before the delete.
    await expect(countFilmCategories(1)).resolves.toBe(2);

    await deleteCategoryCascade(1);

    // The category row is gone.
    const { rows: catRows } = await query(
      `SELECT 1 FROM category WHERE category_id = 1`,
    );
    expect(catRows).toEqual([]);

    // The film_category rows for it are gone too.
    await expect(countFilmCategories(1)).resolves.toBe(0);

    // The films themselves still exist — only the link was removed.
    const { rows: filmRows } = await query<{ count: number }>(
      `SELECT count(*)::int AS count FROM film WHERE film_id IN (1, 2)`,
    );
    expect(filmRows[0]?.count).toBe(2);
  });

  it("leaves other categories' film_category links untouched", async () => {
    await seedCatalog();

    // Comedy (id=2) has one link before the delete.
    await expect(countFilmCategories(2)).resolves.toBe(1);

    await deleteCategoryCascade(1);

    // Comedy's link is unaffected.
    await expect(countFilmCategories(2)).resolves.toBe(1);
  });

  it("is a no-op when the id does not exist", async () => {
    await seedCatalog();

    // No throw, no other tables disturbed.
    await deleteCategoryCascade(999);

    const { rows } = await query<{ count: number }>(
      `SELECT count(*)::int AS count FROM category`,
    );
    expect(rows[0]?.count).toBe(4);
  });
});

describe("server actions", () => {
  it("createCategory action inserts, returns the id, and revalidates both paths", async () => {
    const id = await createCategoryAction("Western");

    expect(id).toBeGreaterThan(0);
    expect(revalidatePathMock).toHaveBeenCalledWith("/categories");
    expect(revalidatePathMock).toHaveBeenCalledWith("/films");
  });

  it("renameCategory action validates id, validates name, and revalidates on success", async () => {
    await seedCatalog();

    await expect(renameCategoryAction(0, "X")).rejects.toThrow(/invalid id/);
    await expect(
      renameCategoryAction(1, "" as unknown as string),
    ).rejects.toThrow(/name is required/);
    // Validation failures do not call revalidatePath.
    expect(revalidatePathMock).not.toHaveBeenCalled();

    await renameCategoryAction(1, "Adventure");
    expect((await fetchCategory(1)).name).toBe("Adventure");
    expect(revalidatePathMock).toHaveBeenCalledWith("/categories");
    expect(revalidatePathMock).toHaveBeenCalledWith("/films");
  });

  it("deleteCategory action validates id, cascades the unlink, and revalidates", async () => {
    await seedCatalog();

    await expect(deleteCategoryAction(-1)).rejects.toThrow(/invalid id/);
    expect(revalidatePathMock).not.toHaveBeenCalled();

    await deleteCategoryAction(1);

    const { rows } = await query(
      `SELECT 1 FROM category WHERE category_id = 1`,
    );
    expect(rows).toEqual([]);
    await expect(countFilmCategories(1)).resolves.toBe(0);
    expect(revalidatePathMock).toHaveBeenCalledWith("/categories");
    expect(revalidatePathMock).toHaveBeenCalledWith("/films");
  });
});

// ── Fixtures ─────────────────────────────────────────────────────────

/**
 * Four categories, three films, four film_category links. Distribution:
 *   Action       (id 1) → 2 films (Alpha, Beta)
 *   Comedy       (id 2) → 1 film  (Gamma)
 *   Drama        (id 3) → 1 film  (Beta)
 *   Documentary  (id 4) → 0 films
 *
 * The Action/Drama overlap on Beta lets us prove the count comes from
 * `film_category` (not from a per-film primary category), and that
 * deleting Action only removes its links — Drama's link to Beta stays.
 */
async function seedCatalog() {
  await query(`
    INSERT INTO public.language (language_id, name) VALUES (1, 'English');

    INSERT INTO public.category (category_id, name) VALUES
      (1, 'Action'),
      (2, 'Comedy'),
      (3, 'Drama'),
      (4, 'Documentary');

    INSERT INTO public.film (
      film_id, title, description, release_year, language_id,
      original_language_id, rental_duration, rental_rate, length,
      replacement_cost, rating, last_update, special_features
    ) VALUES
      (1, 'ALPHA', 'a', 2006, 1, NULL, 3, 2.99, 90, 14.99, 'PG',
       '2024-01-02 03:04:05+00', NULL),
      (2, 'BETA', 'b', 2008, 1, NULL, 5, 4.99, 120, 20.99, 'R',
       '2024-01-03 03:04:05+00', NULL),
      (3, 'GAMMA', 'g', 2012, 1, NULL, 4, 1.99, 75, 12.99, 'PG-13',
       '2024-01-04 03:04:05+00', NULL);

    INSERT INTO public.film_category (film_id, category_id) VALUES
      (1, 1),
      (2, 1),
      (2, 3),
      (3, 2);
  `);
}

/**
 * Same shape as `seedCatalog`, but the `last_update` column is staggered
 * so a sort by `updated` is deterministic. Used by the timestamp sort
 * test; the regular catalog inserts use the DB default (`now()`) which
 * would otherwise produce identical timestamps within a single test.
 */
async function seedCatalogWithStaggeredTimestamps() {
  await query(`
    INSERT INTO public.category (category_id, name, last_update) VALUES
      (1, 'Action', '2024-01-15 10:00:00+00'),
      (2, 'Comedy', '2024-03-15 10:00:00+00'),
      (3, 'Drama',  '2024-02-15 10:00:00+00');
  `);
}

async function fetchCategory(id: number) {
  const { rows } = await query<{ name: string; last_update: Date }>(
    `SELECT name, last_update FROM category WHERE category_id = $1`,
    [id],
  );
  if (!rows[0]) throw new Error(`category ${id} not found`);
  return rows[0];
}

async function countFilmCategories(categoryId: number): Promise<number> {
  const { rows } = await query<{ count: number }>(
    `SELECT count(*)::int AS count FROM film_category WHERE category_id = $1`,
    [categoryId],
  );
  return rows[0]?.count ?? 0;
}
