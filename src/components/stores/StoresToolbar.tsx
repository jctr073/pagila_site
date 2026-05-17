"use client";

/**
 * StoresToolbar — search input, country / status filter stubs, sort
 * indicator, Export, and New store. Mirrors the films toolbar but most
 * filter popovers are presentational for now; the URL keys are wired so
 * the search box keeps working across navigations.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Btn, Input } from "@/components/ui";

export default function StoresToolbar() {
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
      router.push(qs ? `/stores?${qs}` : "/stores", { scroll: false });
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

  return (
    <div className="fl-toolbar">
      <Input
        leftIcon="search"
        placeholder="Search stores, cities, managers…"
        size="sm"
        wrapStyle={{ width: 260 }}
        value={searchDraft}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search stores"
      />
      <Btn size="sm" leftIcon="filter" disabled>
        Country
      </Btn>
      <Btn size="sm" leftIcon="filter" disabled>
        Status
      </Btn>
      <Btn size="sm" leftIcon="plus" variant="ghost" disabled>
        More filters
      </Btn>
      <div className="sep" />
      <Btn size="sm" leftIcon="sort" disabled>
        Sort: ID asc
      </Btn>
      <div className="grow" />
      <Btn size="sm" leftIcon="download" variant="ghost">
        Export
      </Btn>
      <Btn size="sm" leftIcon="plus" variant="primary">
        New store
      </Btn>
    </div>
  );
}
