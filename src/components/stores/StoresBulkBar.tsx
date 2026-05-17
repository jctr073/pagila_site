"use client";

/**
 * StoresBulkBar — the persimmon bar shown while ≥1 store is selected.
 *
 * Ported from designs/stores-staff.jsx#StoresListScreen bulk-bar block.
 * Reassign-manager / Pause / Duplicate / Delete are stubs for parity
 * with the films bulk bar — no server actions wired yet.
 */

import { Btn, Check, Icon } from "@/components/ui";

export type StoresBulkBarProps = {
  selectedIds: number[];
  onClear: () => void;
};

export default function StoresBulkBar({
  selectedIds,
  onClear,
}: StoresBulkBarProps) {
  const count = selectedIds.length;
  if (count === 0) return null;

  return (
    <div className="fl-bulkbar" role="region" aria-label="Bulk actions">
      <Check checked onChange={onClear} ariaLabel="Clear selection" />
      <b style={{ fontWeight: 600 }}>
        {count} store{count > 1 ? "s" : ""} selected
      </b>
      <div className="sep" />

      <Btn size="sm" leftIcon="users" disabled>
        Reassign manager
      </Btn>
      <Btn size="sm" leftIcon="archive" disabled>
        Pause
      </Btn>
      <Btn size="sm" leftIcon="duplicate" disabled>
        Duplicate
      </Btn>

      <div style={{ flex: 1 }} />

      <Btn size="sm" variant="danger-ghost" leftIcon="trash" disabled>
        Delete
      </Btn>

      <button
        type="button"
        className="clearx"
        aria-label="Clear selection"
        onClick={onClear}
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}
