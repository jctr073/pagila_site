import Link from "next/link";

import { Btn } from "@/components/ui";

/**
 * Page heading for `/rentals`. Mirrors StoresHeader — title, summary
 * counts, and a right-hand actions cluster. The "New rental" button
 * navigates to /rentals/new; the intercepting route serves the modal.
 */
export type RentalsHeaderProps = {
  totalRentals: number;
  openCount: number;
  overdueCount: number;
};

export default function RentalsHeader({
  totalRentals,
  openCount,
  overdueCount,
}: RentalsHeaderProps) {
  return (
    <div className="pa-page-h">
      <div className="ttl">
        <h1>Rentals</h1>
        <p>
          {totalRentals.toLocaleString()} rentals ·{" "}
          {openCount.toLocaleString()} open ·{" "}
          {overdueCount.toLocaleString()} overdue · synced live
        </p>
      </div>
      <div className="actions">
        <Btn size="sm" variant="ghost" leftIcon="download">
          Export
        </Btn>
        <Link href="/rentals/new" aria-label="New rental">
          <Btn size="sm" variant="primary" leftIcon="plus">
            New rental
          </Btn>
        </Link>
      </div>
    </div>
  );
}
