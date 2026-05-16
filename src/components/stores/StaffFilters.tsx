"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Btn, Input } from "@/components/ui";

/**
 * StaffFilters — search + Store + Role filter pills sitting in the
 * staff-section header row.
 *
 * - Search input debounces 300ms before pushing `q` into the URL.
 * - Store / Role buttons are stubs that cycle a placeholder label;
 *   real popover menus are out of scope for Phase 9 (the README only
 *   asks for the visual treatment).
 *
 * URL state ⇒ "shareable filter links" + back/forward.
 */
export default function StaffFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const initialQ = search.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushSearch = useCallback(
    (next: string) => {
      const params = new URLSearchParams(search.toString());
      if (next) params.set("q", next);
      else params.delete("q");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, search],
  );

  useEffect(() => {
    // Keep the input in sync if someone navigates with a different `q`
    // (e.g. clicking a link, or the URL is rewritten by another control).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQ(initialQ);
  }, [initialQ]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setQ(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => pushSearch(next), 300);
  }

  return (
    <div className="staff-filters">
      <Input
        leftIcon="search"
        placeholder="Search staff…"
        size="sm"
        value={q}
        onChange={onChange}
        aria-label="Search staff"
      />
      <Btn size="sm" leftIcon="filter">
        Store: All
      </Btn>
      <Btn size="sm" leftIcon="filter">
        Role: All
      </Btn>
    </div>
  );
}
