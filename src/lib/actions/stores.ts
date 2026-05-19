"use server";

/**
 * Server actions for the stores list / detail.
 *
 * Mirrors lib/actions/films.ts: an allow-listed `updateStore` that the
 * edit modal calls on debounced auto-save AND on "Save changes". Returns
 * an `ActionState`-shaped result so the form can render saving/saved/error
 * states without throwing.
 */

import { revalidatePath } from "next/cache";

import { updateStore as q_updateStore } from "@/lib/queries/stores";
import type { StoreEditPatch } from "@/lib/types";

const ALLOWED_PATCH_KEYS = new Set<keyof StoreEditPatch>([
  "name",
  "address",
  "address2",
  "district",
  "postal",
  "phone",
  "cityId",
]);

export type UpdateStoreResult =
  | { ok: true; savedAt: string }
  | { ok: false; error: string };

export async function updateStore(
  id: number,
  patch: StoreEditPatch,
): Promise<UpdateStoreResult> {
  try {
    if (!Number.isFinite(id) || id <= 0) {
      return { ok: false, error: "invalid id" };
    }
    if (!patch || typeof patch !== "object") {
      return { ok: false, error: "invalid patch" };
    }

    const sanitised: StoreEditPatch = {};
    for (const k of Object.keys(patch) as (keyof StoreEditPatch)[]) {
      if (ALLOWED_PATCH_KEYS.has(k)) {
        (sanitised as Record<string, unknown>)[k] = (
          patch as Record<string, unknown>
        )[k];
      }
    }
    if (Object.keys(sanitised).length === 0) {
      return { ok: true, savedAt: new Date().toISOString() };
    }

    await q_updateStore(id, sanitised);
    revalidatePath("/stores");
    revalidatePath(`/stores/${id}`);
    revalidatePath(`/stores/${id}/edit`);
    return { ok: true, savedAt: new Date().toISOString() };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
