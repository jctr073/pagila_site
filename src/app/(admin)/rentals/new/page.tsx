/**
 * Standalone new-rental page — rendered when /rentals/new is hard-loaded
 * (cold visit or shared link). Same data fetch as the intercepted modal;
 * renders the form inside the standalone page shell (no scrim).
 */

import Link from "next/link";

import { NewRentalForm } from "@/components/rentals";
import { Btn } from "@/components/ui";
import {
  listAvailableInventory,
  listCustomersLookup,
} from "@/lib/queries/rentals";
import { listStaff } from "@/lib/queries/stores";

export const dynamic = "force-dynamic";

export default async function StandaloneNewRentalPage() {
  const [customers, inventory, staff] = await Promise.all([
    listCustomersLookup(),
    listAvailableInventory({ limit: 500 }),
    listStaff(),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="pa-page-h">
        <div className="ttl">
          <h1>New rental</h1>
          <p>Direct link · this page would normally appear as a modal.</p>
        </div>
        <div className="actions">
          <Link href="/rentals">
            <Btn size="sm" variant="ghost" leftIcon="chevLeft">
              Back to rentals
            </Btn>
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 24 }}>
        <NewRentalForm
          customers={customers}
          inventory={inventory}
          staff={staff}
          standalone
        />
      </div>
    </div>
  );
}
