import { Avatar, Btn, Chip, Icon } from "@/components/ui";
import type { StoreRow } from "@/lib/types";

export type StoreCardRibbonTone = "accent" | "teal";

export type StoreCardProps = {
  store: StoreRow;
  ribbonTone: StoreCardRibbonTone;
};

/**
 * Derive initials for the manager avatar from a full name.
 * Falls back to the first 2 characters of a single word.
 */
function managerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return ((parts[0]![0] ?? "") + (parts[parts.length - 1]![0] ?? "")).toUpperCase();
}

/**
 * Per-country presentation hints. Pagila ships two stores: one in
 * Lethbridge (Canada) and one in Woodridge (Australia). The design
 * artboard hard-codes time zones and phone formats for these two cities;
 * we keep that here so the cards match the prototype pixel-for-pixel.
 *
 * Phone is replaced with the real `store.phone` value when available
 * (Pagila's `address.phone` column is populated for both stores).
 */
function timeZoneLabel(country: string): string {
  if (country === "Canada") return "America/Edmonton (MDT)";
  if (country === "Australia") return "Australia/Brisbane (AEST)";
  return "—";
}

/**
 * StoreCard — pa-card with a colored top-left ribbon, header (store
 * avatar + city/country + Open chip), 3-cell stat strip, four detail
 * rows, and a dashed manager card at the bottom.
 *
 * Class names ported verbatim from
 * design_handoff_pagila_admin/designs/stores-staff.jsx (`st-card`,
 * `st-head`, `st-strip`, `st-row`, `st-mgr`). CSS in
 * src/app/_stores.css.
 *
 * Server-renderable; no client hooks. The "edit hours" pencil button
 * is a presentation-only stub for Phase 9 (no opening-hours table
 * exists in Pagila — see README §4.5).
 */
export default function StoreCard({ store, ribbonTone }: StoreCardProps) {
  // README §4.5 calls for hardcoded "Open" status and "2 min ago" last-sync.
  // Pagila stores no opening-hours / sync metadata so we surface plausible
  // placeholders that match the design canvas.
  const hours = "Mon–Sat 9a–9p · Sun 11a–7p";
  const lastSync = "2 min ago";

  return (
    <div className="pa-card st-card">
      <span
        className={`st-ribbon st-ribbon--${ribbonTone}`}
        aria-hidden="true"
      />

      <div className="st-head">
        <div
          className="st-head-avatar"
          data-tone={ribbonTone === "teal" ? "teal" : ""}
          aria-hidden="true"
        >
          <Icon name="store" size={22} />
        </div>
        <div className="st-head-body">
          <div className="st-head-id">STORE #{store.id}</div>
          <h3 className="st-head-title">
            {store.city}, {store.country}
          </h3>
          <div className="st-head-addr">{store.address}</div>
        </div>
        <Chip tone="success" dot>
          Open
        </Chip>
      </div>

      <div className="st-strip" role="group" aria-label="Store rollups">
        <div className="st-strip-cell">
          <div className="lbl">Inventory</div>
          <div className="v">
            {store.inventory.toLocaleString()}
            <small>units</small>
          </div>
        </div>
        <div className="st-strip-cell">
          <div className="lbl">Active rentals</div>
          <div className="v">{store.activeRentals.toLocaleString()}</div>
        </div>
        <div className="st-strip-cell">
          <div className="lbl">Staff</div>
          <div className="v">
            {store.staff}
            <small>active</small>
          </div>
        </div>
      </div>

      <div className="st-rows">
        <div className="st-row">
          <span className="k">Hours</span>
          <span className="v mono">{hours}</span>
          {/* Stub: opening hours aren't in Pagila; wire to a settings table later. */}
          <Btn
            size="sm"
            variant="ghost"
            iconOnly
            leftIcon="pencil"
            aria-label="Edit hours"
          />
        </div>
        <div className="st-row">
          <span className="k">Time zone</span>
          <span className="v">{timeZoneLabel(store.country)}</span>
        </div>
        <div className="st-row">
          <span className="k">Phone</span>
          <span className="v mono">{store.phone}</span>
        </div>
        <div className="st-row">
          <span className="k">Last sync</span>
          <span className="v">
            <span className="dot" aria-hidden="true" />
            {lastSync}
          </span>
        </div>
      </div>

      <div className="st-mgr">
        <Avatar
          initials={managerInitials(store.manager)}
          tone={ribbonTone === "teal" ? "teal" : "accent"}
          size={36}
          name={store.manager}
        />
        <div className="body">
          <b>{store.manager}</b>
          <span>Store manager &middot; {store.managerEmail}</span>
        </div>
        <Btn size="sm" variant="ghost" rightIcon="arrow-right">
          View
        </Btn>
      </div>
    </div>
  );
}
