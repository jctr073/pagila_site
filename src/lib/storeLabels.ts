/**
 * Shared display metadata for stores. When `store.name` is populated
 * (migration 1779069011555) it wins; otherwise the label falls back to
 * the store's city plus its numeric id (e.g. "Woodridge #2") so any
 * store — including ones added after the canonical Pagila seed — still
 * gets a meaningful name without a hardcoded lookup table.
 *
 * Tone alternates by id parity (odd → accent, even → teal) so the two
 * shipped Pagila stores keep their original colors (Lethbridge #1 =
 * accent, Woodridge #2 = teal).
 */

export type StoreTone = "accent" | "teal";

export type StoreLabel = {
  name: string;
  tone: StoreTone;
};

export type StoreLabelInput = {
  id: number;
  city: string | null | undefined;
  name?: string | null | undefined;
};

export function storeLabel({ id, city, name }: StoreLabelInput): StoreLabel {
  const trimmedName = name?.trim();
  const trimmedCity = city?.trim();
  const label = trimmedName
    ? trimmedName
    : trimmedCity
      ? `${trimmedCity} #${id}`
      : `Store #${id}`;
  const tone: StoreTone = id % 2 === 0 ? "teal" : "accent";
  return { name: label, tone };
}
