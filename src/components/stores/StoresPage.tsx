"use client";

/**
 * StoresPage — client wrapper for /stores. Owns the selection Set and
 * composes the toolbar / bulk bar / sortable table / footer the same way
 * FilmsPage does. Server data (`rows`, sort, pagination) arrives as
 * plain props.
 */

import { useEffect, useMemo, useState } from "react";

import type { StoreListRow } from "@/lib/types";

import StoresBulkBar from "./StoresBulkBar";
import StoresFooter from "./StoresFooter";
import StoresTable, {
  type StoresSortDir,
  type StoresSortKey,
} from "./StoresTable";
import StoresToolbar from "./StoresToolbar";

export type StoresPageProps = {
  rows: StoreListRow[];
  total: number;
  page: number;
  pageSize: number;
  sort?: StoresSortKey;
  dir?: StoresSortDir;
  baseParams: string;
};

export default function StoresPage({
  rows,
  total,
  page,
  pageSize,
  sort,
  dir,
  baseParams,
}: StoresPageProps) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  // Drop selection entries for rows no longer visible after a sort/page
  // change — matches FilmsPage behaviour.
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

  return (
    <div
      className="fl-style-lined"
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <StoresToolbar />

      <StoresBulkBar
        selectedIds={selectedIds}
        onClear={() => setSelected(new Set())}
      />

      <StoresTable
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

      <StoresFooter
        page={page}
        pageSize={pageSize}
        total={total}
        baseParams={baseParams}
      />
    </div>
  );
}
