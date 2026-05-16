"use server";

/**
 * Server action: add physical inventory rows for a film across one or
 * more stores. The drawer's "Add stock" modal is the sole caller today.
 *
 * On success, revalidates the film list, the standalone film page, and
 * the add-inventory modal route so the drawer's inventory table reflects
 * the new counts when the user dismisses the modal.
 */

import { revalidatePath } from "next/cache";

import {
  addFilmInventory as q_addFilmInventory,
  type AddInventoryItem,
} from "@/lib/queries/inventory";

export type AddInventoryResult =
  | { ok: true; added: number }
  | { ok: false; error: string };

// Sanity cap per store per call. The modal lets users type freely, so we
// guard against fat-finger 99999 entries that would balloon the inventory
// table.
const MAX_UNITS_PER_STORE = 100;

export async function addFilmInventory(
  filmId: number,
  items: AddInventoryItem[],
): Promise<AddInventoryResult> {
  try {
    if (!Number.isInteger(filmId) || filmId <= 0) {
      return { ok: false, error: "invalid film id" };
    }
    if (!Array.isArray(items)) {
      return { ok: false, error: "invalid items" };
    }

    // Filter: keep only entries with an integer store_id and a positive
    // integer unit count within the cap. store_id = 0 is a legitimate
    // primary key in Pagila — only `inventory.store_id` having a matching
    // row in `store` matters; the FK enforces that at insert time.
    // Collapse duplicate store_ids by summing their units — friendlier
    // than rejecting.
    const merged = new Map<number, number>();
    for (const raw of items) {
      const storeId = Number(raw?.storeId);
      const units = Number(raw?.units);
      if (!Number.isInteger(storeId)) continue;
      if (!Number.isInteger(units) || units <= 0) continue;
      const capped = Math.min(units, MAX_UNITS_PER_STORE);
      merged.set(storeId, (merged.get(storeId) ?? 0) + capped);
    }
    // Re-cap after merging duplicates.
    const cleaned: AddInventoryItem[] = Array.from(merged.entries()).map(
      ([storeId, units]) => ({
        storeId,
        units: Math.min(units, MAX_UNITS_PER_STORE),
      }),
    );

    if (cleaned.length === 0) {
      return { ok: true, added: 0 };
    }

    const added = await q_addFilmInventory(filmId, cleaned);

    revalidatePath("/films");
    revalidatePath(`/films/${filmId}`);
    revalidatePath(`/films/${filmId}/add-inventory`);

    return { ok: true, added };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
