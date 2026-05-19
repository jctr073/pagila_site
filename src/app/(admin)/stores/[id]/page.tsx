/**
 * Standalone store detail — rendered when /stores/[id] is hard-loaded
 * (cold visit, refresh, or shared link). Same data fetch as the
 * intercepted drawer, but laid out inside the admin shell as a normal
 * page rather than a fixed-position overlay.
 */

import { notFound } from "next/navigation";

import {
  StandaloneStoreDrawerPage,
  StoreDrawer,
} from "@/components/stores";
import {
  getStoreDetail,
  getStoreRentalSparkline,
  listCustomersByStore,
  listStaff,
} from "@/lib/queries/stores";

export default async function StandaloneStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storeId = Number.parseInt(id, 10);
  if (!Number.isFinite(storeId) || storeId < 0) notFound();

  const [store, staff, customers, sparkline] = await Promise.all([
    getStoreDetail(storeId),
    listStaff({ storeId }),
    listCustomersByStore(storeId, 12),
    getStoreRentalSparkline(storeId),
  ]);
  if (!store) notFound();

  return (
    <StandaloneStoreDrawerPage
      title={store.name?.trim() || `${store.city}, ${store.country}`}
    >
      <StoreDrawer
        store={store}
        staff={staff}
        customers={customers}
        sparkline={sparkline}
        standalone
      />
    </StandaloneStoreDrawerPage>
  );
}
