"use client";

/**
 * FilmsTable — sortable, selectable, inline-editable films table.
 *
 * Ported from designs/films-list.jsx#FilmsListScreen <table> block.
 *
 * Selection lives in client state (a Set<number>) owned by the parent
 * FilmsPage wrapper — we receive it via props so the BulkBar can share
 * it. Sort lives in the URL; clicking a header pushes a new sort.
 *
 * The row itself is *not* wrapped in a <Link>; the inner cells dispatch
 * navigation via <Link href={`/films/${id}`}>` on the title cell only.
 * That avoids ambiguous click targets in checkbox / kebab cells. Phase 7
 * will swap the Link for a drawer-triggering interceptor.
 */

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Btn from "@/components/ui/Btn";
import CategoryChip from "@/components/ui/CategoryChip";
import Check from "@/components/ui/Check";
import Icon from "@/components/ui/Icon";
import Rating from "@/components/ui/Rating";
import Sparkline from "@/components/ui/Sparkline";
import StockBar from "@/components/ui/StockBar";
import type { FilmRow } from "@/lib/types";

import InlineEditRate from "./InlineEditRate";

export type SortDir = "asc" | "desc";
export type SortKey = "id" | "title" | "rate" | "length" | "updated";

export type FilmsTableProps = {
  rows: FilmRow[];
  sparklines: [number, number[]][];
  selected: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: (next: boolean) => void;
  sort?: SortKey;
  dir?: SortDir;
};

const SORTABLE: Record<string, SortKey> = {
  id: "id",
  title: "title",
  rate: "rate",
  length: "length",
  updated: "updated",
};

/**
 * Sort cycle on header click: asc → desc → none (no-sort, falls back to
 * the default `updated DESC` on the server).
 */
function nextSortState(
  cur: { key?: SortKey; dir?: SortDir },
  clicked: SortKey,
): { key: SortKey | null; dir: SortDir | null } {
  if (cur.key !== clicked) return { key: clicked, dir: "asc" };
  if (cur.dir === "asc") return { key: clicked, dir: "desc" };
  if (cur.dir === "desc") return { key: null, dir: null };
  return { key: clicked, dir: "asc" };
}

