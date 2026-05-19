"use client";

/**
 * NewRentalForm — create a rental by picking a customer, an available
 * inventory copy, and the clerk on duty. Submits via the
 * `createRentalAction` server action and `router.back()`s on success
 * so the intercepting modal route dismisses cleanly.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import Btn from "@/components/ui/Btn";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import { createRentalAction } from "@/lib/actions/rentals";
import type {
  CustomerLookupRow,
  InventoryAvailability,
  StaffRow,
} from "@/lib/types";

export type NewRentalFormProps = {
  customers: CustomerLookupRow[];
  inventory: InventoryAvailability[];
  staff: StaffRow[];
  /** Render as a page (no fixed positioning) instead of a centered modal. */
  standalone?: boolean;
};

export default function NewRentalForm({
  customers,
  inventory,
  staff,
  standalone = false,
}: NewRentalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [filmFilter, setFilmFilter] = useState("");
  const [customerId, setCustomerId] = useState<number>(
    customers.find((c) => c.active)?.id ?? customers[0]?.id ?? 0,
  );
  const selectedCustomer = customers.find((c) => c.id === customerId);
  const customerStoreId = selectedCustomer?.storeId;

  const [storeFilter, setStoreFilter] = useState<number | "any">(
    customerStoreId ?? "any",
  );

  const visibleInventory = useMemo(() => {
    const needle = filmFilter.trim().toLowerCase();
    return inventory.filter((it) => {
      if (storeFilter !== "any" && it.storeId !== storeFilter) return false;
      if (!needle) return true;
      return it.filmTitle.toLowerCase().includes(needle);
    });
  }, [inventory, filmFilter, storeFilter]);

  const [inventoryId, setInventoryId] = useState<number>(
    inventory[0]?.inventoryId ?? 0,
  );
  // If the inventory filters changed and the previously-selected copy is
  // no longer visible, snap to the first visible item.
  const visibleIds = useMemo(
    () => new Set(visibleInventory.map((it) => it.inventoryId)),
    [visibleInventory],
  );
  const effectiveInventoryId = visibleIds.has(inventoryId)
    ? inventoryId
    : visibleInventory[0]?.inventoryId ?? 0;
  const selectedInventory = visibleInventory.find(
    (it) => it.inventoryId === effectiveInventoryId,
  );

  const [staffId, setStaffId] = useState<number>(staff[0]?.id ?? 0);

  // Cross-store warnings: customers are tied to a store, and most rentals
  // are intra-store. We don't block the form, but we flag it so the user
  // knows they're checking out a copy from a different branch.
  const crossStore =
    !!selectedCustomer &&
    !!selectedInventory &&
    selectedCustomer.storeId !== selectedInventory.storeId;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!effectiveInventoryId || !customerId || !staffId) {
      setError("Pick a customer, a film copy, and a clerk to continue.");
      return;
    }
    startTransition(async () => {
      const result = await createRentalAction({
        inventoryId: effectiveInventoryId,
        customerId,
        staffId,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/rentals/${result.id}`);
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className={standalone ? "mdl mdl-standalone" : "mdl"}
      role="dialog"
      aria-modal="true"
      aria-label="New rental"
    >
      <header className="mdl-head">
        <div>
          <h3>New rental</h3>
          <span className="sub">
            Check out an available copy to a customer.
          </span>
        </div>
        <div className="grow" />
        <Btn
          size="sm"
          variant="ghost"
          iconOnly
          aria-label="Close"
          onClick={() => router.back()}
          type="button"
        >
          <Icon name="x" size={14} />
        </Btn>
      </header>

      <div className="mdl-body">
        <section className="mdl-section">
          <div className="mdl-section-h">Customer</div>
          <div className="mdl-field">
            <label htmlFor="rental-customer">
              Customer <span className="req">*</span>
            </label>
            <select
              id="rental-customer"
              className="mdl-select"
              value={customerId}
              onChange={(e) => setCustomerId(Number(e.target.value))}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id} disabled={!c.active}>
                  {c.name}
                  {c.email ? ` · ${c.email}` : ""}
                  {!c.active ? " · inactive" : ""}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mdl-section">
          <div className="mdl-section-h">Film</div>
          <div className="mdl-grid-2">
            <div className="mdl-field">
              <label htmlFor="rental-film-filter">Filter by title</label>
              <Input
                id="rental-film-filter"
                leftIcon="search"
                placeholder="Search films…"
                size="sm"
                value={filmFilter}
                onChange={(e) => setFilmFilter(e.target.value)}
              />
            </div>
            <div className="mdl-field">
              <label htmlFor="rental-store-filter">Store</label>
              <select
                id="rental-store-filter"
                className="mdl-select"
                value={storeFilter}
                onChange={(e) =>
                  setStoreFilter(
                    e.target.value === "any" ? "any" : Number(e.target.value),
                  )
                }
              >
                <option value="any">Any store</option>
                {Array.from(
                  new Map(
                    inventory.map((it) => [
                      it.storeId,
                      it.storeName?.trim() || it.storeCity,
                    ]),
                  ).entries(),
                ).map(([id, label]) => (
                  <option key={id} value={id}>
                    Store #{id} · {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mdl-field">
            <label htmlFor="rental-inventory">
              Available copy <span className="req">*</span>
            </label>
            <select
              id="rental-inventory"
              className="mdl-select"
              value={effectiveInventoryId}
              onChange={(e) => setInventoryId(Number(e.target.value))}
            >
              {visibleInventory.length === 0 ? (
                <option value={0}>No matching copies in stock</option>
              ) : null}
              {visibleInventory.slice(0, 200).map((it) => (
                <option key={it.inventoryId} value={it.inventoryId}>
                  {it.filmTitle} · Store #{it.storeId} · $
                  {it.filmRate.toFixed(2)} · {it.filmDurationDays}d
                </option>
              ))}
            </select>
            <small className="mdl-hint">
              Showing in-stock copies only. Search the title to narrow the list.
            </small>
          </div>

          {crossStore && (
            <div className="mdl-note" role="status">
              <Icon name="info" size={12} /> Customer&apos;s home store is #
              {selectedCustomer?.storeId} — this copy ships from store #
              {selectedInventory?.storeId}.
            </div>
          )}
        </section>

        <section className="mdl-section">
          <div className="mdl-section-h">Clerk</div>
          <div className="mdl-field">
            <label htmlFor="rental-staff">
              Staff member <span className="req">*</span>
            </label>
            <select
              id="rental-staff"
              className="mdl-select"
              value={staffId}
              onChange={(e) => setStaffId(Number(e.target.value))}
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id} disabled={!s.active}>
                  {s.name} · {s.role} · Store #{s.store}
                  {!s.active ? " · inactive" : ""}
                </option>
              ))}
            </select>
          </div>
        </section>
      </div>

      <footer className="mdl-foot">
        <span className="saved" aria-live="polite">
          {error ? (
            <>
              <Icon name="x" size={11} className="err" />
              <span style={{ color: "var(--danger)" }}>{error}</span>
            </>
          ) : (
            <span style={{ color: "var(--text-soft)" }}>
              Inventory rows are reserved on submit.
            </span>
          )}
        </span>
        <div className="grow" />
        <Btn
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => router.back()}
        >
          Cancel
        </Btn>
        <Btn
          size="sm"
          variant="primary"
          leftIcon="plus"
          type="submit"
          disabled={isPending || visibleInventory.length === 0}
        >
          Create rental
        </Btn>
      </footer>
    </form>
  );
}
