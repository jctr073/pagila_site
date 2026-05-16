/**
 * FilmDrawer — read-only deep dive on a single film.
 *
 * Server-renderable. Receives fully-fetched data via props; renders the
 * 460px drawer body as ported from
 *   design_handoff_pagila_admin/designs/film-detail.jsx
 *   #FilmDetailDrawer
 *
 * The footer "Edit film" button is the one interactive element — handled
 * via a plain <Link>, which integrates naturally with the intercepting
 * route (`/films/[id]/edit`).
 *
 * Note: the slide-in animation, scrim, Esc handler, and Close-button
 * `router.back()` wiring live in <FilmDrawerShell> (a client component).
 * This file stays a server component so the heavy parts (Cast list,
 * Inventory table) are pre-rendered.
 */

import Link from "next/link";

import Avatar from "@/components/ui/Avatar";
import Btn from "@/components/ui/Btn";
import CategoryChip from "@/components/ui/CategoryChip";
import Chip from "@/components/ui/Chip";
import Icon from "@/components/ui/Icon";
import Rating from "@/components/ui/Rating";
import Sparkline from "@/components/ui/Sparkline";
import { storeLabel } from "@/lib/storeLabels";
import type {
  FilmCastMember,
  FilmDetail,
  FilmInventoryByStore,
} from "@/lib/types";

import DrawerCloseButton from "./DrawerCloseButton";

export type FilmDrawerProps = {
  film: FilmDetail;
  inventory: FilmInventoryByStore[];
  cast: FilmCastMember[];
  perf: {
    cur30d: number;
    prev30d: number;
    deltaPct: number | null;
  };
  /** When `true`, render the standalone (non-overlay) variant. */
  standalone?: boolean;
  /** Optional fake sparkline data when DB returns nothing (rare films). */
  spark?: number[];
};