function fmtUpdated(iso: string): string {
  // "MM/DD" from the ISO timestamp — matches design output (e.g. "04/18").
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(5, 10).replace("-", "/");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

export default function FilmsTable({
  rows,
  sparklines,
  selected,
  onToggle,
  onToggleAll,
  sort,
  dir,
}: FilmsTableProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const sparkMap = new Map(sparklines);

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someChecked = !allChecked && rows.some((r) => selected.has(r.id));

  const onSort = useCallback(
    (clicked: SortKey) => {
      const next = nextSortState({ key: sort, dir }, clicked);
      const params = new URLSearchParams(sp.toString());
      if (next.key && next.dir) {
        params.set("sort", next.key);
        params.set("dir", next.dir);
      } else {
        params.delete("sort");
        params.delete("dir");
      }
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `/films?${qs}` : "/films", { scroll: false });
    },
    [sort, dir, sp, router],
  );

  return (
    <div className="fl-tablewrap">
      <table className="fl-table">
        <thead>
          <tr>
            <th style={{ width: 36, paddingRight: 0 }}>
              <Check
                checked={allChecked}
                mixed={someChecked}
                onChange={() => onToggleAll(!allChecked)}
                ariaLabel="Select all visible rows"
              />
            </th>
            <th style={{ width: 54 }} aria-sort={ariaSortFor("id", sort, dir)}>
              <ColHead
                label="ID"
                sortKey="id"
                sort={sort}
                dir={dir}
                onSort={onSort}
              />
            </th>
            <th>
              <ColHead
                label="Title"
                sortKey="title"
                sort={sort}
                dir={dir}
                onSort={onSort}
              />
            </th>
            <th style={{ width: 400 }}>Category</th>
            <th style={{ width: 70 }}>Rating</th>
            <th
              style={{ width: 70 }}
              aria-sort={ariaSortFor("length", sort, dir)}
            >
              <ColHead
                label="Length"
                sortKey="length"
                sort={sort}
                dir={dir}
                onSort={onSort}
              />
            </th>
            <th style={{ width: 90 }} aria-sort={ariaSortFor("rate", sort, dir)}>
              <ColHead
                label="Rate"
                sortKey="rate"
                sort={sort}
                dir={dir}
                onSort={onSort}
              />
            </th>
            <th style={{ width: 110 }}>Inventory</th>
            <th style={{ width: 70 }}>Demand</th>
            <th
              style={{ width: 110 }}
              aria-sort={ariaSortFor("updated", sort, dir)}
            >
              <ColHead
                label="Last updated"
                sortKey="updated"
                sort={sort}
                dir={dir}
                onSort={onSort}
              />
            </th>
            <th style={{ width: 32 }} aria-label="Row actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => {
            const isSel = selected.has(f.id);
            const spark = sparkMap.get(f.id) ?? [];
            return (
              <tr
                key={f.id}
                className={`fl-row${isSel ? " is-selected" : ""}`}
                data-selected={isSel ? "1" : ""}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <Check
                    checked={isSel}
                    onChange={() => onToggle(f.id)}
                    ariaLabel={`Select ${f.title}`}
                  />
                </td>
                <td>
                  <span className="fl-id mono">
                    #{String(f.id).padStart(3, "0")}
                  </span>
                </td>
                <td>
                  <Link
                    href={`/films/${f.id}`}
                    className="fl-rowlink"
                    aria-label={`Open ${f.title}`}
                  >
                    <div className="fl-titlecell">
                      <div className="fl-poster">FILM</div>
                      <div style={{ minWidth: 0 }}>
                        <div className="ttl">{f.title}</div>
                        <div className="meta">
                          {f.actors} actors · {f.lang}
                        </div>
                      </div>
                    </div>
                  </Link>
                </td>
                <td>
                  {f.categories.length === 0 ? (
                    <span style={{ color: "var(--text-soft)" }}>—</span>
                  ) : (
                    <div className="fl-cat-list">
                      {f.categories.map((c) => (
                        <CategoryChip key={c} value={c} />
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  <Rating value={f.rating} />
                </td>
                <td>
                  <span className="mono" style={{ color: "var(--text-muted)" }}>
                    {f.length} min
                  </span>
                </td>
                <td>
                  <InlineEditRate id={f.id} initialRate={f.rate} />
                </td>
                <td>
                  <StockBar count={f.inventory} max={8} />
                </td>
                <td>
                  {spark.length >= 2 ? (
                    <Sparkline data={spark} width={56} height={20} />
                  ) : (
                    <span style={{ color: "var(--text-soft)" }}>—</span>
                  )}
                </td>
                <td>
                  <span style={{ color: "var(--text-soft)", fontSize: 11.5 }}>
                    {fmtUpdated(f.updated)}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <Btn
                    size="sm"
                    variant="ghost"
                    iconOnly
                    aria-label={`More actions for ${f.title}`}
                  >
                    <Icon name="more" size={14} />
                  </Btn>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr className="fl-row">
              <td colSpan={11} style={{ textAlign: "center", padding: 24 }}>
                <span style={{ color: "var(--text-soft)" }}>
                  No films match your filters.
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ariaSortFor(
  col: SortKey,
  sort?: SortKey,
  dir?: SortDir,
): "ascending" | "descending" | "none" {
  if (sort !== col) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

function ColHead({
  label,
  sortKey,
  sort,
  dir,
  onSort,
  align,
}: {
  label: string;
  sortKey: SortKey;
  sort?: SortKey;
  dir?: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort === sortKey;
  const _ignore = SORTABLE[sortKey]; // type-check exhaust
  void _ignore;
  return (
    <button
      type="button"
      className="colhead"
      data-active={active ? "1" : ""}
      onClick={() => onSort(sortKey)}
      style={{ justifyContent: align === "right" ? "flex-end" : "flex-start" }}
    >
      <span>{label}</span>
      {active && dir === "asc" ? (
        <Icon name="arrowUp" size={11} />
      ) : active && dir === "desc" ? (
        <Icon name="arrowDown" size={11} />
      ) : (
        <Icon name="chevUpDown" size={11} style={{ opacity: 0.4 }} />
      )}
    </button>
  );
}
