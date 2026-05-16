"use client";

/**
 * FilmsToolbar — search + filter pills + sort + Export + New film.
 *
 * Ported from designs/films-list.jsx#FilmsListScreen toolbar block.
 *
 * State source of truth: the URL. We read it via `useSearchParams()` and
 * push updates via `useRouter().push(..., { scroll: false })`. The local
 * `searchDraft` exists only so the input feels responsive while we
 * debounce the URL push by 300ms.
 *
 * The filter popovers (Category / Rating / Length) are simple
 * useState-driven dropdowns — no portal, no focus-trap. Click-outside
 * closes them via a useEffect document listener.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Btn from "@/components/ui/Btn";
import Input from "@/components/ui/Input";
import type { Rating } from "@/lib/types";

type CategoryOption = { id: number; name: string };

export type FilmsToolbarProps = {
  categories: CategoryOption[];
};

const RATINGS: Rating[] = ["G", "PG", "PG-13", "R", "NC-17"];
const LENGTH_BUCKETS: { id: string; label: string }[] = [
  { id: "lt-60", label: "Under 60 min" },
  { id: "60-90", label: "60 – 90 min" },
  { id: "90-120", label: "90 – 120 min" },
  { id: "gt-120", label: "Over 120 min" },
];

export default function FilmsToolbar({ categories }: FilmsToolbarProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const currentQ = sp.get("q") ?? "";
  const currentCategory = sp.get("category") ?? "";
  const currentRating = sp.get("rating") ?? "";
  const currentLength = sp.get("length") ?? "";

  const [searchDraft, setSearchDraft] = useState(currentQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync if someone changes URL externally (e.g. via the
  // sidebar or back-button). Effect-driven derive-from-prop is intentional.
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
      // Filter changes always reset to page 1.
      if (Object.prototype.hasOwnProperty.call(patch, "q")) next.delete("page");
      if (Object.prototype.hasOwnProperty.call(patch, "category"))
        next.delete("page");
      if (Object.prototype.hasOwnProperty.call(patch, "rating"))
        next.delete("page");
      if (Object.prototype.hasOwnProperty.call(patch, "length"))
        next.delete("page");
      const qs = next.toString();
      router.push(qs ? `/films?${qs}` : "/films", { scroll: false });
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

  // ─ popovers ──────────────────────────────────────────────────────────
  const [openPop, setOpenPop] = useState<
    null | "category" | "rating" | "length"
  >(null);

  const closePop = useCallback(() => setOpenPop(null), []);

  useEffect(() => {
    if (!openPop) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest(".fl-popover-wrap")) closePop();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openPop, closePop]);

  const categoryLabel = useMemo(() => {
    if (!currentCategory) return null;
    const cat = categories.find((c) => String(c.id) === currentCategory);
    return cat?.name ?? null;
  }, [currentCategory, categories]);

  return (
    <div className="fl-toolbar">
      <Input
        leftIcon="search"
        placeholder="Search 1,000 films…"
        size="sm"
        wrapStyle={{ width: 240 }}
        value={searchDraft}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search films"
      />

      <FilterPill
        label="Category"
        active={!!currentCategory}
        badge={categoryLabel ?? undefined}
        open={openPop === "category"}
        onToggle={() =>
          setOpenPop(openPop === "category" ? null : "category")
        }
      >
        {categories.map((c) => {
          const selected = String(c.id) === currentCategory;
          return (
            <button
              key={c.id}
              data-on={selected ? "1" : ""}
              onClick={() => {
                pushParams({
                  category: selected ? null : String(c.id),
                });
                closePop();
              }}
            >
              {c.name}
            </button>
          );
        })}
      </FilterPill>

      <FilterPill
        label="Rating"
        active={!!currentRating}
        badge={currentRating || undefined}
        open={openPop === "rating"}
        onToggle={() => setOpenPop(openPop === "rating" ? null : "rating")}
      >
        {RATINGS.map((r) => {
          const selected = r === currentRating;
          return (
            <button
              key={r}
              data-on={selected ? "1" : ""}
              onClick={() => {
                pushParams({ rating: selected ? null : r });
                closePop();
              }}
            >
              {r}
            </button>
          );
        })}
      </FilterPill>

      <FilterPill
        label="Length"
        active={!!currentLength}
        badge={
          LENGTH_BUCKETS.find((b) => b.id === currentLength)?.label ??
          undefined
        }
        open={openPop === "length"}
        onToggle={() => setOpenPop(openPop === "length" ? null : "length")}
      >
        {LENGTH_BUCKETS.map((b) => {
          const selected = b.id === currentLength;
          return (
            <button
              key={b.id}
              data-on={selected ? "1" : ""}
              onClick={() => {
                pushParams({ length: selected ? null : b.id });
                closePop();
              }}
            >
              {b.label}
            </button>
          );
        })}
      </FilterPill>

      <Btn size="sm" leftIcon="plus" variant="ghost">
        More filters
      </Btn>
      <div className="sep" />
      <Btn size="sm" leftIcon="sort">
        Last updated
      </Btn>
      <div className="grow" />
      <Btn size="sm" leftIcon="download" variant="ghost">
        Export
      </Btn>
      <Btn size="sm" leftIcon="plus" variant="primary">
        New film
      </Btn>
    </div>
  );
}

/** A toolbar filter pill that opens a popover with options. */
function FilterPill({
  label,
  active,
  badge,
  open,
  onToggle,
  children,
}: {
  label: string;
  active: boolean;
  badge?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fl-popover-wrap">
      <Btn
        size="sm"
        leftIcon="filter"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
        {active && badge && <span className="fl-pill-count">{badge}</span>}
      </Btn>
      {open && <div className="fl-popover">{children}</div>}
    </div>
  );
}
