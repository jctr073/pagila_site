/**
 * Films list — server component.
 *
 * Reads URL state via the Next 16 async `searchParams` prop (it arrives
 * as a Promise — see
 *   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md).
 * We whitelist every param before passing it to `listFilms()`. Sort key
 * + direction are validated against the same set the query layer
 * enforces.
 *
 * Data flow (all parallel):
 *   - listFilms({...})       — page of rows + total
 *   - listCategories()       — filter popover + inline-edit options
 *   - getFilmDemandSparklines(ids)
 *   - count(*) FROM inventory — for the "N inventory units" subtitle
 *
 * The render delegates almost everything to <FilmsPage>, which is a
 * client wrapper that owns selection state.
 */

import { Suspense } from "react";

import FilmsHeader from "@/components/films/FilmsHeader";
import FilmsPage from "@/components/films/FilmsPage";
import type { SortDir, SortKey } from "@/components/films/FilmsTable";
import { query } from "@/lib/db";
import {
  getFilmDemandSparklines,
  listFilms,
} from "@/lib/queries/films";
import { listCategories } from "@/lib/queries/lookups";
import type { Rating } from "@/lib/types";

const VALID_SORTS = new Set<SortKey>([
  "id",
  "title",
  "rate",
  "length",
  "updated",
]);
const VALID_RATINGS = new Set<Rating>(["G", "PG", "PG-13", "R", "NC-17"]);

type SearchParamsShape = {
  q?: string | string[];
  category?: string | string[];
  rating?: string | string[];
  sort?: string | string[];
  dir?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
  length?: string | string[];
};

function pickString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function parseIntOrUndef(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

async function getInventoryCount(): Promise<number> {
  const { rows } = await query<{ total: number }>(
    `SELECT count(*)::int AS total FROM inventory`,
  );
  return rows[0]?.total ?? 0;
}

export default async function FilmsRoute({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}) {
  const sp = await searchParams;

  // ── Parse & validate ────────────────────────────────────────────────
  const q = pickString(sp.q)?.trim() || undefined;
  const categoryId = parseIntOrUndef(pickString(sp.category));
  const ratingRaw = pickString(sp.rating);
  const rating =
    ratingRaw && VALID_RATINGS.has(ratingRaw as Rating)
      ? (ratingRaw as Rating)
      : undefined;
  const sortRaw = pickString(sp.sort);
  const sort: SortKey | undefined =
    sortRaw && VALID_SORTS.has(sortRaw as SortKey)
      ? (sortRaw as SortKey)
      : undefined;
  const dirRaw = pickString(sp.dir);
  const dir: SortDir | undefined =
    dirRaw === "asc" || dirRaw === "desc" ? dirRaw : undefined;
  const page = parseIntOrUndef(pickString(sp.page)) ?? 1;
  const pageSize = parseIntOrUndef(pickString(sp.pageSize)) ?? 25;
  const safePageSize = Math.min(Math.max(10, pageSize), 100);

  // Re-stringify only the params that survive validation so we can pass
  // a canonical "baseParams" down for pagination links.
  const baseParamsObj = new URLSearchParams();
  if (q) baseParamsObj.set("q", q);
  if (categoryId) baseParamsObj.set("category", String(categoryId));
  if (rating) baseParamsObj.set("rating", rating);
  if (sort) baseParamsObj.set("sort", sort);
  if (dir) baseParamsObj.set("dir", dir);
  const lenBucket = pickString(sp.length);
  if (lenBucket) baseParamsObj.set("length", lenBucket);
  const baseParams = baseParamsObj.toString();

  // ── Fetch in parallel ────────────────────────────────────────────────
  const [{ rows, total }, categories, inventoryUnits] = await Promise.all([
    listFilms({
      search: q,
      categoryId,
      rating,
      sort,
      dir,
      page,
      pageSize: safePageSize,
    }),
    listCategories(),
    getInventoryCount(),
  ]);

  const sparklinesMap = await getFilmDemandSparklines(rows.map((r) => r.id));
  const sparklines: [number, number[]][] = Array.from(sparklinesMap.entries());

  return (
    <>
      <FilmsHeader totalFilms={total} inventoryUnits={inventoryUnits} />
      <Suspense>
        <FilmsPage
          rows={rows}
          total={total}
          page={page}
          pageSize={safePageSize}
          sort={sort}
          dir={dir}
          categories={categories}
          sparklines={sparklines}
          baseParams={baseParams}
        />
      </Suspense>
    </>
  );
}
