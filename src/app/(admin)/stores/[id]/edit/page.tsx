/**
 * Standalone store-edit page — rendered when /stores/[id]/edit is
 * hard-loaded (cold visit, refresh, or shared link). Same data fetch as
 * the intercepted modal; renders the form inside the standalone page
 * shell (no scrim — there's nothing behind it to dim).
 */

import { notFound } from "next/navigation";

import {
  StandaloneStoreDrawerPage,
  StoreEditForm,
} from "@/components/stores";
import { getStoreDetail } from "@/lib/queries/stores";
import { listCities } from "@/lib/queries/lookups";

export default async function StandaloneStoreEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storeId = Number.parseInt(id, 10);
  if (!Number.isFinite(storeId) || storeId <= 0) notFound();

  const [store, cities] = await Promise.all([
    getStoreDetail(storeId),
    listCities(),
  ]);
  if (!store) notFound();

  return (
    <StandaloneStoreDrawerPage
      title={`Edit · ${store.name?.trim() || `${store.city}, ${store.country}`}`}
    >
      <StoreEditForm store={store} cities={cities} standalone />
    </StandaloneStoreDrawerPage>
  );
}
