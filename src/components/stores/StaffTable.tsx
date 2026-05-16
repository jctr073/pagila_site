"use client";

import { useMemo, useState } from "react";
import { Avatar, Btn, Check, Chip } from "@/components/ui";
import type { StaffRow } from "@/lib/types";

export type StaffTableProps = {
  staff: StaffRow[];
};

/**
 * Format an ISO date string as `MM/DD/YY` (en-US, zero-padded), which
 * matches the design's mono "Started" column.
 */
function formatStartedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

/**
 * Map a Pagila store id to the chip city label baked into the
 * prototype. Pagila has only two stores (Lethbridge, Woodridge) so a
 * small lookup is the simplest path. Falls back to "Store #N" for any
 * unknown id so the cell still renders cleanly.
 */
function storeCityLabel(id: number): string {
  if (id === 1) return "Lethbridge";
  if (id === 2) return "Woodridge";
  return `Store #${id}`;
}

/**
 * StaffTable — Member / Store / Role / Status / Started / Rentals MTD
 * / Last active table inside the staff section card.
 *
 * Mirrors the inline `<table className="fl-table">` block in
 * design_handoff_pagila_admin/designs/stores-staff.jsx, but tightened
 * up: row selection lives in local state, tri-state header toggles
 * all-on / all-off, and the kebab is a stub for Phase 9.
 *
 * The "Last active" column is intentionally a dash placeholder.
 * Pagila's schema has no `last_active` field; the closest signal
 * would be `MAX(rental.rental_date)` per staff but the README §4.5
 * notes this is out-of-scope for the MVP — see TODO below.
 */
export default function StaffTable({ staff }: StaffTableProps) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  const allSelected = staff.length > 0 && selected.size === staff.length;
  const partiallySelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(staff.map((s) => s.id)));
  };

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Memoize the rendered rows so re-running the selection setter doesn't
  // re-derive labels / chips. Keys depend only on `staff`.
  const rows = useMemo(
    () =>
      staff.map((p) => ({
        ...p,
        startedFmt: formatStartedDate(p.started),
        storeCity: storeCityLabel(p.store),
      })),
    [staff],
  );

  return (
    <div className="staff-table-wrap">
      <table className="staff-table">
        <thead>
          <tr>
            <th scope="col" className="col-check">
              <Check
                checked={allSelected}
                mixed={partiallySelected}
                onChange={toggleAll}
                ariaLabel="Select all staff"
              />
            </th>
            <th scope="col">Member</th>
            <th scope="col" className="col-store">
              Store
            </th>
            <th scope="col" className="col-role">
              Role
            </th>
            <th scope="col" className="col-status">
              Status
            </th>
            <th scope="col" className="col-date">
              Started
            </th>
            <th scope="col" className="col-num">
              Rentals MTD
            </th>
            <th scope="col" className="col-active">
              Last active
            </th>
            <th scope="col" className="col-kebab" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => {
            const isSelected = selected.has(p.id);
            // Cycle accent tones for the member avatar — purely cosmetic.
            const tones = ["accent", "teal", "violet", "success"] as const;
            const tone = tones[i % tones.length]!;
            const storeTone = p.store === 1 ? "solid" : "teal";
            return (
              <tr key={p.id} data-selected={isSelected ? "1" : ""}>
                <td
                  className="col-check"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Check
                    checked={isSelected}
                    onChange={() => toggleOne(p.id)}
                    ariaLabel={`Select ${p.name}`}
                  />
                </td>
                <td>
                  <div className="staff-member">
                    <Avatar
                      initials={initials(p.name)}
                      tone={tone}
                      size={30}
                      name={p.name}
                    />
                    <div className="body">
                      <div className="ttl">{p.name}</div>
                      <div className="meta">
                        @{p.username} &middot; {p.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="col-store">
                  <Chip tone={storeTone} dot>
                    #{p.store} &middot; {p.storeCity}
                  </Chip>
                </td>
                <td className="col-role">
                  <Chip tone={p.role === "Manager" ? "violet" : "default"}>
                    {p.role}
                  </Chip>
                </td>
                <td className="col-status">
                  {p.active ? (
                    <Chip tone="success" dot>
                      Active
                    </Chip>
                  ) : (
                    <Chip tone="danger" dot>
                      Disabled
                    </Chip>
                  )}
                </td>
                <td className="col-date">
                  <span className="mono soft">{p.startedFmt}</span>
                </td>
                <td className="col-num">
                  <span className="mono">{p.rentalsMtd}</span>
                </td>
                <td className="col-active">
                  {/* TODO: derive from MAX(rental.rental_date) per staff if
                      we want a real "last active" signal — not in MVP. */}
                  <span className="soft" title="Not tracked in Pagila">
                    —
                  </span>
                </td>
                <td className="col-kebab">
                  <Btn
                    size="sm"
                    variant="ghost"
                    iconOnly
                    leftIcon="more-horiz"
                    aria-label={`Open actions for ${p.name}`}
                  />
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} style={{ padding: 24, textAlign: "center" }}>
                <span className="soft">No staff match the current filters.</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return ((parts[0]![0] ?? "") + (parts[parts.length - 1]![0] ?? "")).toUpperCase();
}
