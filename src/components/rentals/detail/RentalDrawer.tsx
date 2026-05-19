"use client";

/**
 * RentalDrawer — read + lightly mutate a single rental.
 *
 * Reuses the `drw-*` class hooks from FilmDrawer / StoreDrawer for the
 * header / hero / body / foot frame. The mutations (return, reopen,
 * delete) call server actions through useTransition so the surrounding
 * list revalidates automatically.
 */

import { useTransition } from "react";
import Link from "next/link";

import DrawerCloseButton from "@/components/films/detail/DrawerCloseButton";
import { Avatar, Btn, Chip, Icon } from "@/components/ui";
import {
  deleteRentalAction,
  reopenRentalAction,
  returnRentalAction,
} from "@/lib/actions/rentals";
import type { RentalDetail, RentalStatus } from "@/lib/types";
import { useRouter } from "next/navigation";

export type RentalDrawerProps = {
  rental: RentalDetail;
  standalone?: boolean;
};

const STATUS_LABEL: Record<RentalStatus, string> = {
  open: "Out · open",
  overdue: "Out · overdue",
  returned: "Returned",
};

const STATUS_TONE = {
  open: "accent",
  overdue: "warning",
  returned: "success",
} as const;

function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (
    (parts[0]![0] ?? "") + (parts[parts.length - 1]![0] ?? "")
  ).toUpperCase();
}

const TONE_CYCLE = ["accent", "teal", "violet", "success"] as const;
function toneForCustomer(id: number): (typeof TONE_CYCLE)[number] {
  return TONE_CYCLE[id % TONE_CYCLE.length]!;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toISOString().slice(0, 10)} · ${d.toISOString().slice(11, 16)} UTC`;
}

export default function RentalDrawer({
  rental,
  standalone = false,
}: RentalDrawerProps) {
  const r = rental;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const idStr = String(r.id).padStart(5, "0");
  const tone = toneForCustomer(r.customerId);

  const onReturn = () => {
    startTransition(async () => {
      await returnRentalAction(r.id);
      router.refresh();
    });
  };
  const onReopen = () => {
    startTransition(async () => {
      await reopenRentalAction(r.id);
      router.refresh();
    });
  };
  const onDelete = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        `Delete rental #${idStr}? This cannot be undone.`,
      );
      if (!ok) return;
    }
    startTransition(async () => {
      const result = await deleteRentalAction(r.id);
      if (result.ok) {
        router.push("/rentals");
      }
    });
  };

  return (
    <article className={standalone ? "drw drw-standalone" : "drw"}>
      <header className="drw-head">
        <span className="drw-id mono">#{idStr}</span>
        <Chip tone={STATUS_TONE[r.status]} dot>
          {STATUS_LABEL[r.status]}
        </Chip>
        <div className="nav">
          <Btn size="sm" variant="ghost" iconOnly aria-label="Previous rental" disabled>
            <Icon name="chevLeft" size={14} />
          </Btn>
          <Btn size="sm" variant="ghost" iconOnly aria-label="Next rental" disabled>
            <Icon name="chevRight" size={14} />
          </Btn>
          <div style={{ width: 8 }} />
          <Btn size="sm" variant="ghost" iconOnly aria-label="More actions">
            <Icon name="more" size={14} />
          </Btn>
          <DrawerCloseButton iconOnly fallbackHref="/rentals" aria-label="Close drawer">
            <Icon name="x" size={14} />
          </DrawerCloseButton>
        </div>
      </header>

      <div className="drw-hero">
        <div className="rd-filmico" data-tone={tone} aria-hidden="true">
          <Icon name="film" size={28} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>{r.filmTitle}</h2>
          <div className="sub">
            <b>Rental #{r.id}</b> · {r.filmDurationDays}-day · ${" "}
            {r.filmRate.toFixed(2)} · {r.filmRating} · {r.filmLength} min
          </div>
          <div className="drw-tags">
            <Chip tone="teal">Store #{r.storeId}</Chip>
            <Chip>{r.storeName?.trim() || r.storeCity}</Chip>
            {r.daysOverdue > 0 && (
              <Chip tone="warning">{r.daysOverdue}d overdue</Chip>
            )}
          </div>
        </div>
      </div>

      <div className="drw-body">
        <section className="drw-sec">
          <h4>Timeline</h4>
          <div className="drw-kv">
            <div>
              <div className="k">Rented</div>
              <div className="v mono">{formatTimestamp(r.rentedAt)}</div>
            </div>
            <div>
              <div className="k">Due</div>
              <div className="v mono">{r.dueOn}</div>
            </div>
            <div>
              <div className="k">Returned</div>
              <div className="v mono">
                {r.returnedAt ? formatTimestamp(r.returnedAt) : "—"}
              </div>
            </div>
            <div>
              <div className="k">Paid</div>
              <div className="v mono">${r.paid.toFixed(2)}</div>
            </div>
          </div>
        </section>

        <section className="drw-sec">
          <h4>Customer</h4>
          <Link
            href={`/stores/${r.storeId}/customers/${r.customerId}`}
            className="rd-custcard"
          >
            <Avatar
              initials={customerInitials(r.customerName)}
              tone={tone}
              size={44}
              name={r.customerName}
            />
            <div className="body">
              <b>{r.customerName}</b>
              <span>Customer #{r.customerId}</span>
              <div className="meta">{r.customerEmail ?? "no email on file"}</div>
            </div>
            <Icon name="chevRight" size={14} />
          </Link>
        </section>

        <section className="drw-sec">
          <h4>Inventory &amp; staff</h4>
          <div className="drw-kv">
            <div>
              <div className="k">Inventory</div>
              <div className="v mono">#{r.inventoryId}</div>
            </div>
            <div>
              <div className="k">Film</div>
              <div className="v">
                <Link href={`/films/${r.filmId}`} className="rd-link">
                  {r.filmTitle}
                </Link>
              </div>
            </div>
            <div>
              <div className="k">Store</div>
              <div className="v">
                <Link href={`/stores/${r.storeId}`} className="rd-link">
                  {r.storeName?.trim() || r.storeCity}
                </Link>
              </div>
            </div>
            <div>
              <div className="k">Clerk</div>
              <div className="v">{r.staffName}</div>
            </div>
          </div>
        </section>
      </div>

      <footer className="drw-foot">
        <Btn
          size="sm"
          variant="danger-ghost"
          leftIcon="trash"
          onClick={onDelete}
          disabled={isPending}
        >
          Delete
        </Btn>
        <div className="grow" />
        <DrawerCloseButton fallbackHref="/rentals">Close</DrawerCloseButton>
        {r.status === "returned" ? (
          <Btn
            size="sm"
            variant="primary"
            leftIcon="cycle"
            onClick={onReopen}
            disabled={isPending}
          >
            Mark as out
          </Btn>
        ) : (
          <Btn
            size="sm"
            variant="primary"
            leftIcon="check"
            onClick={onReturn}
            disabled={isPending}
          >
            Mark returned
          </Btn>
        )}
      </footer>
    </article>
  );
}
