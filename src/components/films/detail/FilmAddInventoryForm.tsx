"use client";

/**
 * FilmAddInventoryForm — modal body for adding physical inventory copies
 * of the current film to one or more stores.
 *
 * UX:
 *   - Each store renders as a row: <Check> + label + current-units chip
 *     + a number input that appears once the row is checked.
 *   - The footer's primary button label reflects the total units that
 *     will be inserted ("Add 5 units"); it's disabled when nothing
 *     selected or no valid units are entered.
 *   - On success the modal closes via router.back(); the parent route
 *     `revalidatePath`s the films list / film page so the drawer's
 *     inventory table reflects the new counts.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Avatar from "@/components/ui/Avatar";
import Btn from "@/components/ui/Btn";
import Check from "@/components/ui/Check";
import Icon from "@/components/ui/Icon";
import {
  addFilmInventory,
  type AddInventoryResult,
} from "@/lib/actions/inventory";
import type { StoreLite } from "@/lib/queries/inventory";
import { storeLabel } from "@/lib/storeLabels";
import type { FilmDetail, FilmInventoryByStore } from "@/lib/types";

export type FilmAddInventoryFormProps = {
  film: FilmDetail;
  stores: StoreLite[];
  /** Current `{store_id, units, out}` rows — used to display the
   *  "current: N" hint next to each store. Stores not present in the
   *  list are treated as having zero units. */
  inventory: FilmInventoryByStore[];
  /** Render as a page (no fixed positioning) instead of a centered modal. */
  standalone?: boolean;
};

type RowState = {
  checked: boolean;
  units: number;
};

function parseUnits(raw: string): number {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 100);
}

export default function FilmAddInventoryForm({
  film,
  stores,
  inventory,
  standalone = false,
}: FilmAddInventoryFormProps) {
  const router = useRouter();

  const currentByStore = useMemo(() => {
    const m = new Map<number, number>();
    for (const row of inventory) m.set(row.store_id, row.units);
    return m;
  }, [inventory]);

  const [rows, setRows] = useState<Record<number, RowState>>(() => {
    const init: Record<number, RowState> = {};
    for (const s of stores) init[s.id] = { checked: false, units: 1 };
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = Object.entries(rows)
    .map(([id, r]) => ({ storeId: Number(id), units: r.units, checked: r.checked }))
    .filter((it) => it.checked && it.units > 0);
  const totalUnits = items.reduce((acc, it) => acc + it.units, 0);
  const canSubmit = items.length > 0 && totalUnits > 0 && !saving;

  function setRow(storeId: number, patch: Partial<RowState>) {
    setRows((prev) => ({
      ...prev,
      [storeId]: { ...prev[storeId], ...patch },
    }));
  }

  async function onSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    const payload = items.map(({ storeId, units }) => ({ storeId, units }));
    const result: AddInventoryResult = await addFilmInventory(film.id, payload);
    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }
    // Success — dismiss. revalidatePath already fired server-side so the
    // drawer behind us will re-render with the new units when shown.
    router.back();
  }

  const idStr = String(film.id).padStart(3, "0");
  const totalCurrent = inventory.reduce((acc, r) => acc + r.units, 0);
  const submitLabel =
    totalUnits === 0
      ? "Add stock"
      : `Add ${totalUnits} unit${totalUnits === 1 ? "" : "s"}`;

  return (
    <div
      className={standalone ? "mdl mdl-standalone" : "mdl"}
      role="dialog"
      aria-modal="true"
      aria-label="Add stock"
    >
      <header className="mdl-head">
        <div>
          <h3>Add stock</h3>
          <span className="sub">
            #{idStr} · {film.title} · {totalCurrent} units in stock
          </span>
        </div>
        <div className="grow" />
        <Btn
          size="sm"
          variant="ghost"
          iconOnly
          aria-label="Close"
          onClick={() => router.back()}
        >
          <Icon name="x" size={14} />
        </Btn>
      </header>

      <div className="mdl-body">
        <section className="mdl-section">
          <div className="mdl-section-h">Stores</div>
          <div className="add-inv-list">
            {stores.map((s) => {
              const meta = storeLabel({ id: s.id, city: s.city });
              const row = rows[s.id] ?? { checked: false, units: 1 };
              const current = currentByStore.get(s.id) ?? 0;
              return (
                <label key={s.id} className="add-inv-row">
                  <Check
                    checked={row.checked}
                    onChange={(next) => setRow(s.id, { checked: next })}
                    ariaLabel={`Select ${meta.name}`}
                  />
                  <span className="add-inv-store">
                    <Avatar
                      initials={`#${s.id}`}
                      tone={meta.tone}
                      size={20}
                    />
                    <span className="add-inv-name">{meta.name}</span>
                    <span className="add-inv-current">
                      current: {current}
                    </span>
                  </span>
                  <span className="add-inv-units">
                    {row.checked ? (
                      <input
                        type="number"
                        min={1}
                        max={100}
                        step={1}
                        inputMode="numeric"
                        aria-label={`Units to add at ${meta.name}`}
                        value={row.units}
                        onChange={(e) =>
                          setRow(s.id, { units: parseUnits(e.target.value) })
                        }
                        className="add-inv-input mono"
                      />
                    ) : (
                      <span className="add-inv-input-placeholder">—</span>
                    )}
                  </span>
                </label>
              );
            })}
            {stores.length === 0 && (
              <div style={{ color: "var(--text-soft)", fontSize: 12 }}>
                No stores available.
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="mdl-foot">
        <span className="saved" aria-live="polite">
          {error ? (
            <>
              <Icon name="x" size={11} className="err" />
              <span style={{ color: "var(--danger)" }}>
                Failed: {error}
              </span>
            </>
          ) : saving ? (
            <>
              <Icon name="cycle" size={11} />
              Adding…
            </>
          ) : (
            <span style={{ color: "var(--text-soft)" }}>
              Each unit becomes one physical copy.
            </span>
          )}
        </span>
        <div className="grow" />
        <Btn size="sm" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Btn>
        <Btn
          size="sm"
          variant="primary"
          leftIcon="plus"
          onClick={() => void onSubmit()}
          disabled={!canSubmit}
        >
          {submitLabel}
        </Btn>
      </footer>
    </div>
  );
}
