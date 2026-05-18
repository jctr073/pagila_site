"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Btn, Icon } from "@/components/ui";
import type { CategoryListRow } from "@/lib/types";

import InlineEditName from "./InlineEditName";

export type CategoriesSortKey = "id" | "name" | "films" | "updated";
export type CategoriesSortDir = "asc" | "desc";

export type CategoriesTableProps = {
  rows: CategoryListRow[];
  sort?: CategoriesSortKey;
  dir?: CategoriesSortDir;
  onDelete: (row: CategoryListRow) => void;
};

function nextSortState(
  cur: { key?: CategoriesSortKey; dir?: CategoriesSortDir },
  clicked: CategoriesSortKey,
): { key: CategoriesSortKey | null; dir: CategoriesSortDir | null } {
  if (cur.key !== clicked) return { key: clicked, dir: "asc" };
  if (cur.dir === "asc") return { key: clicked, dir: "desc" };
  if (cur.dir === "desc") return { key: null, dir: null };
  return { key: clicked, dir: "asc" };
}

function ariaSortFor(
  col: CategoriesSortKey,
  sort?: CategoriesSortKey,
  dir?: CategoriesSortDir,
): "ascending" | "descending" | "none" {
  if (sort !== col) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function CategoriesTable({
  rows,
  sort,
  dir,
  onDelete,
}: CategoriesTableProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const onSort = useCallback(
    (clicked: CategoriesSortKey) => {
      const next = nextSortState({ key: sort, dir }, clicked);
      const params = new URLSearchParams(sp.toString());
      if (next.key && next.dir) {
        params.set("sort", next.key);
        params.set("dir", next.dir);
      } else {
        params.delete("sort");
        params.delete("dir");
      }
      const qs = params.toString();
      router.push(qs ? `/categories?${qs}` : "/categories", { scroll: false });
    },
    [sort, dir, sp, router],
  );

  return (
    <div className="fl-tablewrap">
      <table className="fl-table">
        <thead>
          <tr>
            <th style={{ width: 64 }} aria-sort={ariaSortFor("id", sort, dir)}>
              <ColHead label="ID" sortKey="id" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th aria-sort={ariaSortFor("name", sort, dir)}>
              <ColHead label="Name" sortKey="name" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th
              style={{ width: 110 }}
              aria-sort={ariaSortFor("films", sort, dir)}
            >
              <ColHead label="Films" sortKey="films" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th
              style={{ width: 140 }}
              aria-sort={ariaSortFor("updated", sort, dir)}
            >
              <ColHead label="Last update" sortKey="updated" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 48 }} aria-label="Row actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="fl-row">
              <td>
                <span className="fl-id mono">
                  #{String(c.id).padStart(3, "0")}
                </span>
              </td>
              <td>
                <InlineEditName id={c.id} initialName={c.name} />
              </td>
              <td>
                <span className="mono" style={{ fontWeight: 500 }}>
                  {c.filmCount.toLocaleString()}
                </span>
              </td>
              <td>
                <span style={{ color: "var(--text-muted)", fontSize: 12.5 }}>
                  {formatDate(c.lastUpdate)}
                </span>
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <Btn
                  size="sm"
                  variant="danger-ghost"
                  iconOnly
                  aria-label={`Delete ${c.name}`}
                  onClick={() => onDelete(c)}
                >
                  <Icon name="trash" size={14} />
                </Btn>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr className="fl-row">
              <td colSpan={5} style={{ textAlign: "center", padding: 24 }}>
                <span style={{ color: "var(--text-soft)" }}>
                  No categories yet.
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ColHead({
  label,
  sortKey,
  sort,
  dir,
  onSort,
}: {
  label: string;
  sortKey: CategoriesSortKey;
  sort?: CategoriesSortKey;
  dir?: CategoriesSortDir;
  onSort: (k: CategoriesSortKey) => void;
}) {
  const active = sort === sortKey;
  return (
    <button
      type="button"
      className="colhead"
      data-active={active ? "1" : ""}
      onClick={() => onSort(sortKey)}
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
