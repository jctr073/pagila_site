"use client";

/**
 * Customers section of StoreDrawer, extracted as a client island so the
 * "Load more" button can append additional pages via
 * GET /api/stores/[id]/customers without leaving the drawer.
 */

import { useState } from "react";

import { Avatar, Chip, Icon } from "@/components/ui";
import type { CustomerSummary } from "@/lib/types";

const TONE_CYCLE = ["accent", "teal", "violet", "success"] as const;
type Tone = (typeof TONE_CYCLE)[number];
function toneForIndex(i: number): Tone {
  return TONE_CYCLE[i % TONE_CYCLE.length]!;
}

function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return ((parts[0]![0] ?? "") + (parts[parts.length - 1]![0] ?? "")).toUpperCase();
}

function relTime(iso: string | null): string {
  if (!iso) return "never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export type StoreCustomersSectionProps = {
  storeId: number;
  total: number;
  initial: CustomerSummary[];
  /** Number of rows to request per "Load more" click. */
  pageSize?: number;
};

export default function StoreCustomersSection({
  storeId,
  total,
  initial,
  pageSize = 12,
}: StoreCustomersSectionProps) {
  const [customers, setCustomers] = useState<CustomerSummary[]>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = customers.length < total;

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/stores/${storeId}/customers?offset=${customers.length}&limit=${pageSize}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { customers: CustomerSummary[] } = await res.json();
      setCustomers((prev) => dedupe([...prev, ...data.customers]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to load");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="drw-sec">
      <h4>
        Customers <span className="pill">{total.toLocaleString()} total</span>
      </h4>
      <div className="sd-custwrap">
        <table className="sd-custtable">
          <thead>
            <tr>
              <th>Customer</th>
              <th style={{ width: 70 }}>Rentals</th>
              <th style={{ width: 90 }}>Last</th>
              <th style={{ width: 70 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={c.id}>
                <td>
                  <div className="nm-cell">
                    <Avatar
                      initials={customerInitials(c.name)}
                      tone={toneForIndex(i)}
                      size={24}
                      name={c.name}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div className="nm">{c.name}</div>
                      {c.email && <div className="em">{c.email}</div>}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="mono" style={{ fontSize: 11.5 }}>
                    {c.rentals}
                  </span>
                </td>
                <td>
                  <span style={{ color: "var(--text-soft)", fontSize: 11 }}>
                    {relTime(c.lastRented)}
                  </span>
                </td>
                <td>
                  {c.active ? (
                    <Chip tone="success" dot>
                      Active
                    </Chip>
                  ) : (
                    <Chip>Off</Chip>
                  )}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 16, textAlign: "center" }}>
                  <span style={{ color: "var(--text-soft)" }}>
                    No customers on file for this store.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="sd-custfoot">
          Showing {customers.length} of {total.toLocaleString()}
          {error && (
            <span style={{ color: "var(--danger, #c53030)", marginLeft: 8 }}>
              · {error}
            </span>
          )}
          <div style={{ flex: 1 }} />
          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="pa-link-row"
              style={{
                background: "none",
                border: 0,
                padding: 0,
                cursor: loading ? "default" : "pointer",
                font: "inherit",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Loading…" : "Load more customers"}{" "}
              <Icon name="arrowRight" size={11} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function dedupe(rows: CustomerSummary[]): CustomerSummary[] {
  const seen = new Set<number>();
  const out: CustomerSummary[] = [];
  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}
