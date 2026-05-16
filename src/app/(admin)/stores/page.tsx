/**
 * Stores & Staff (`/stores`) — Phase 9.
 *
 * Server component. Reads search params (Next 16: `searchParams` is a
 * Promise — see node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/page.md), fires the two stores queries in
 * parallel, and hands the rows down to a single `<StoresPage>` client
 * wrapper.
 *
 *   ?store=<id>   filter the staff table to one store
 *   ?tab=...      'staff' | 'shifts' | 'permissions' (default 'staff')
 *   ?role=...     filter for the role chip (not yet wired into SQL)
 *   ?q=...        free-text search (not yet wired into SQL)
 *
 * For Phase 9 we read `store` and pass it through to `listStaff()`; the
 * remaining params are consumed by client islands (`StaffTabs`,
 * `StaffFilters`). They live in the URL so they survive reloads.
 */

import { StoresPage } from "@/components/stores";
import { listStaff, listStores } from "@/lib/queries/stores";

export const dynamic = "force-dynamic";

type StoresSearchParams = {
  store?: string | string[];
  tab?: string | string[];
  role?: string | string[];
  q?: string | string[];
};

function firstValue(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function parseStoreId(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

export default async function StoresRoute({
  searchParams,
}: {
  searchParams: Promise<StoresSearchParams>;
}) {
  const sp = await searchParams;
  const storeId = parseStoreId(firstValue(sp.store));

  const [stores, staff] = await Promise.all([
    listStores(),
    listStaff({ storeId }),
  ]);

  return <StoresPage stores={stores} staff={staff} />;
}
