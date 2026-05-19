"use client";

/**
 * RentalsPage — client wrapper for /rentals. Owns the selection Set
 * and composes the toolbar / bulk bar / sortable table / footer the
 * same way StoresPage does.
 */

import { useEffect, useMemo, useState } from "react";

import type { RentalRow, RentalStatus } from "@/lib/types";

import RentalsBulkBar from "./RentalsBulkBar";
import RentalsFooter from "./RentalsFooter";
import RentalsTable, {
  type RentalsSortDir,
  type RentalsSortKey,
} from "./RentalsTable";
import RentalsToolbar from "./RentalsToolbar";

export type RentalsPageProps = {
  rows: RentalRow[];
  total: number;
  statusCounts: { open: number; overdue: number; returned: number };
  page: number;
  pageSize: number;
  sort?: RentalsSortKey;
  dir?: RentalsSortDir;
  status?: RentalStatus;
  baseParams: string;
};

export default function RentalsPage({
  rows,
  total,
  statusCounts,
  page,
  pageSize,
  sort,
  dir,
  status,
  baseParams,
}: RentalsPageProps) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected((cur) => {
      if (cur.size === 0) return cur;
      const visible = new Set(rows.map((r) => r.id));
      const next = new Set<number>();
      for (const id of cur) if (visible.has(id)) next.add(id);
      return next.size === cur.size ? cur : next;
    });
  }, [rows]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  // Totals shown in the toolbar tabs reflect the global filter set
  // (search + store). The "All" tab still counts every status — sum the
  // three rather than `total`, which is post-status filter.
  const allCount = statusCounts.open + statusCounts.overdue + statusCounts.returned;

  return (
    <div
      className="fl-style-lined"
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <RentalsToolbar
        status={status}
        counts={statusCounts}
        total={allCount}
      />

      <RentalsBulkBar
        selectedIds={selectedIds}
        onClear={() => setSelected(new Set())}
      />

      <RentalsTable
        rows={rows}
        selected={selected}
        onToggle={(id) =>
          setSelected((cur) => {
            const next = new Set(cur);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        onToggleAll={(checked) =>
          setSelected(checked ? new Set(rows.map((r) => r.id)) : new Set())
        }
        sort={sort}
        dir={dir}
      />

      <RentalsFooter
        page={page}
        pageSize={pageSize}
        total={total}
        baseParams={baseParams}
      />
    </div>
  );
}
