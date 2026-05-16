"use client";

/**
 * InlineEditRate — double-click to edit `rental_rate` in place.
 *
 * Pattern (per spec §7 in design_handoff_pagila_admin/README.md):
 *   - Render the cell as a <button> showing the current value.
 *   - On double-click → swap to a controlled <input> with .fl-edit-cell.
 *   - On Enter or blur → call updateRate (server action) + optimistic update.
 *   - On Escape → revert and exit.
 *
 * We call the typed direct action (not `useActionState`) because we want
 * fire-and-forget: the optimistic value is shown immediately, and on the
 * `revalidatePath('/films')` round-trip the server-rendered value takes
 * over again.
 */

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { toast } from "@/components/ui/Toast";
import { updateRate } from "@/lib/actions/films";

export type InlineEditRateProps = {
  id: number;
  initialRate: number;
};

export default function InlineEditRate({
  id,
  initialRate,
}: InlineEditRateProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<number>(initialRate);
  const [draft, setDraft] = useState<string>(initialRate.toFixed(2));
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep our shown value in sync if the server-rendered prop changes
  // (e.g. after a revalidation from somebody else's edit).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(initialRate);
    setDraft(initialRate.toFixed(2));
  }, [initialRate]);

  function beginEdit() {
    setDraft(value.toFixed(2));
    setEditing(true);
  }

  function cancel() {
    setDraft(value.toFixed(2));
    setEditing(false);
  }

  async function commit() {
    const next = parseFloat(draft);
    if (!Number.isFinite(next) || next < 0) {
      cancel();
      return;
    }
    if (next === value) {
      setEditing(false);
      return;
    }
    // Optimistic.
    setValue(next);
    setEditing(false);
    setPending(true);
    try {
      // Wrap revalidation-triggering server action in a transition per
      // the React 19 / Next 16 guidance — keeps the table interactive
      // while the new RSC payload streams in.
      startTransition(async () => {
        try {
          await updateRate(id, next);
          toast.success("Saved");
        } catch (err) {
          // Revert on failure.
          setValue(value);
          toast.error((err as Error).message || "Failed to save");
        } finally {
          setPending(false);
        }
      });
    } catch {
      setValue(value);
      setPending(false);
    }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        className="fl-edit-cell mono"
        defaultValue={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={onKey}
        style={{ width: 70 }}
        inputMode="decimal"
        aria-label="Rental rate"
      />
    );
  }

  return (
    <button
      type="button"
      className="fl-cell-btn mono"
      style={{ color: "var(--text)", fontWeight: 500, opacity: pending ? 0.6 : 1 }}
      onDoubleClick={beginEdit}
      onClick={(e) => e.stopPropagation()}
      title="Double-click to edit"
    >
      ${value.toFixed(2)}
    </button>
  );
}
