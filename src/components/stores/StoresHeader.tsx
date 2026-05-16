import { Btn } from "@/components/ui";

/**
 * StoresHeader — page heading for /stores.
 *
 * Server-renderable; no client hooks. Mirrors the `pa-page-h` block
 * from design_handoff_pagila_admin/designs/stores-staff.jsx (header
 * with title + sub + two action buttons on the right).
 *
 * The "Add staff member" button is a stub for Phase 9 — a full modal
 * (intercepting route at /stores/staff/new) is out of scope here.
 */
export type StoresHeaderProps = {
  storeCount: number;
  staffCount: number;
};

export default function StoresHeader({
  storeCount,
  staffCount,
}: StoresHeaderProps) {
  return (
    <div className="pa-page-h">
      <div className="ttl">
        <h1>Stores &amp; Staff</h1>
        <p>
          {storeCount} stores &middot; {staffCount} staff members &middot; synced
          live across both locations
        </p>
      </div>
      <div className="actions">
        <Btn size="sm" variant="ghost" leftIcon="upload">
          Export staff
        </Btn>
        <Btn size="sm" leftIcon="plus" variant="primary">
          Add staff member
        </Btn>
      </div>
    </div>
  );
}
