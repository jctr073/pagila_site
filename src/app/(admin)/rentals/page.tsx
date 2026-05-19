/**
 * Rentals list (`/rentals`).
 *
 * Server component. Reads URL state (Next 16: `searchParams` arrives
 * as a Promise) and fetches the joined rentals page plus the same-
 * filter status counts in one round trip.
 *
 *   ?q=...        search films, customer names, customer emails
 *   ?status=...   open | overdue | returned
 *   ?sort=...     id | rented | due | film | customer | store | staff | status
 *   ?dir=asc|desc
 *   ?page=, ?pageSize=
 */

import { Suspense } from "react";

import { RentalsHeader, RentalsPage } from "@/components/rentals";
import type {
  RentalsSortDir,
  RentalsSortKey,
} from "@/components/rentals/RentalsTable";
import { listRentalsForTable } from "@/lib/queries/rentals";
import type { RentalStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_SORTS = new Set<RentalsSortKey>([
  "id",
  "rented",
  "due",
  "film",
  "customer",
  "store",
  "staff",
  "status",
]);

const VALID_STATUSES = new Set<RentalStatus>(["open", "overdue", "returned"]);

type RentalsSearchParams = {
  q?: string | string[];
  status?: string | string[];
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

export default async function RentalsRoute({
  searchParams,
}: {
  searchParams: Promise<RentalsSearchParams>;
}) {
  const sp = await searchParams;

  const q = pickString(sp.q)?.trim() || undefined;
  const statusRaw = pickString(sp.status);
  const status: RentalStatus | undefined =
    statusRaw && VALID_STATUSES.has(statusRaw as RentalStatus)
      ? (statusRaw as RentalStatus)
      : undefined;
  const sortRaw = pickString(sp.sort);
  const sort: RentalsSortKey | undefined =
    sortRaw && VALID_SORTS.has(sortRaw as RentalsSortKey)
      ? (sortRaw as RentalsSortKey)
      : undefined;
  const dirRaw = pickString(sp.dir);
  const dir: RentalsSortDir | undefined =
    dirRaw === "asc" || dirRaw === "desc" ? dirRaw : undefined;
  const page = parseIntOrUndef(pickString(sp.page)) ?? 1;
  const pageSize = parseIntOrUndef(pickString(sp.pageSize)) ?? 25;
  const safePageSize = Math.min(Math.max(10, pageSize), 100);
  const offset = (page - 1) * safePageSize;

  const baseParamsObj = new URLSearchParams();
  if (q) baseParamsObj.set("q", q);
  if (status) baseParamsObj.set("status", status);
  if (sort) baseParamsObj.set("sort", sort);
  if (dir) baseParamsObj.set("dir", dir);
  const baseParams = baseParamsObj.toString();

  const { rows, total, statusCounts } = await listRentalsForTable({
    q,
    status,
    sort,
    dir,
    limit: safePageSize,
    offset,
  });

  const totalAll =
    statusCounts.open + statusCounts.overdue + statusCounts.returned;

  return (
    <>
      <RentalsHeader
        totalRentals={totalAll}
        openCount={statusCounts.open}
        overdueCount={statusCounts.overdue}
      />
      <Suspense>
        <RentalsPage
          rows={rows}
          total={total}
          statusCounts={statusCounts}
          page={page}
          pageSize={safePageSize}
          sort={sort}
          dir={dir}
          status={status}
          baseParams={baseParams}
        />
      </Suspense>
    </>
  );
}
