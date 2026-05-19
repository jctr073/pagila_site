/**
 * Intercepted edit modal — `/stores/[id]/edit` when navigated FROM the
 * stores list or from the drawer. Same `(.)` same-level interceptor as
 * the drawer route.
 *
 * The modal body is a client form; the scrim + Esc handler live in the
 * client shell wrapper.
 */

import { notFound } from "next/navigation";

import {
  StoreEditForm,
  StoreEditModalShell,
} from "@/components/stores";
import { getStoreDetail } from "@/lib/queries/stores";
import { listCities } from "@/lib/queries/lookups";

export default async function InterceptedStoreEditModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storeId = Number.parseInt(id, 10);
  if (!Number.isFinite(storeId) || storeId < 0) notFound();

  const [store, cities] = await Promise.all([
    getStoreDetail(storeId),
    listCities(),
  ]);
  if (!store) notFound();

  return (
    <StoreEditModalShell>
      <StoreEditForm store={store} cities={cities} />
    </StoreEditModalShell>
  );
}
