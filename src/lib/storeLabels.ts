/**
 * Shared display metadata for stores. Pagila ships with exactly two stores
 * (Lethbridge and Woodridge); the design pins specific names + accent tones
 * to each so both the film drawer's inventory table and the "Add stock"
 * modal stay visually consistent.
 *
 * Callers should fall back to `Store #${id}` (tone `accent`) when an id is
 * absent from this map — see <FilmDrawer> for the canonical fallback.
 */

export type StoreTone = "accent" | "teal";

export type StoreLabel = {
  name: string;
  tone: StoreTone;
};

export const STORE_LABELS: Record<number, StoreLabel> = {
  1: { name: "Lethbridge", tone: "accent" },
  2: { name: "Woodridge", tone: "teal" },
};

export function storeLabel(storeId: number): StoreLabel {
  return STORE_LABELS[storeId] ?? { name: `Store #${storeId}`, tone: "accent" };
}
