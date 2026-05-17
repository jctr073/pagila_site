/**
 * StandaloneStoreDrawerPage — page-shaped wrapper for the store drawer
 * on cold loads of /stores/[id]. Mirrors StandaloneDrawerPage from the
 * films section but with a Stores back-link.
 */

import type { ReactNode } from "react";
import Link from "next/link";

import { Btn } from "@/components/ui";

export type StandaloneStoreDrawerPageProps = {
  title?: string;
  children: ReactNode;
};

export default function StandaloneStoreDrawerPage({
  title,
  children,
}: StandaloneStoreDrawerPageProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="pa-page-h">
        <div className="ttl">
          <h1>{title ?? "Store detail"}</h1>
          <p>
            Direct link · this page would normally appear as an overlay on the
            stores list.
          </p>
        </div>
        <div className="actions">
          <Link href="/stores">
            <Btn size="sm" variant="ghost" leftIcon="chevLeft">
              Back to stores
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
