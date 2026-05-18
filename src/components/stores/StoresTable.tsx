"use client";

/**
 * StoresTable — sortable, selectable table for /stores. Ported from
 * designs/stores-staff.jsx#StoresListScreen `<table>` block.
 *
 * Sort lives in the URL; clicking a header pushes the next state via
 * `router.push` with `scroll: false` (same pattern as FilmsTable). The
 * location cell wraps `<Link href="/stores/[id]">` so client navigation
 * triggers the intercepted drawer route.
 */

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Avatar, Btn, Check, Chip, Icon } from "@/components/ui";
import type { StoreListRow } from "@/lib/types";

export type StoresSortKey =
  | "id"
  | "city"
  | "country"
  | "address"
  | "inventory"
  | "customers"
  | "staff";
export type StoresSortDir = "asc" | "desc";

export type StoresTableProps = {
  rows: StoreListRow[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: (next: boolean) => void;
  sort?: StoresSortKey;
  dir?: StoresSortDir;
};

function nextSortState(
  cur: { key?: StoresSortKey; dir?: StoresSortDir },
  clicked: StoresSortKey,
): { key: StoresSortKey | null; dir: StoresSortDir | null } {
  if (cur.key !== clicked) return { key: clicked, dir: "asc" };
  if (cur.dir === "asc") return { key: clicked, dir: "desc" };
  if (cur.dir === "desc") return { key: null, dir: null };
  return { key: clicked, dir: "asc" };
}

function ariaSortFor(
  col: StoresSortKey,
  sort?: StoresSortKey,
  dir?: StoresSortDir,
): "ascending" | "descending" | "none" {
  if (sort !== col) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

function managerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (
    (parts[0]![0] ?? "") + (parts[parts.length - 1]![0] ?? "")
  ).toUpperCase();
}

const TONE_CYCLE = ["accent", "teal", "violet", "success"] as const;
type Tone = (typeof TONE_CYCLE)[number];

function toneForStore(id: number): Tone {
  return TONE_CYCLE[id % TONE_CYCLE.length]!;
}

export default function StoresTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  sort,
  dir,
}: StoresTableProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someChecked = !allChecked && rows.some((r) => selected.has(r.id));

  const onSort = useCallback(
    (clicked: StoresSortKey) => {
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
      router.push(qs ? `/stores?${qs}` : "/stores", { scroll: false });
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
                ariaLabel="Select all stores"
              />
            </th>
            <th style={{ width: 54 }} aria-sort={ariaSortFor("id", sort, dir)}>
              <ColHead label="ID" sortKey="id" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th aria-sort={ariaSortFor("city", sort, dir)}>
              <ColHead label="Location" sortKey="city" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 220 }} aria-sort={ariaSortFor("address", sort, dir)}>
              <ColHead label="Address" sortKey="address" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 180 }}>Manager</th>
            <th style={{ width: 100 }} aria-sort={ariaSortFor("inventory", sort, dir)}>
              <ColHead label="Inventory" sortKey="inventory" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 90 }} aria-sort={ariaSortFor("customers", sort, dir)}>
              <ColHead label="Customers" sortKey="customers" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 70 }} aria-sort={ariaSortFor("staff", sort, dir)}>
              <ColHead label="Staff" sortKey="staff" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 90 }}>Status</th>
            <th style={{ width: 32 }} aria-label="Row actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const isSel = selected.has(s.id);
            const tone = toneForStore(s.id);
            // Status is hardcoded "Open" for now — Pagila has no status column.
            return (
              <tr
                key={s.id}
                className={`fl-row${isSel ? " is-selected" : ""}`}
                data-selected={isSel ? "1" : ""}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <Check
                    checked={isSel}
                    onChange={() => onToggle(s.id)}
                    ariaLabel={`Select ${s.city}`}
                  />
                </td>
                <td>
                  <span className="fl-id mono">
                    #{String(s.id).padStart(3, "0")}
                  </span>
                </td>
                <td>
                  <Link
                    href={`/stores/${s.id}`}
                    className="fl-rowlink"
                    aria-label={`Open ${s.name ?? s.city}, ${s.country}`}
                  >
                    <div className="sl-storecell">
                      <div className="ico" data-tone={tone} aria-hidden="true">
                        <span style={{ position: "relative", zIndex: 1 }}>
                          #{s.id}
                        </span>
                      </div>
                      <div className="body">
                        <div className="ttl">
                          {s.name?.trim() || s.city}
                          <span className="flag">{s.countryCode}</span>
                        </div>
                        <div className="meta">
                          {s.city}, {s.country} · {s.district}
                        </div>
                      </div>
                    </div>
                  </Link>
                </td>
                <td>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.address}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 11, color: "var(--text-soft)" }}
                  >
                    {s.postal ?? "—"}
                  </div>
                </td>
                <td>
                  <div className="sl-mgrcell">
                    <Avatar
                      initials={managerInitials(s.manager)}
                      tone={tone}
                      size={24}
                      name={s.manager}
                    />
                    <span className="nm">{s.manager}</span>
                  </div>
                </td>
                <td>
                  <span className="mono" style={{ fontWeight: 500 }}>
                    {s.inventory.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span className="mono" style={{ color: "var(--text-muted)" }}>
                    {s.customers.toLocaleString()}
                  </span>
                </td>
                <td>
                  <span className="mono">{s.staff}</span>
                </td>
                <td>
                  <Chip tone="success" dot>
                    Open
                  </Chip>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <Btn
                    size="sm"
                    variant="ghost"
                    iconOnly
                    aria-label={`More actions for ${s.city}`}
                  >
                    <Icon name="more" size={14} />
                  </Btn>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr className="fl-row">
              <td colSpan={10} style={{ textAlign: "center", padding: 24 }}>
                <span style={{ color: "var(--text-soft)" }}>
                  No stores match your filters.
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
  sortKey: StoresSortKey;
  sort?: StoresSortKey;
  dir?: StoresSortDir;
  onSort: (k: StoresSortKey) => void;
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
