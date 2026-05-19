/**
 * Intercepted new-rental modal — `/rentals/new` when navigated FROM
 * `/rentals`. The `(.)` prefix is the same-level interceptor per Next
 * 16's intercepting-routes doc.
 */

import {
  NewRentalForm,
  NewRentalModalShell,
} from "@/components/rentals";
import {
  listAvailableInventory,
  listCustomersLookup,
} from "@/lib/queries/rentals";
import { listStaff } from "@/lib/queries/stores";

export default async function InterceptedNewRentalModal() {
  const [customers, inventory, staff] = await Promise.all([
    listCustomersLookup(),
    listAvailableInventory({ limit: 500 }),
    listStaff(),
  ]);

  return (
    <NewRentalModalShell>
      <NewRentalForm customers={customers} inventory={inventory} staff={staff} />
    </NewRentalModalShell>
  );
}
