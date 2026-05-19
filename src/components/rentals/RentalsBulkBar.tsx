"use client";

/**
 * RentalsBulkBar — persimmon action bar shown while ≥1 rental is
 * selected. "Mark returned" is the only wired action; the others
 * (Print, Export, Delete) are presentational stubs for parity with
 * the films/stores bulk bars.
 */

import { useTransition } from "react";

import { Btn, Check, Icon } from "@/components/ui";
import { returnRentalAction } from "@/lib/actions/rentals";

export type RentalsBulkBarProps = {
  selectedIds: number[];
  onClear: () => void;
};

export default function RentalsBulkBar({
  selectedIds,
  onClear,
}: RentalsBulkBarProps) {
  const count = selectedIds.length;
  const [isPending, startTransition] = useTransition();
  if (count === 0) return null;

  const markReturned = () => {
    startTransition(async () => {
      for (const id of selectedIds) {
        await returnRentalAction(id);
      }
      onClear();
    });
  };

  return (
    <div className="fl-bulkbar" role="region" aria-label="Bulk actions">
      <Check checked onChange={onClear} ariaLabel="Clear selection" />
      <b style={{ fontWeight: 600 }}>
        {count} rental{count > 1 ? "s" : ""} selected
      </b>
      <div className="sep" />

      <Btn
        size="sm"
        leftIcon="check"
        onClick={markReturned}
        disabled={isPending}
      >
        Mark returned
      </Btn>
      <Btn size="sm" leftIcon="download" disabled>
        Export
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