function fmtMmDdYyyy(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

function initialsOf(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export default function FilmDrawer({
  film,
  inventory,
  cast,
  perf,
  standalone = false,
  spark,
}: FilmDrawerProps) {
  const totalUnits = inventory.reduce((acc, r) => acc + r.units, 0);
  const idStr = String(film.id).padStart(3, "0");

  // Synthetic sparkline if real data isn't passed in — the drawer should
  // never look empty. 12 zero-ish points keeps the area path benign.
  const sparkData =
    spark && spark.length >= 2
      ? spark
      : [3, 5, 4, 6, 4, 7, 5, 8, 6, 9, 7, perf.cur30d];

  const deltaPct = perf.deltaPct;
  const deltaSign = deltaPct === null ? "" : deltaPct >= 0 ? "+" : "";
  const deltaTone: "success" | "danger" =
    deltaPct === null ? "success" : deltaPct >= 0 ? "success" : "danger";

  return (
    <article className={standalone ? "drw drw-standalone" : "drw"}>
      {/* ── Header bar ────────────────────────────────────────────── */}
      <header className="drw-head">
        <span className="drw-id mono">#{idStr}</span>
        <Chip tone="success" dot>
          Active
        </Chip>
        <div className="nav">
          {/* TODO(v2): prev/next require the filtered list ordering from
              the films page; out of scope for MVP — render but no-op. */}
          <Btn size="sm" variant="ghost" iconOnly aria-label="Previous film" disabled>
            <Icon name="chevLeft" size={14} />
          </Btn>
          <Btn size="sm" variant="ghost" iconOnly aria-label="Next film" disabled>
            <Icon name="chevRight" size={14} />
          </Btn>
          <div style={{ width: 8 }} />
          <Btn size="sm" variant="ghost" iconOnly aria-label="Preview">
            <Icon name="eye" size={14} />
          </Btn>
          <Btn size="sm" variant="ghost" iconOnly aria-label="More actions">
            <Icon name="more" size={14} />
          </Btn>
          <DrawerCloseButton
            iconOnly
            fallbackHref="/films"
            aria-label="Close drawer"
          >
            <Icon name="x" size={14} />
          </DrawerCloseButton>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="drw-hero">
        <div className="drw-poster">
          POSTER
          <br />
          88×120
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>{film.title}</h2>
          <div className="sub">
            <b>{film.year}</b> · <Rating value={film.rating} /> ·{" "}
            <b>{film.length} min</b> · {film.lang}
          </div>
          <div className="drw-tags">
            <CategoryChip value={film.category} />
            {film.features.map((x) => (
              <Chip key={x}>{x}</Chip>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────── */}
      <div className="drw-body">
        {/* Synopsis */}
        <section className="drw-sec">
          <h4>Synopsis</h4>
          <p className="drw-syn">{film.desc || "No synopsis available."}</p>
        </section>

        {/* Catalog details */}
        <section className="drw-sec">
          <h4>Catalog details</h4>
          <div className="drw-kv">
            <div>
              <div className="k">Rental rate</div>
              <div className="v mono">${film.rate.toFixed(2)} / day</div>
            </div>
            <div>
              <div className="k">Replacement cost</div>
              <div className="v mono">${film.replace.toFixed(2)}</div>
            </div>
            <div>
              <div className="k">Rental duration</div>
              <div className="v mono">{film.durationDays} days</div>
            </div>
            <div>
              <div className="k">Original language</div>
              <div className="v">{film.originalLang ?? "—"}</div>
            </div>
            <div>
              <div className="k">Last updated</div>
              <div className="v mono">{fmtMmDdYyyy(film.updated)}</div>
            </div>
            <div>
              <div className="k">Updated by</div>
              <div className="v author">
                <Avatar initials="DA" tone="teal" size={20} /> Diego A.
              </div>
            </div>
          </div>
        </section>

        {/* Inventory */}
        <section className="drw-sec">
          <h4>
            Inventory <span className="pill">{totalUnits} units</span>
            <Link
              href={`/films/${film.id}/add-inventory`}
              aria-label="Add stock"
              style={{ marginLeft: "auto" }}
            >
              <Btn size="sm" variant="ghost" leftIcon="plus">
                Add stock
              </Btn>
            </Link>
          </h4>
          <div className="drw-inv">
            <div className="drw-inv-row">
              <div>Store</div>
              <div>Units</div>
              <div>Out</div>
            </div>
            {inventory.map((row) => {
              const meta = storeLabel(row.store_id);
              return (
                <div key={row.store_id} className="drw-inv-row">
                  <div>
                    <Avatar
                      initials={`#${row.store_id}`}
                      tone={meta.tone}
                      size={20}
                    />{" "}
                    {meta.name}
                  </div>
                  <div className="mono">{row.units}</div>
                  <div className="mono" style={{ color: "var(--text-soft)" }}>
                    {row.out}
                  </div>
                </div>
              );
            })}
            {inventory.length === 0 && (
              <div className="drw-inv-row">
                <div style={{ color: "var(--text-soft)" }}>No stock</div>
                <div className="mono">0</div>
                <div className="mono">0</div>
              </div>
            )}
          </div>
        </section>

        {/* Cast */}
        <section className="drw-sec">
          <h4>
            Cast <span className="pill">{cast.length}</span>
          </h4>
          <div className="drw-cast">
            {cast.map((a) => {
              const initials = initialsOf(a.first_name, a.last_name);
              return (
                <span key={a.actor_id} className="actor">
                  <Avatar initials={initials} tone="violet" size={20} />
                  {a.first_name} {a.last_name}
                </span>
              );
            })}
            {cast.length === 0 && (
              <span style={{ color: "var(--text-soft)", fontSize: 12 }}>
                No cast on file.
              </span>
            )}
          </div>
        </section>

        {/* Rental performance */}
        <section className="drw-sec">
          <h4>Rental performance</h4>
          <div className="drw-perf">
            <div>
              <div className="big">{perf.cur30d}</div>
              <div className="sub">rentals · last 30d</div>
            </div>
            <div className="divider" />
            <Sparkline data={sparkData} width={120} height={36} />
            <div className="right">
              {deltaPct === null ? (
                <Chip tone="default">—</Chip>
              ) : (
                <Chip tone={deltaTone} dot>
                  {deltaSign}
                  {deltaPct}%
                </Chip>
              )}
              <div className="sub">vs prior 30d</div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer bar ────────────────────────────────────────────── */}
      <footer className="drw-foot">
        <Btn size="sm" variant="ghost" leftIcon="duplicate">
          Duplicate
        </Btn>
        <Btn size="sm" variant="ghost" leftIcon="archive">
          Archive
        </Btn>
        <div className="grow" />
        <DrawerCloseButton fallbackHref="/films">Close</DrawerCloseButton>
        <Link href={`/films/${film.id}/edit`} aria-label="Edit film">
          <Btn size="sm" variant="primary" leftIcon="pencil">
            Edit film
          </Btn>
        </Link>
      </footer>
    </article>
  );
}
