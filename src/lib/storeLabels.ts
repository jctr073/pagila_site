/**
 * Shared display metadata for stores. The label is derived from the
 * store's city plus its numeric id (e.g. "Woodridge #2") so any store
 * — including ones added after the canonical Pagila seed — gets a
 * meaningful name without a hardcoded lookup table.
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
};

export function storeLabel({ id, city }: StoreLabelInput): StoreLabel {
  const trimmed = city?.trim();
  const name = trimmed ? `${trimmed} #${id}` : `Store #${id}`;
  const tone: StoreTone = id % 2 === 0 ? "teal" : "accent";
  return { name, tone };
}
