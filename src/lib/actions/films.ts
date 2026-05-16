"use server";

/**
 * Server actions for the films list (Phase 6).
 *
 * Each action accepts plain typed arguments and calls into the query layer
 * in @/lib/queries/films, then `revalidatePath('/films')` so the server
 * component re-fetches and the table reflects the new value on next render.
 *
 * Why both `bind`-able direct calls AND a `useActionState`-compatible
 * `*FormAction` variant for inline edits: the inline-edit pattern in the
 * design relies on local optimistic state + a fire-and-forget call when
 * the user blurs/Enter — so the client calls these as plain async fns. We
 * expose the `FormAction` variant in case a caller wants pending/error
 * tracking via the React 19 `useActionState` hook (Next 16 forms docs:
 * node_modules/next/dist/docs/01-app/02-guides/forms.md).
 */

import { revalidatePath } from "next/cache";

import {
  bulkArchiveFilms as q_bulkArchive,
  bulkSetCategory as q_bulkCat,
  updateFilm as q_updateFilm,
  updateFilmCategory as q_updateCat,
  updateFilmRate as q_updateRate,
} from "@/lib/queries/films";
import type { FilmDetail } from "@/lib/types";

// ── Direct (non-form) entry points ─────────────────────────────────────

export async function updateRate(id: number, rate: number): Promise<void> {
  if (!Number.isFinite(id) || id <= 0) throw new Error("invalid id");
  if (!Number.isFinite(rate) || rate < 0) throw new Error("invalid rate");
  await q_updateRate(id, rate);
  revalidatePath("/films");
}

export async function updateCategory(
  id: number,
  categoryId: number,
): Promise<void> {
  if (!Number.isFinite(id) || id <= 0) throw new Error("invalid id");
  if (!Number.isFinite(categoryId) || categoryId <= 0)
    throw new Error("invalid categoryId");
  await q_updateCat(id, categoryId);
  revalidatePath("/films");
}

export async function bulkSetCategory(
  ids: number[],
  categoryId: number,
): Promise<void> {
  if (!Array.isArray(ids) || ids.length === 0) return;
  if (!Number.isFinite(categoryId) || categoryId <= 0)
    throw new Error("invalid categoryId");
  await q_bulkCat(ids, categoryId);
  revalidatePath("/films");
}

export async function bulkArchive(ids: number[]): Promise<void> {
  if (!Array.isArray(ids) || ids.length === 0) return;
  // NOTE: q_bulkArchive will fail at runtime until the `archived_at`
  // migration ships (see queries/films.ts). We surface the error to the
  // caller so the bulk-bar can show a toast.
  await q_bulkArchive(ids);
  revalidatePath("/films");
}

// ── Film detail update (Phase 7/8) ─────────────────────────────────────
//
// The detail drawer's "Edit film" modal calls this on every debounced
// change (auto-save) AND on the explicit "Save changes" click. It returns
// an `ActionState`-shaped result so the client can show "Saved" / "Failed"
// without throwing.
//
// We allow-list the patch keys so callers can't inject arbitrary columns
// via the network — even though server actions are not directly callable
// from outside the app, defense in depth is cheap.
const ALLOWED_PATCH_KEYS = new Set<keyof FilmDetail>([
  "title",
  "desc",
  "year",
  "durationDays",
  "rate",
  "length",
  "replace",
  "rating",
  "features",
  "categoryId",
  "languageId",
  "originalLanguageId",
]);

export type UpdateFilmResult =
  | { ok: true; savedAt: string }
  | { ok: false; error: string };

export async function updateFilm(
  id: number,
  patch: Partial<FilmDetail>,
): Promise<UpdateFilmResult> {
  try {
    if (!Number.isFinite(id) || id <= 0) {
      return { ok: false, error: "invalid id" };
    }
    if (!patch || typeof patch !== "object") {
      return { ok: false, error: "invalid patch" };
    }

    const sanitised: Partial<FilmDetail> = {};
    for (const k of Object.keys(patch) as (keyof FilmDetail)[]) {
      if (ALLOWED_PATCH_KEYS.has(k)) {
        // Cast through unknown to satisfy TS — runtime shape is validated
        // by Postgres column types.
        (sanitised as Record<string, unknown>)[k] = (
          patch as Record<string, unknown>
        )[k];
      }
    }
    if (Object.keys(sanitised).length === 0) {
      // Nothing actually changed — return current time so the UI's
      // "Auto-saved Xs ago" indicator still updates.
      return { ok: true, savedAt: new Date().toISOString() };
    }

    await q_updateFilm(id, sanitised);
    revalidatePath("/films");
    revalidatePath(`/films/${id}`);
    revalidatePath(`/films/${id}/edit`);
    return { ok: true, savedAt: new Date().toISOString() };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ── useActionState form-action wrappers ────────────────────────────────
//
// Signature per Next 16 forms.md: `(prevState, formData) => nextState`.
// Each returns `{ ok, error? }` so the client can react to failure.

export type ActionState = { ok: boolean; error?: string };

export async function updateRateFormAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const id = Number(formData.get("id"));
    const rate = Number(formData.get("rate"));
    await updateRate(id, rate);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function updateCategoryFormAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const id = Number(formData.get("id"));
    const categoryId = Number(formData.get("categoryId"));
    await updateCategory(id, categoryId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
