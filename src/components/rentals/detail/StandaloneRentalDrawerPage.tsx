/**
 * StandaloneRentalDrawerPage — page-shaped wrapper for the rental
 * drawer on cold loads of /rentals/[id]. Mirrors StandaloneStoreDrawerPage.
 */

import type { ReactNode } from "react";
import Link from "next/link";

import { Btn } from "@/components/ui";

export type StandaloneRentalDrawerPageProps = {
  title?: string;
  children: ReactNode;
};

export default function StandaloneRentalDrawerPage({
  title,
  children,
}: StandaloneRentalDrawerPageProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="pa-page-h">
        <div className="ttl">
          <h1>{title ?? "Rental detail"}</h1>
          <p>
            Direct link · this page would normally appear as an overlay on the
            rentals list.
          </p>
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
        {children}
      </div>
    </div>
  );
}
