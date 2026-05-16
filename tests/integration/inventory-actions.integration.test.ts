/**
 * Integration tests for the inventory server actions.
 *
 * The setup at `src/test/integration.setup.ts` truncates all tables with
 * RESTART IDENTITY CASCADE before each test, so each test starts from an
 * empty database and seeds whatever fixtures it needs.
 *
 * `revalidatePath` from `next/cache` is mocked because we're running
 * outside a Next.js request context — the action only cares that it
 * gets called, not what it does.
 */

import { describe, expect, it, vi } from "vitest";

import { addFilmInventory } from "@/lib/actions/inventory";
import { query } from "@/lib/db";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("addFilmInventory action", () => {
  it("inserts rows for every selected store, including a store whose id is 0", async () => {
    await seedMinimalCatalog();

    // The user's dev DB contains a store with store_id = 0 (visible in the
    // picker as "Store #0"). When they submitted 5 units for store 0 + 5
    // units for store 10, only store 10 ended up with rows — store 0 was
    // silently dropped. Replicate that scenario here.
    //
    // store.manager_staff_id has a UNIQUE constraint but no FK, so the
    // values just need to be distinct — they don't need matching staff.
    await query(`
      INSERT INTO public.store (store_id, manager_staff_id, address_id)
      VALUES (0, 100, 1), (10, 101, 1)
    `);

    const result = await addFilmInventory(1, [
      { storeId: 0, units: 5 },
      { storeId: 10, units: 5 },
    ]);

    expect(result).toEqual({ ok: true, added: 10 });

    const { rows } = await query<{ store_id: number; n: number }>(`
      SELECT store_id, count(*)::int AS n
      FROM public.inventory
      WHERE film_id = 1 AND store_id IN (0, 10)
      GROUP BY store_id
      ORDER BY store_id
    `);

    expect(rows).toEqual([
      { store_id: 0, n: 5 },
      { store_id: 10, n: 5 },
    ]);
  });
});

/**
 * Minimal seed: one language, one country/city/address, one staff (so
 * the store FK resolves), and one film. Tests that need stores or
 * inventory rows insert them inline so the fixture stays obvious.
 */
async function seedMinimalCatalog() {
  // The action only needs film + store rows to satisfy `inventory`'s
  // foreign keys — no staff/customer needed. store.manager_staff_id has
  // no FK to staff, so it can hold arbitrary integers.
  await query(`
    INSERT INTO public.language (language_id, name) VALUES (1, 'English');

    INSERT INTO public.country (country_id, country) VALUES (1, 'Canada');
    INSERT INTO public.city (city_id, city, country_id) VALUES (1, 'Toronto', 1);
    INSERT INTO public.address (address_id, address, district, city_id, postal_code, phone)
    VALUES (1, '100 King St', 'Ontario', 1, 'M5V', '111-1111');

    INSERT INTO public.film (
      film_id, title, description, release_year, language_id,
      original_language_id, rental_duration, rental_rate, length,
      replacement_cost, rating, last_update, special_features
    ) VALUES (
      1, 'TEST FILM', 'A test', 2024, 1, NULL, 3, 2.99, 90, 14.99,
      'PG', '2024-01-01 09:00:00+00', NULL
    );
  `);
}
