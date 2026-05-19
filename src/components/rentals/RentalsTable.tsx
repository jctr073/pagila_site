"use client";

/**
 * RentalsTable — sortable, selectable rentals list.
 *
 * Sort lives in the URL; clicking a header pushes the next state via
 * `router.push` with `scroll: false`. The film cell wraps a `<Link
 * href="/rentals/[id]">` so the intercepting `@drawer/(.)[id]` route
 * opens as an overlay; cold loads of `/rentals/[id]` fall through to
 * the standalone page.
 */

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Avatar, Btn, Check, Chip, Icon } from "@/components/ui";
import type { ChipTone } from "@/components/ui/Chip";
import type { RentalRow, RentalStatus } from "@/lib/types";

export type RentalsSortKey =
  | "id"
  | "rented"
  | "due"
  | "film"
  | "customer"
  | "store"
  | "staff"
  | "status";
export type RentalsSortDir = "asc" | "desc";

export type RentalsTableProps = {
  rows: RentalRow[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: (next: boolean) => void;
  sort?: RentalsSortKey;
  dir?: RentalsSortDir;
};

const STATUS_LABEL: Record<RentalStatus, string> = {
  open: "Open",
  overdue: "Overdue",
  returned: "Returned",
};

const STATUS_TONE: Record<RentalStatus, ChipTone> = {
  open: "accent",
  overdue: "warning",
  returned: "success",
};

function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (
    (parts[0]![0] ?? "") + (parts[parts.length - 1]![0] ?? "")
  ).toUpperCase();
}

const AVATAR_CYCLE = ["accent", "teal", "violet", "success"] as const;
type Tone = (typeof AVATAR_CYCLE)[number];
function toneForCustomer(id: number): Tone {
  return AVATAR_CYCLE[id % AVATAR_CYCLE.length]!;
}

function nextSortState(
  cur: { key?: RentalsSortKey; dir?: RentalsSortDir },
  clicked: RentalsSortKey,
): { key: RentalsSortKey | null; dir: RentalsSortDir | null } {
  if (cur.key !== clicked) return { key: clicked, dir: "desc" };
  if (cur.dir === "desc") return { key: clicked, dir: "asc" };
  if (cur.dir === "asc") return { key: null, dir: null };
  return { key: clicked, dir: "desc" };
}

function ariaSortFor(
  col: RentalsSortKey,
  sort?: RentalsSortKey,
  dir?: RentalsSortDir,
): "ascending" | "descending" | "none" {
  if (sort !== col) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso.slice(0, 10), time: "" };
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 16);
  return { date, time };
}

export default function RentalsTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  sort,
  dir,
}: RentalsTableProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someChecked = !allChecked && rows.some((r) => selected.has(r.id));

  const onSort = useCallback(
    (clicked: RentalsSortKey) => {
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
      router.push(qs ? `/rentals?${qs}` : "/rentals", { scroll: false });
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
                ariaLabel="Select all rentals"
              />
            </th>
            <th style={{ width: 64 }} aria-sort={ariaSortFor("id", sort, dir)}>
              <ColHead label="ID" sortKey="id" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th aria-sort={ariaSortFor("film", sort, dir)}>
              <ColHead label="Film" sortKey="film" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 220 }} aria-sort={ariaSortFor("customer", sort, dir)}>
              <ColHead label="Customer" sortKey="customer" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 140 }} aria-sort={ariaSortFor("store", sort, dir)}>
              <ColHead label="Store" sortKey="store" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 120 }} aria-sort={ariaSortFor("rented", sort, dir)}>
              <ColHead label="Rented" sortKey="rented" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 110 }} aria-sort={ariaSortFor("due", sort, dir)}>
              <ColHead label="Due" sortKey="due" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 110 }} aria-sort={ariaSortFor("status", sort, dir)}>
              <ColHead label="Status" sortKey="status" sort={sort} dir={dir} onSort={onSort} />
            </th>
            <th style={{ width: 32 }} aria-label="Row actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isSel = selected.has(r.id);
            const rented = formatDateTime(r.rentedAt);
            const tone = toneForCustomer(r.customerId);
            return (
              <tr
                key={r.id}
                className={`fl-row${isSel ? " is-selected" : ""}`}
                data-selected={isSel ? "1" : ""}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <Check
                    checked={isSel}
                    onChange={() => onToggle(r.id)}
                    ariaLabel={`Select rental ${r.id}`}
                  />
                </td>
                <td>
                  <span className="fl-id mono">
                    #{String(r.id).padStart(5, "0")}
                  </span>
                </td>
                <td>
                  <Link
                    href={`/rentals/${r.id}`}
                    className="fl-rowlink"
                    aria-label={`Open rental ${r.id}: ${r.filmTitle}`}
                  >
                    <div className="rt-filmcell">
                      <div className="ico" aria-hidden="true">
                        <Icon name="film" size={14} />
                      </div>
                      <div className="body">
                        <div className="ttl">{r.filmTitle}</div>
                        <div className="meta">
                          <span className="mono">${r.filmRate.toFixed(2)}</span>
                          {" · "}
                          {r.filmDurationDays}-day rental
                        </div>
                      </div>
                    </div>
                  </Link>
                </td>
                <td>
                  <div className="rt-custcell">
                    <Avatar
                      initials={customerInitials(r.customerName)}
                      tone={tone}
                      size={24}
                      name={r.customerName}
                    />
                    <div className="body">
                      <div className="nm">{r.customerName}</div>
                      <div className="em">{r.customerEmail ?? "—"}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="rt-storecell">
                    <span className="mono code">#{r.storeId}</span>
                    <span>{r.storeName?.trim() || r.storeCity}</span>
                  </div>
                </td>
                <td>
                  <div className="mono" style={{ fontSize: 12.5 }}>
                    {rented.date}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 11, color: "var(--text-soft)" }}
                  >
                    {rented.time}
                  </div>
                </td>
                <td>
                  <div className="mono" style={{ fontSize: 12.5 }}>
                    {r.dueOn}
                  </div>
                </td>
                <td>
                  <Chip tone={STATUS_TONE[r.status]} dot>
                    {STATUS_LABEL[r.status]}
                  </Chip>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <Btn
                    size="sm"
                    variant="ghost"
                    iconOnly
                    aria-label={`More actions for rental ${r.id}`}
                  >
                    <Icon name="more" size={14} />
                  </Btn>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr className="fl-row">
              <td colSpan={9} style={{ textAlign: "center", padding: 24 }}>
                <span style={{ color: "var(--text-soft)" }}>
                  No rentals match your filters.
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
  sortKey: RentalsSortKey;
  sort?: RentalsSortKey;
  dir?: RentalsSortDir;
  onSort: (k: RentalsSortKey) => void;
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
