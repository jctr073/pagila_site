"use client";

/**
 * RentalsToolbar — search + status filter buttons + sort indicator.
 * Status filter writes `?status=...` and clears `?page` so paging
 * restarts. Search is debounced like StoresToolbar.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Btn, Input } from "@/components/ui";
import type { RentalStatus } from "@/lib/types";

const STATUS_TABS: { key: RentalStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "overdue", label: "Overdue" },
  { key: "returned", label: "Returned" },
];

export type RentalsToolbarProps = {
  status?: RentalStatus;
  counts: { open: number; overdue: number; returned: number };
  total: number;
};

export default function RentalsToolbar({
  status,
  counts,
  total,
}: RentalsToolbarProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const currentQ = sp.get("q") ?? "";
  const [searchDraft, setSearchDraft] = useState(currentQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchDraft(currentQ);
  }, [currentQ]);

  const pushParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      next.delete("page");
      const qs = next.toString();
      router.push(qs ? `/rentals?${qs}` : "/rentals", { scroll: false });
    },
    [sp, router],
  );

  const onSearchChange = (value: string) => {
    setSearchDraft(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams({ q: value || null });
    }, 300);
  };

  const countFor = (k: RentalStatus | "all") => {
    if (k === "all") return total;
    return counts[k];
  };

  return (
    <div className="fl-toolbar">
      <Input
        leftIcon="search"
        placeholder="Search films, customers, emails…"
        size="sm"
        wrapStyle={{ width: 280 }}
        value={searchDraft}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search rentals"
      />
      <div className="rt-tabs" role="tablist" aria-label="Filter rentals by status">
        {STATUS_TABS.map((tab) => {
          const active =
            tab.key === "all" ? !status : status === tab.key;
          const href = tab.key === "all"
            ? buildHref(sp, { status: null, page: null })
            : buildHref(sp, { status: tab.key, page: null });
          return (
            <Link
              key={tab.key}
              role="tab"
              aria-selected={active}
              className={`rt-tab${active ? " is-active" : ""}`}
              href={href}
              scroll={false}
            >
              <span>{tab.label}</span>
              <small className="mono">{countFor(tab.key).toLocaleString()}</small>
            </Link>
          );
        })}
      </div>
      <div className="grow" />
      <Btn size="sm" leftIcon="filter" disabled>
        Store
      </Btn>
    </div>
  );
}

function buildHref(
  sp: ReturnType<typeof useSearchParams>,
  patch: Record<string, string | null>,
): string {
  const next = new URLSearchParams(sp.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) next.delete(k);
    else next.set(k, v);
  }
  const qs = next.toString();
  return qs ? `/rentals?${qs}` : "/rentals";
}
