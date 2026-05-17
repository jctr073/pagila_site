/**
 * Intercepted store drawer — `/stores/[id]` when navigated to FROM
 * `/stores`. The `(.)` prefix is the same-level interceptor per Next
 * 16's intercepting-routes doc.
 *
 * The drawer body is a server component; the scrim + Esc handler live
 * in <StoreDrawerShell> (client). All data is fetched in parallel.
 */

import { notFound } from "next/navigation";

import {
  StoreDrawer,
  StoreDrawerShell,
} from "@/components/stores";
import {
  getStoreDetail,
  getStoreRentalSparkline,
  listCustomersByStore,
  listStaff,
} from "@/lib/queries/stores";

export default async function InterceptedStoreDrawer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storeId = Number.parseInt(id, 10);
  if (!Number.isFinite(storeId) || storeId <= 0) notFound();

  const [store, staff, customers, sparkline] = await Promise.all([
    getStoreDetail(storeId),
    listStaff({ storeId }),
    listCustomersByStore(storeId, 6),
    getStoreRentalSparkline(storeId),
  ]);

  if (!store) notFound();

  return (
    <StoreDrawerShell>
      <StoreDrawer
        store={store}
        staff={staff}
        customers={customers}
        sparkline={sparkline}
      />
    </StoreDrawerShell>
  );
}
