"use client";

/**
 * FilmsPage — client wrapper that owns the selection state and composes
 * the FilmsToolbar + FilmsBulkBar + FilmsTable + FilmsFooter.
 *
 * Why client: the selection Set is the only piece of UI state that has
 * to be shared between the BulkBar and the Table — keeping it here
 * means both can stay dumb. URL state (sort/dir/q/filters) is read
 * directly by the children via `useSearchParams`.
 *
 * The server page passes `rows`, `categories`, and `sparklines` as plain
 * serializable props.
 */

import { useEffect, useMemo, useState } from "react";

import type { FilmRow } from "@/lib/types";

import FilmsBulkBar from "./FilmsBulkBar";
import FilmsFooter from "./FilmsFooter";
import FilmsTable, { type SortDir, type SortKey } from "./FilmsTable";
import FilmsToolbar from "./FilmsToolbar";

type CategoryOption = { id: number; name: string };

export type FilmsPageProps = {
  rows: FilmRow[];
  total: number;
  page: number;
  pageSize: number;
  sort?: SortKey;
  dir?: SortDir;
  categories: CategoryOption[];
  /** Serializable form of `Map<id, number[]>` from the server. */
  sparklines: [number, number[]][];
  /** Current search params excluding `page` / `pageSize`, already stringified. */
  baseParams: string;
};

export default function FilmsPage({
  rows,
  total,
  page,
  pageSize,
  sort,
  dir,
  categories,
  sparklines,
  baseParams,
}: FilmsPageProps) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  // Drop selection entries for rows that aren't visible anymore (after
  // sort/page change). Keeps the bulk-bar count truthful to what the
  // user can actually see.
  useEffect(() => {
    // Syncing local Set with server-rendered rows is exactly the
    // "external prop changed -> derive new local state" pattern the
    // React docs allow inside an effect. Functional updater keeps
    // it safe; the new lint rule is overly strict here.
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
      <FilmsToolbar categories={categories} />

      <FilmsBulkBar
        selectedIds={selectedIds}
        categories={categories}
        onClear={() => setSelected(new Set())}
      />

      <FilmsTable
        rows={rows}
        sparklines={sparklines}
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

      <FilmsFooter
        page={page}
        pageSize={pageSize}
        total={total}
        baseParams={baseParams}
      />
    </div>
  );
}
