"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type StaffTab = "staff" | "shifts" | "permissions";

const TABS: ReadonlyArray<StaffTab> = ["staff", "shifts", "permissions"];

/**
 * StaffTabs — segmented pill control sitting on surface-2 with a white
 * active thumb + shadow-sm. Tab state lives in the URL via the `tab`
 * search param so the back/forward buttons work and links are
 * shareable.
 *
 * Marked `'use client'` because it owns `useRouter` + `useSearchParams`.
 * Mirrors the inline tab control in
 * design_handoff_pagila_admin/designs/stores-staff.jsx; the styling
 * lives in src/app/_stores.css (.staff-tabs / .staff-tab).
 */
export default function StaffTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const currentRaw = search.get("tab");
  const current: StaffTab =
    currentRaw === "shifts" || currentRaw === "permissions"
      ? currentRaw
      : "staff";

  const setTab = useCallback(
    (next: StaffTab) => {
      const params = new URLSearchParams(search.toString());
      if (next === "staff") params.delete("tab");
      else params.set("tab", next);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, search],
  );

  return (
    <div className="staff-tabs" role="tablist" aria-label="Staff sections">
      {TABS.map((t) => {
        const active = t === current;
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={active}
            className={`staff-tab${active ? " is-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
