"use client";

/**
 * FilmsBulkBar — full-width persimmon bar visible while a selection
 * exists. Renders bulk actions: Set category (popover), Move to store
 * (stub), Archive, Duplicate (stub), Delete (stub).
 *
 * Ported from designs/films-list.jsx#FilmsListScreen bulkbar block.
 * Server actions live in src/lib/actions/films.ts.
 */

import { startTransition, useCallback, useEffect, useState } from "react";

import Btn from "@/components/ui/Btn";
import Check from "@/components/ui/Check";
import Icon from "@/components/ui/Icon";
import { toast } from "@/components/ui/Toast";
import { bulkArchive, bulkSetCategory } from "@/lib/actions/films";

type CategoryOption = { id: number; name: string };

export type FilmsBulkBarProps = {
  selectedIds: number[];
  categories: CategoryOption[];
  onClear: () => void;
};

export default function FilmsBulkBar({
  selectedIds,
  categories,
  onClear,
}: FilmsBulkBarProps) {
  const [catOpen, setCatOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const closePop = useCallback(() => setCatOpen(false), []);
  useEffect(() => {
    if (!catOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest(".fl-popover-wrap")) closePop();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [catOpen, closePop]);

  const count = selectedIds.length;
  if (count === 0) return null;

  const onSetCategory = (categoryId: number) => {
    setCatOpen(false);
    setErr(null);
    setPending(true);
    startTransition(async () => {
      try {
        await bulkSetCategory(selectedIds, categoryId);
        onClear();
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setPending(false);
      }
    });
  };

  const onArchive = () => {
    setErr(null);
    setPending(true);
    startTransition(async () => {
      try {
        await bulkArchive(selectedIds);
        toast.success(
          `Archived ${selectedIds.length} film${selectedIds.length > 1 ? "s" : ""}`,
        );
        onClear();
      } catch (e) {
        // q_bulkArchive requires the `archived_at` migration — until that
        // ships we just surface the error inline + as a toast.
        const msg = (e as Error).message;
        setErr(msg);
        toast.error(`Archive failed: ${msg}`);
      } finally {
        setPending(false);
      }
    });
  };

  return (
    <div className="fl-bulkbar" role="region" aria-label="Bulk actions">
      <Check checked onChange={onClear} ariaLabel="Clear selection" />
      <b style={{ fontWeight: 600 }}>
        {count} film{count > 1 ? "s" : ""} selected
      </b>
      <div className="sep" />

      <div className="fl-popover-wrap">
        <Btn
          size="sm"
          leftIcon="tag"
          disabled={pending}
          onClick={() => setCatOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={catOpen}
        >
          Set category
        </Btn>
        {catOpen && (
          <div className="fl-popover" style={{ color: "var(--text)" }}>
            {categories.map((c) => (
              <button key={c.id} onClick={() => onSetCategory(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TODO: bulk "Move to store" (no store_id on film row — would need
          inventory rebalancing). Stubbed for Phase 6. */}
      <Btn size="sm" leftIcon="store" disabled>
        Move to store
      </Btn>

      <Btn
        size="sm"
        leftIcon="archive"
        disabled={pending}
        onClick={onArchive}
      >
        Archive
      </Btn>

      {/* TODO: bulk Duplicate — needs an explicit `duplicateFilm` query
          (insert + film_actor copy + inventory copy). Stubbed. */}
      <Btn size="sm" leftIcon="duplicate" disabled>
        Duplicate
      </Btn>

      <div style={{ flex: 1 }} />

      {/* TODO: hard delete is dangerous; needs a confirm dialog. Stub. */}
      <Btn size="sm" variant="danger-ghost" leftIcon="trash" disabled>
        Delete
      </Btn>

      <button
        type="button"
        className="clearx"
        aria-label="Clear selection"
        onClick={onClear}
      >
        <Icon name="x" size={12} />
      </button>

      {err && (
        <span
          style={{
            color: "#fff",
            opacity: 0.85,
            fontSize: 11,
            marginLeft: 6,
          }}
          role="alert"
        >
          {err}
        </span>
      )}
    </div>
  );
}
