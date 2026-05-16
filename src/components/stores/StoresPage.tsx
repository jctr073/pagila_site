"use client";

import type { StaffRow, StoreRow } from "@/lib/types";
import StaffFilters from "./StaffFilters";
import StaffTable from "./StaffTable";
import StaffTabs from "./StaffTabs";
import StoreCard, { type StoreCardRibbonTone } from "./StoreCard";
import StoresHeader from "./StoresHeader";

export type StoresPageProps = {
  stores: StoreRow[];
  staff: StaffRow[];
};

/**
 * StoresPage — client wrapper that owns the layout for the /stores
 * screen.
 *
 * Marked `'use client'` so the nested `StaffTabs`, `StaffFilters`, and
 * `StaffTable` islands can hydrate without crossing a server-component
 * boundary mid-tree. The server route still does all the data fetching
 * and passes plain props.
 *
 * Layout mirrors design_handoff_pagila_admin/designs/stores-staff.jsx:
 *   1. Page header
 *   2. Two-column grid of StoreCards (store_id 1 → accent ribbon,
 *      store_id 2 → teal ribbon)
 *   3. Staff section card: tabs + filters row + staff table
 */
function ribbonTone(storeId: number): StoreCardRibbonTone {
  // Anything other than the canonical Pagila store #1 falls back to
  // teal so future expansions still render distinctly.
  return storeId === 1 ? "accent" : "teal";
}

export default function StoresPage({ stores, staff }: StoresPageProps) {
  return (
    <>
      <StoresHeader storeCount={stores.length} staffCount={staff.length} />

      <div className="st-cards-grid">
        {stores.map((s) => (
          <StoreCard key={s.id} store={s} ribbonTone={ribbonTone(s.id)} />
        ))}
      </div>

      <div className="pa-card staff-section">
        <div className="staff-section-head">
          <StaffTabs />
          <div className="grow" />
          <StaffFilters />
        </div>
        <StaffTable staff={staff} />
      </div>
    </>
  );
}
