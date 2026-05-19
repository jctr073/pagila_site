/**
 * StoreDrawer — read-only deep dive on a single store.
 *
 * Server-renderable. Receives fully-fetched data via props; renders the
 * 460px drawer body as ported from
 *   designs/stores-staff.jsx#StoreDetailDrawer
 *
 * Reuses the `drw-*` class hooks introduced for FilmDrawer (header,
 * hero, body, foot) plus a small set of store-specific `sd-*` classes
 * for the manager card, staff chips, and customers mini-table — see
 * src/app/_store-detail.css.
 */

import Link from "next/link";

import { Avatar, Btn, Chip, Icon, Sparkline } from "@/components/ui";
import DrawerCloseButton from "@/components/films/detail/DrawerCloseButton";
import type {
  CustomerSummary,
  StaffRow,
  StoreDetail,
} from "@/lib/types";

import StoreCustomersSection from "./StoreCustomersSection";

export type StoreDrawerProps = {
  store: StoreDetail;
  staff: StaffRow[];
  customers: CustomerSummary[];
  sparkline: number[];
  standalone?: boolean;
};

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
function toneForIndex(i: number): Tone {
  return TONE_CYCLE[i % TONE_CYCLE.length]!;
}

export default function StoreDrawer({
  store,
  staff,
  customers,
  sparkline,
  standalone = false,
}: StoreDrawerProps) {
  const s = store;
  const idStr = String(s.id).padStart(3, "0");
  const tone = toneForStore(s.id);
  const mgr = staff.find((p) => p.role === "Manager");
  const clerks = staff.filter((p) => p.role !== "Manager");
  const openedYear = s.opened.slice(0, 4);
  const totalStaff = (mgr ? 1 : 0) + clerks.length;
  const sparkData =
    sparkline.length >= 2 ? sparkline : [0, 0, 0, 0, 0, 0, s.rentals7d];

  return (
    <article className={standalone ? "drw drw-standalone" : "drw"}>
      <header className="drw-head">
        <span className="drw-id mono">#{idStr}</span>
        <Chip tone="success" dot>
          Open
        </Chip>
        <div className="nav">
          <Btn size="sm" variant="ghost" iconOnly aria-label="Previous store" disabled>
            <Icon name="chevLeft" size={14} />
          </Btn>
          <Btn size="sm" variant="ghost" iconOnly aria-label="Next store" disabled>
            <Icon name="chevRight" size={14} />
          </Btn>
          <div style={{ width: 8 }} />
          <Btn size="sm" variant="ghost" iconOnly aria-label="Preview">
            <Icon name="eye" size={14} />
          </Btn>
          <Btn size="sm" variant="ghost" iconOnly aria-label="More actions">
            <Icon name="more" size={14} />
          </Btn>
          <DrawerCloseButton iconOnly fallbackHref="/stores" aria-label="Close drawer">
            <Icon name="x" size={14} />
          </DrawerCloseButton>
        </div>
      </header>

      <div className="drw-hero">
        <div className="sd-store-ico" data-tone={tone} aria-hidden="true">
          <div
            style={{
              position: "relative",
              zIndex: 1,
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            <Icon name="store" size={26} />
            <div style={{ marginTop: 4, fontSize: 11 }}>
              #{String(s.id).padStart(2, "0")}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>{s.name?.trim() || `${s.city}, ${s.country}`}</h2>
          <div className="sub">
            <b>Store #{s.id}</b> · {s.city}, {s.country} · {s.countryCode} ·
            opened <b>{openedYear}</b>
          </div>
          <div className="drw-tags">
            <Chip tone={tone === "teal" ? "teal" : "accent"}>{s.district}</Chip>
            <Chip>{s.customers.toLocaleString()} customers</Chip>
            <Chip>{s.staff} staff</Chip>
          </div>
        </div>
      </div>

      <div className="drw-body">
        <section className="drw-sec">
          <h4>Address</h4>
          <p
            className="drw-syn"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12.5,
              lineHeight: 1.6,
            }}
          >
            {s.address}
            {s.address2 ? `, ${s.address2}` : ""}
            <br />
            {s.city}, {s.district} {s.postal ?? ""}
            <br />
            {s.country}
          </p>
        </section>

        <section className="drw-sec">
          <h4>Store details</h4>
          <div className="drw-kv">
            <div>
              <div className="k">Phone</div>
              <div className="v mono">{s.phone}</div>
            </div>
            <div>
              <div className="k">Country code</div>
              <div className="v mono">{s.countryCode}</div>
            </div>
            <div>
              <div className="k">Postal code</div>
              <div className="v mono">{s.postal ?? "—"}</div>
            </div>
            <div>
              <div className="k">District</div>
              <div className="v">{s.district}</div>
            </div>
            <div>
              <div className="k">Opened</div>
              <div className="v mono">{s.opened}</div>
            </div>
            <div>
              <div className="k">Last sync</div>
              <div className="v" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "var(--success)",
                  }}
                />
                2 min ago
              </div>
            </div>
          </div>
        </section>

        <section className="drw-sec">
          <h4>Store manager</h4>
          {mgr ? (
            <div className="sd-mgrcard">
              <Avatar
                initials={managerInitials(mgr.name)}
                tone={toneForStore(s.id)}
                size={44}
                name={mgr.name}
              />
              <div className="body">
                <b>{mgr.name}</b>
                <span>
                  Store manager · since {mgr.started.slice(0, 10)}
                </span>
                <div className="meta">
                  @{mgr.username} · {mgr.email}
                </div>
              </div>
              <Btn size="sm" variant="ghost" iconOnly aria-label="Manager actions">
                <Icon name="more" size={14} />
              </Btn>
            </div>
          ) : (
            <p className="drw-syn" style={{ color: "var(--text-soft)" }}>
              No manager on file.
            </p>
          )}
        </section>

        {clerks.length > 0 && (
          <section className="drw-sec">
            <h4>
              Staff <span className="pill">{totalStaff} total</span>
            </h4>
            <div className="sd-staffchips">
              {clerks.map((p, i) => (
                <span key={p.id} className="sd-staffchip">
                  <Avatar
                    initials={managerInitials(p.name)}
                    tone={toneForIndex(i)}
                    size={20}
                    name={p.name}
                  />
                  {p.name}
                  <small>· {p.role}</small>
                </span>
              ))}
            </div>
          </section>
        )}

        <StoreCustomersSection
          storeId={s.id}
          total={s.customers}
          initial={customers}
        />

        <section className="drw-sec">
          <h4>Rental activity</h4>
          <div className="drw-perf">
            <div>
              <div className="big">{s.rentals7d.toLocaleString()}</div>
              <div className="sub">rentals · last 7d</div>
            </div>
            <div className="divider" />
            <Sparkline data={sparkData} width={120} height={36} />
            <div className="right">
              <Chip tone="success" dot>
                live
              </Chip>
              <div className="sub">via Pagila</div>
            </div>
          </div>
        </section>
      </div>

      <footer className="drw-foot">
        <Btn size="sm" variant="ghost" leftIcon="duplicate" disabled>
          Duplicate
        </Btn>
        <Btn size="sm" variant="ghost" leftIcon="archive" disabled>
          Archive
        </Btn>
        <div className="grow" />
        <DrawerCloseButton fallbackHref="/stores">Close</DrawerCloseButton>
        <Link href={`/stores/${s.id}/edit`} aria-label="Edit store">
          <Btn size="sm" variant="primary" leftIcon="pencil">
            Edit store
          </Btn>
        </Link>
      </footer>
    </article>
  );
}
