/**
 * Stores list (`/stores`).
 *
 * Server component. Reads the URL state (Next 16: `searchParams` arrives
 * as a Promise) and fetches the per-store rollups plus the staff total
 * needed for the header subtitle.
 *
 *   ?q=...        free-text search (not yet wired into SQL)
 *   ?sort=...     id | city | country | address | inventory | customers | staff
 *   ?dir=asc|desc
 *   ?page=, ?pageSize=
 */

import { Suspense } from "react";

import { StoresHeader, StoresPage } from "@/components/stores";
import type {
  StoresSortDir,
  StoresSortKey,
} from "@/components/stores/StoresTable";
import {
  listStaff,
  listStoresForTable,
  type StoreSortKey,
} from "@/lib/queries/stores";

export const dynamic = "force-dynamic";

const VALID_SORTS = new Set<StoresSortKey>([
  "id",
  "city",
  "country",
  "address",
  "inventory",
  "customers",
  "staff",
]);

type StoresSearchParams = {
  q?: string | string[];
  sort?: string | string[];
  dir?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
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

export default async function StoresRoute({
  searchParams,
}: {
  searchParams: Promise<StoresSearchParams>;
}) {
  const sp = await searchParams;

  const q = pickString(sp.q)?.trim() || undefined;
  const sortRaw = pickString(sp.sort);
  const sort: StoresSortKey | undefined =
    sortRaw && VALID_SORTS.has(sortRaw as StoresSortKey)
      ? (sortRaw as StoresSortKey)
      : undefined;
  const dirRaw = pickString(sp.dir);
  const dir: StoresSortDir | undefined =
    dirRaw === "asc" || dirRaw === "desc" ? dirRaw : undefined;
  const page = parseIntOrUndef(pickString(sp.page)) ?? 1;
  const pageSize = parseIntOrUndef(pickString(sp.pageSize)) ?? 25;
  const safePageSize = Math.min(Math.max(10, pageSize), 100);

  const baseParamsObj = new URLSearchParams();
  if (q) baseParamsObj.set("q", q);
  if (sort) baseParamsObj.set("sort", sort);
  if (dir) baseParamsObj.set("dir", dir);
  const baseParams = baseParamsObj.toString();

  const [allStores, staff] = await Promise.all([
    listStoresForTable({ sort: sort as StoreSortKey | undefined, dir }),
    listStaff(),
  ]);

  // Search filter happens in JS — Pagila has only a handful of stores so
  // an O(n) scan is fine. Wiring full-text into SQL is a follow-up if
  // the catalog grows.
  const filtered = q
    ? allStores.filter((s) => {
        const needle = q.toLowerCase();
        return (
          s.city.toLowerCase().includes(needle) ||
          s.country.toLowerCase().includes(needle) ||
          s.address.toLowerCase().includes(needle) ||
          s.manager.toLowerCase().includes(needle)
        );
      })
    : allStores;

  const total = filtered.length;
  const totalCustomers = allStores.reduce((acc, s) => acc + s.customers, 0);
  const offset = (page - 1) * safePageSize;
  const rows = filtered.slice(offset, offset + safePageSize);

  return (
    <>
      <StoresHeader
        storeCount={allStores.length}
        staffCount={staff.length}
        customerCount={totalCustomers}
      />
      <Suspense>
        <StoresPage
          rows={rows}
          total={total}
          page={page}
          pageSize={safePageSize}
          sort={sort}
          dir={dir}
          baseParams={baseParams}
        />
      </Suspense>
    </>
  );
}
