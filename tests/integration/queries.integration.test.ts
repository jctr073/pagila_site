import { describe, expect, it } from "vitest";

import { query } from "@/lib/db";
import {
  getAvgRentalDuration,
  getKpis,
  getOverdueRentals,
  getPerStoreRentalAverages,
  getRecentActivity,
  getRentalsByDay,
  getTopFilms,
} from "@/lib/queries/dashboard";
import {
  bulkArchiveFilms,
  bulkSetCategory,
  getFilm,
  getFilm30dPerformance,
  getFilmCast,
  getFilmDemandSparklines,
  getFilmInventoryByStore,
  listFilms,
  updateFilm,
  updateFilmCategory,
  updateFilmRate,
} from "@/lib/queries/films";
import { listCategories, listLanguages } from "@/lib/queries/lookups";
import {
  getStoreDetail,
  getStoreRentalSparkline,
  listCustomersByStore,
  listStaff,
  listStores,
  listStoresForTable,
} from "@/lib/queries/stores";

describe("query integration", () => {
  it("lists lookup rows in display order", async () => {
    await seedBaseCatalog();

    await expect(listCategories()).resolves.toEqual([
      { id: 1, name: "Action" },
      { id: 2, name: "Comedy" },
      { id: 3, name: "Drama" },
    ]);

    await expect(listLanguages()).resolves.toEqual([
      { id: 1, name: "English" },
      { id: 2, name: "French" },
      { id: 3, name: "Spanish" },
    ]);
  });

  it("lists stores and staff with inventory, activity, and role rollups", async () => {
    await seedBaseCatalog();
    await insertRental({ id: 1, inventoryId: 1, rentedDaysAgo: 0, staffId: 1 });
    await insertRental({
      id: 2,
      inventoryId: 4,
      customerId: 2,
      rentedDaysAgo: 0,
      staffId: 2,
    });

    await expect(listStores()).resolves.toEqual([
      {
        id: 1,
        address: "100 King St",
        city: "Toronto",
        country: "Canada",
        phone: "111-1111",
        manager: "Ada Manager",
        managerEmail: "ada@example.com",
        managerId: 1,
        inventory: 2,
        activeRentals: 1,
        staff: 2,
      },
      {
        id: 2,
        address: "200 Pine St",
        city: "Seattle",
        country: "USA",
        phone: "222-2222",
        manager: "Bea Manager",
        managerEmail: "bea@example.com",
        managerId: 2,
        inventory: 2,
        activeRentals: 1,
        staff: 1,
      },
    ]);

    const staff = await listStaff();
    expect(
      staff.map(({ id, store, role, active, rentalsMtd }) => ({
        id,
        store,
        role,
        active,
        rentalsMtd,
      })),
    ).toEqual([
      { id: 1, store: 1, role: "Manager", active: true, rentalsMtd: 1 },
      { id: 3, store: 1, role: "Clerk", active: true, rentalsMtd: 0 },
      { id: 2, store: 2, role: "Manager", active: true, rentalsMtd: 1 },
      { id: 4, store: 2, role: "Clerk", active: false, rentalsMtd: 0 },
    ]);
    expect(staff[0]?.started).toBe("2024-01-01T09:00:00.000Z");

    await expect(listStaff({ storeId: 2 })).resolves.toEqual([
      expect.objectContaining({ id: 2, role: "Manager", store: 2 }),
      expect.objectContaining({ id: 4, role: "Clerk", store: 2 }),
    ]);
  });

  it("lists enriched stores for the table with sortable columns and per-store customer counts", async () => {
    await seedBaseCatalog();

    const byId = await listStoresForTable();
    expect(byId).toHaveLength(2);
    expect(byId[0]).toMatchObject({
      id: 1,
      address: "100 King St",
      address2: null,
      district: "Ontario",
      postal: "M5V",
      city: "Toronto",
      country: "Canada",
      countryCode: "CA",
      phone: "111-1111",
      manager: "Ada Manager",
      managerEmail: "ada@example.com",
      managerId: 1,
      inventory: 2,
      activeRentals: 0,
      staff: 2,
      customers: 1,
    });
    expect(byId[1]).toMatchObject({
      id: 2,
      city: "Seattle",
      country: "USA",
      // "USA" is not in the explicit country-code map; the helper falls
      // back to the first two letters uppercased.
      countryCode: "US",
      customers: 1,
    });

    const byCity = await listStoresForTable({ sort: "city", dir: "asc" });
    expect(byCity.map((s) => s.city)).toEqual(["Seattle", "Toronto"]);

    const byCustomersDesc = await listStoresForTable({
      sort: "customers",
      dir: "desc",
    });
    // Both stores have one customer; the tiebreaker is id ASC.
    expect(byCustomersDesc.map((s) => s.id)).toEqual([1, 2]);

    // Unknown sort keys must not blow up; they fall back to id but
    // still honor the requested direction.
    const fallback = await listStoresForTable({
      sort: "bogus" as never,
      dir: "desc",
    });
    expect(fallback.map((s) => s.id)).toEqual([2, 1]);
  });

  it("loads a single store with the 7-day rental count and an ISO opened date", async () => {
    await seedBaseCatalog();
    // Inventory 1 + 2 belong to store 1; inventory 3 + 4 belong to store 2.
    await insertRental({ id: 1, inventoryId: 1, rentedDaysAgo: 0, staffId: 1 });
    await insertRental({ id: 2, inventoryId: 2, rentedDaysAgo: 5, staffId: 1 });
    // Eight days ago — outside the 7-day window.
    await insertRental({ id: 3, inventoryId: 1, rentedDaysAgo: 8, staffId: 1 });
    // Belongs to store 2 — must not be counted toward store 1's rentals7d.
    await insertRental({
      id: 4,
      inventoryId: 3,
      customerId: 2,
      rentedDaysAgo: 1,
      staffId: 2,
    });

    await expect(getStoreDetail(999)).resolves.toBeNull();

    const store1 = await getStoreDetail(1);
    expect(store1).toMatchObject({
      id: 1,
      address: "100 King St",
      district: "Ontario",
      postal: "M5V",
      city: "Toronto",
      country: "Canada",
      countryCode: "CA",
      manager: "Ada Manager",
      inventory: 2,
      staff: 2,
      customers: 1,
      rentals7d: 2,
    });
    expect(store1?.opened).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("orders customers by most recent rental and respects the limit", async () => {
    await seedBaseCatalog();
    // Add three more customers at store 1 so we can exercise ordering + limit.
    await query(`
      INSERT INTO public.customer (
        customer_id,
        store_id,
        first_name,
        last_name,
        email,
        address_id,
        active
      )
      VALUES
        (3, 1, 'Pat',  'Recent',  'pat@example.com', 1, 1),
        (4, 1, 'Sam',  'NoRents', 'sam@example.com', 1, 1),
        (5, 1, 'Lee',  'Older',   'lee@example.com', 1, 1);
    `);
    // Inventory 1 is at store 1.
    await insertRental({
      id: 1,
      inventoryId: 1,
      customerId: 1,
      rentedDaysAgo: 5,
      staffId: 1,
    });
    await insertRental({
      id: 2,
      inventoryId: 1,
      customerId: 3,
      rentedDaysAgo: 1,
      staffId: 1,
    });
    await insertRental({
      id: 3,
      inventoryId: 1,
      customerId: 5,
      rentedDaysAgo: 10,
      staffId: 1,
    });

    const all = await listCustomersByStore(1);
    // Pat (1d) → Casey (5d) → Lee (10d) → Sam (no rentals, last by id ASC).
    expect(all.map((c) => c.id)).toEqual([3, 1, 5, 4]);
    expect(all.find((c) => c.id === 3)).toMatchObject({
      rentals: 1,
      active: true,
    });
    expect(all.find((c) => c.id === 4)).toMatchObject({
      rentals: 0,
      lastRented: null,
      active: true,
    });

    const limited = await listCustomersByStore(1, 2);
    expect(limited.map((c) => c.id)).toEqual([3, 1]);

    // Store 2 still has its single seeded customer with no rentals.
    await expect(listCustomersByStore(2)).resolves.toEqual([
      expect.objectContaining({ id: 2, rentals: 0, lastRented: null }),
    ]);
  });

  it("returns a 7-bucket rentals sparkline filling zero-rental days for the store", async () => {
    await seedBaseCatalog();
    // Two rentals today + one two days ago at store 1.
    await insertRental({ id: 1, inventoryId: 1, rentedDaysAgo: 0, staffId: 1 });
    await insertRental({ id: 2, inventoryId: 2, rentedDaysAgo: 0, staffId: 1 });
    await insertRental({ id: 3, inventoryId: 1, rentedDaysAgo: 2, staffId: 1 });
    // One rental yesterday at store 2 — must not leak into store 1.
    await insertRental({
      id: 4,
      inventoryId: 3,
      customerId: 2,
      rentedDaysAgo: 1,
      staffId: 2,
    });

    // Buckets are oldest-first: [6d, 5d, 4d, 3d, 2d, 1d, 0d].
    await expect(getStoreRentalSparkline(1)).resolves.toEqual([
      0, 0, 0, 0, 1, 0, 2,
    ]);
    await expect(getStoreRentalSparkline(2)).resolves.toEqual([
      0, 0, 0, 0, 0, 1, 0,
    ]);
    // A store with no rentals still produces 7 zero buckets.
    await expect(getStoreRentalSparkline(999)).resolves.toEqual([
      0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  it("lists films with counts, filters, sorting, and pagination", async () => {
    await seedBaseCatalog();

    const firstPage = await listFilms({
      sort: "title",
      dir: "asc",
      pageSize: 2,
    });

    expect(firstPage.total).toBe(3);
    expect(firstPage.rows.map((row) => row.title)).toEqual([
      "ALPHA ADVENTURE",
      "BETA COMEDY",
    ]);
    expect(firstPage.rows[0]).toMatchObject({
      id: 1,
      year: 2006,
      categories: ["Action"],
      rating: "PG",
      length: 90,
      rate: 2.99,
      replace: 14.99,
      lang: "English",
      features: ["Trailers", "Deleted Scenes"],
      actors: 2,
      inventory: 3,
    });
    expect(firstPage.rows[0]?.updated).toBe("2024-01-02T03:04:05.000Z");

    await expect(
      listFilms({ search: "beta", pageSize: 10 }),
    ).resolves.toMatchObject({
      rows: [expect.objectContaining({ id: 2, title: "BETA COMEDY" })],
      total: 1,
    });

    await expect(
      listFilms({ categoryId: 3, rating: "PG-13", pageSize: 10 }),
    ).resolves.toMatchObject({
      rows: [expect.objectContaining({ id: 3, title: "GAMMA DRAMA" })],
      total: 1,
    });

    await expect(
      listFilms({ sort: "rate", dir: "desc", pageSize: 3 }),
    ).resolves.toMatchObject({
      rows: [
        expect.objectContaining({ id: 2 }),
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 3 }),
      ],
      total: 3,
    });

    await expect(
      listFilms({ sort: "title", dir: "asc", page: 2, pageSize: 2 }),
    ).resolves.toMatchObject({
      rows: [expect.objectContaining({ id: 3 })],
      total: 3,
    });
  });

  it("loads film detail, cast, inventory, and rental demand windows", async () => {
    await seedBaseCatalog();
    await insertRental({ id: 1, inventoryId: 1, rentedDaysAgo: 0, staffId: 1 });
    await insertRental({
      id: 2,
      inventoryId: 2,
      rentedDaysAgo: 1,
      returnedDaysAgo: 0,
      staffId: 3,
    });
    await insertRental({
      id: 3,
      inventoryId: 3,
      customerId: 2,
      rentedDaysAgo: 35,
      returnedDaysAgo: 33,
      staffId: 2,
    });

    await expect(getFilm(999)).resolves.toBeNull();
    await expect(getFilm(1)).resolves.toMatchObject({
      id: 1,
      title: "ALPHA ADVENTURE",
      desc: "First seeded film",
      year: 2006,
      durationDays: 3,
      rate: 2.99,
      length: 90,
      replace: 14.99,
      rating: "PG",
      features: ["Trailers", "Deleted Scenes"],
      category: "Action",
      categoryId: 1,
      lang: "English",
      languageId: 1,
      originalLang: null,
      originalLanguageId: null,
    });

    await expect(getFilmInventoryByStore(1)).resolves.toEqual([
      { store_id: 1, city: "Toronto", units: 2, out: 1 },
      { store_id: 2, city: "Seattle", units: 1, out: 0 },
    ]);
    await expect(getFilmInventoryByStore(3, true)).resolves.toEqual([]);

    await expect(getFilmCast(1)).resolves.toEqual([
      { actor_id: 2, first_name: "Alex", last_name: "Baker" },
      { actor_id: 1, first_name: "Casey", last_name: "Young" },
    ]);

    await expect(getFilm30dPerformance(1)).resolves.toEqual({
      cur30d: 2,
      prev30d: 1,
      deltaPct: 100,
    });

    const demand = await getFilmDemandSparklines([1, 2]);
    expect(demand.get(1)).toHaveLength(12);
    expect(demand.get(1)?.slice(-2)).toEqual([1, 1]);
    expect(sum(demand.get(2) ?? [])).toBe(0);
    await expect(getFilmDemandSparklines([])).resolves.toEqual(new Map());
  });

  it("updates film rates, categories, and editable detail fields", async () => {
    await seedBaseCatalog();

    await updateFilmRate(1, 7.25);
    await expect(getFilm(1)).resolves.toMatchObject({ rate: 7.25 });

    await updateFilmCategory(1, 2);
    await expect(getFilm(1)).resolves.toMatchObject({
      category: "Comedy",
      categoryId: 2,
    });

    await updateFilm(1, {
      title: "ALPHA RENAMED",
      desc: "Fresh edit",
      year: 2010,
      languageId: 2,
      originalLanguageId: 3,
      durationDays: 6,
      rate: 3.75,
      length: 101,
      replace: 18.5,
      rating: "R",
      features: ["Commentaries"],
    });

    await expect(getFilm(1)).resolves.toMatchObject({
      title: "ALPHA RENAMED",
      desc: "Fresh edit",
      year: 2010,
      durationDays: 6,
      rate: 3.75,
      length: 101,
      replace: 18.5,
      rating: "R",
      features: ["Commentaries"],
      lang: "French",
      languageId: 2,
      originalLang: "Spanish",
      originalLanguageId: 3,
    });

    await updateFilm(1, { originalLanguageId: null });
    await expect(getFilm(1)).resolves.toMatchObject({
      originalLang: null,
      originalLanguageId: null,
    });

    await bulkSetCategory([1, 2], 3);
    await expect(getFilm(1)).resolves.toMatchObject({ categoryId: 3 });
    await expect(getFilm(2)).resolves.toMatchObject({ categoryId: 3 });
    await expect(bulkSetCategory([], 1)).resolves.toBeUndefined();

    await expect(bulkArchiveFilms([])).resolves.toBeUndefined();
    await expect(bulkArchiveFilms([1])).rejects.toThrow(/archived_at/);
  });

  it("summarizes dashboard metrics and recent activity", async () => {
    await seedBaseCatalog();
    await insertRental({ id: 1, inventoryId: 1, rentedDaysAgo: 0, staffId: 1 });
    await insertRental({
      id: 2,
      inventoryId: 2,
      rentedDaysAgo: 1,
      returnedDaysAgo: 0,
      staffId: 3,
    });
    await insertRental({
      id: 3,
      inventoryId: 4,
      customerId: 2,
      rentedDaysAgo: 2,
      returnedDaysAgo: 0,
      staffId: 2,
    });
    await insertRental({
      id: 4,
      inventoryId: 4,
      customerId: 2,
      rentedDaysAgo: 10,
      staffId: 2,
    });
    await insertRental({
      id: 5,
      inventoryId: 3,
      customerId: 2,
      rentedDaysAgo: 0,
      returnedDaysAgo: 0,
      staffId: 2,
    });
    await insertPayment({
      id: 1,
      rentalId: 1,
      amount: 4.5,
      customerId: 1,
      staffId: 1,
      hour: 9,
    });
    await insertPayment({
      id: 2,
      rentalId: 3,
      amount: 6.25,
      customerId: 2,
      staffId: 2,
      hour: 11,
    });

    const kpis = await getKpis();
    expect(kpis).toMatchObject({
      totalFilms: 3,
      activeRentals: 2,
      lowStock: 3,
      mtdRevenue: 10.75,
    });
    expect(kpis.sparkRevenue).toHaveLength(8);
    expect(kpis.sparkRevenue.at(-1)).toBe(10.75);

    await expect(getRentalsByDay(3)).resolves.toEqual([
      { day: await isoDateDaysAgo(2), rentals: 1 },
      { day: await isoDateDaysAgo(1), rentals: 1 },
      { day: await isoDateDaysAgo(0), rentals: 2 },
    ]);

    await expect(getAvgRentalDuration()).resolves.toBe(1);
    await expect(getOverdueRentals()).resolves.toBe(1);

    await expect(getTopFilms(2)).resolves.toEqual([
      { id: 1, title: "ALPHA ADVENTURE", category: "Action", rentals: 3 },
      { id: 2, title: "BETA COMEDY", category: "Comedy", rentals: 2 },
    ]);

    await expect(getRecentActivity(1)).resolves.toEqual([
      expect.objectContaining({
        kind: "payment",
        who: "Bea Manager",
        what: "BETA COMEDY",
        detail: "6.25",
      }),
    ]);
  });

  it("calculates per-store rental averages over the last 30 days", async () => {
    await seedBaseCatalog();
    await insertRentalSeries({
      startId: 100,
      count: 30,
      inventoryId: 1,
      staffId: 1,
    });
    await insertRentalSeries({
      startId: 200,
      count: 60,
      inventoryId: 4,
      customerId: 2,
      staffId: 2,
    });

    await expect(getPerStoreRentalAverages()).resolves.toEqual([
      { store_id: 1, avg_per_day: 1 },
      { store_id: 2, avg_per_day: 2 },
    ]);
  });
});

async function seedBaseCatalog() {
  await query(`
    INSERT INTO public.language (language_id, name)
    VALUES
      (1, 'English'),
      (2, 'French'),
      (3, 'Spanish');

    INSERT INTO public.category (category_id, name)
    VALUES
      (1, 'Action'),
      (2, 'Comedy'),
      (3, 'Drama');

    INSERT INTO public.country (country_id, country)
    VALUES
      (1, 'Canada'),
      (2, 'USA');

    INSERT INTO public.city (city_id, city, country_id)
    VALUES
      (1, 'Toronto', 1),
      (2, 'Seattle', 2);

    INSERT INTO public.address (
      address_id,
      address,
      district,
      city_id,
      postal_code,
      phone
    )
    VALUES
      (1, '100 King St', 'Ontario', 1, 'M5V', '111-1111'),
      (2, '200 Pine St', 'Washington', 2, '98101', '222-2222');

    INSERT INTO public.store (store_id, manager_staff_id, address_id)
    VALUES
      (1, 1, 1),
      (2, 2, 2);

    INSERT INTO public.staff (
      staff_id,
      first_name,
      last_name,
      address_id,
      email,
      store_id,
      active,
      username,
      last_update
    )
    VALUES
      (1, 'Ada', 'Manager', 1, 'ada@example.com', 1, true, 'ada', '2024-01-01 09:00:00+00'),
      (2, 'Bea', 'Manager', 2, 'bea@example.com', 2, true, 'bea', '2024-01-02 09:00:00+00'),
      (3, 'Cal', 'Clerk', 1, 'cal@example.com', 1, true, 'cal', '2024-01-03 09:00:00+00'),
      (4, 'Dana', 'Clerk', 2, 'dana@example.com', 2, false, 'dana', '2024-01-04 09:00:00+00');

    INSERT INTO public.customer (
      customer_id,
      store_id,
      first_name,
      last_name,
      email,
      address_id,
      active
    )
    VALUES
      (1, 1, 'Casey', 'Customer', 'casey@example.com', 1, 1),
      (2, 2, 'Robin', 'Customer', 'robin@example.com', 2, 1);

    INSERT INTO public.film (
      film_id,
      title,
      description,
      release_year,
      language_id,
      original_language_id,
      rental_duration,
      rental_rate,
      length,
      replacement_cost,
      rating,
      last_update,
      special_features
    )
    VALUES
      (
        1,
        'ALPHA ADVENTURE',
        'First seeded film',
        2006,
        1,
        NULL,
        3,
        2.99,
        90,
        14.99,
        'PG',
        '2024-01-02 03:04:05+00',
        ARRAY['Trailers', 'Deleted Scenes']::text[]
      ),
      (
        2,
        'BETA COMEDY',
        'Second seeded film',
        2008,
        1,
        NULL,
        5,
        4.99,
        120,
        20.99,
        'R',
        '2024-01-03 03:04:05+00',
        ARRAY['Behind the Scenes']::text[]
      ),
      (
        3,
        'GAMMA DRAMA',
        'Third seeded film',
        2012,
        2,
        1,
        4,
        1.99,
        75,
        12.99,
        'PG-13',
        '2024-01-04 03:04:05+00',
        NULL
      );

    INSERT INTO public.film_category (film_id, category_id)
    VALUES
      (1, 1),
      (2, 2),
      (3, 3);

    INSERT INTO public.actor (actor_id, first_name, last_name)
    VALUES
      (1, 'Casey', 'Young'),
      (2, 'Alex', 'Baker'),
      (3, 'Blake', 'Stone');

    INSERT INTO public.film_actor (actor_id, film_id)
    VALUES
      (1, 1),
      (2, 1),
      (3, 2);

    INSERT INTO public.inventory (inventory_id, film_id, store_id)
    VALUES
      (1, 1, 1),
      (2, 1, 1),
      (3, 1, 2),
      (4, 2, 2);
  `);
}

type RentalFixture = {
  id: number;
  inventoryId: number;
  customerId?: number;
  rentedDaysAgo: number;
  returnedDaysAgo?: number | null;
  staffId?: number;
};

async function insertRental({
  id,
  inventoryId,
  customerId = 1,
  rentedDaysAgo,
  returnedDaysAgo = null,
  staffId = 1,
}: RentalFixture) {
  await query(
    `
      INSERT INTO public.rental (
        rental_id,
        rental_date,
        inventory_id,
        customer_id,
        return_date,
        staff_id
      )
      VALUES (
        $1,
        current_date - ($2::int * interval '1 day') + time '10:00',
        $3,
        $4,
        CASE
          WHEN $5::int IS NULL THEN NULL
          ELSE current_date - ($5::int * interval '1 day') + time '10:00'
        END,
        $6
      )
    `,
    [id, rentedDaysAgo, inventoryId, customerId, returnedDaysAgo, staffId],
  );
}

type PaymentFixture = {
  id: number;
  rentalId: number;
  amount: number;
  customerId: number;
  staffId: number;
  hour: number;
};

async function insertPayment({
  id,
  rentalId,
  amount,
  customerId,
  staffId,
  hour,
}: PaymentFixture) {
  await query(
    `
      INSERT INTO public.payment (
        payment_id,
        customer_id,
        staff_id,
        rental_id,
        amount,
        payment_date
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        current_date + ($6::int * interval '1 hour')
      )
    `,
    [id, customerId, staffId, rentalId, amount, hour],
  );
}

type RentalSeriesFixture = {
  startId: number;
  count: number;
  inventoryId: number;
  customerId?: number;
  staffId: number;
};

async function insertRentalSeries({
  startId,
  count,
  inventoryId,
  customerId = 1,
  staffId,
}: RentalSeriesFixture) {
  await query(
    `
      INSERT INTO public.rental (
        rental_id,
        rental_date,
        inventory_id,
        customer_id,
        return_date,
        staff_id
      )
      SELECT
        $1::int + series.n,
        current_date - interval '1 day' + (series.n * interval '1 second'),
        $2,
        $3,
        current_date + (series.n * interval '1 second'),
        $4
      FROM generate_series(1, $5::int) AS series(n)
    `,
    [startId, inventoryId, customerId, staffId, count],
  );
}

async function isoDateDaysAgo(daysAgo: number): Promise<string> {
  const { rows } = await query<{ day: string }>(
    `
      SELECT to_char(
        current_date - ($1::int * interval '1 day'),
        'YYYY-MM-DD'
      ) AS day
    `,
    [daysAgo],
  );

  return rows[0]?.day ?? "";
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
