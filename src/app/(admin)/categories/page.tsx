/**
 * Categories list (`/categories`).
 *
 * Server component. Reads URL sort state (Next 16: `searchParams` is a
 * Promise), whitelists it, and hands the rows to a client wrapper that
 * owns the "New category" and delete-confirm modals.
 */

import { Suspense } from "react";

import {
  CategoriesPage,
  type CategoriesSortDir,
  type CategoriesSortKey,
} from "@/components/categories";
import { listCategoriesForTable } from "@/lib/queries/categories";

export const dynamic = "force-dynamic";

const VALID_SORTS = new Set<CategoriesSortKey>([
  "id",
  "name",
  "films",
  "updated",
]);

type CategoriesSearchParams = {
  sort?: string | string[];
  dir?: string | string[];
};

function pickString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function CategoriesRoute({
  searchParams,
}: {
  searchParams: Promise<CategoriesSearchParams>;
}) {
  const sp = await searchParams;

  const sortRaw = pickString(sp.sort);
  const sort: CategoriesSortKey | undefined =
    sortRaw && VALID_SORTS.has(sortRaw as CategoriesSortKey)
      ? (sortRaw as CategoriesSortKey)
      : undefined;
  const dirRaw = pickString(sp.dir);
  const dir: CategoriesSortDir | undefined =
    dirRaw === "asc" || dirRaw === "desc" ? dirRaw : undefined;

  const rows = await listCategoriesForTable({ sort, dir });

  return (
    <Suspense>
      <CategoriesPage rows={rows} sort={sort} dir={dir} />
    </Suspense>
  );
}
