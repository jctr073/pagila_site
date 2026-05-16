import Chip, { type ChipTone } from "./Chip";

/**
 * CategoryChip — maps a Pagila film category name to a Chip tone.
 * Tone table is ported verbatim from designs/primitives.jsx CAT_TONES.
 * Unmapped categories render as the default tone.
 */

const CAT_TONES: Record<string, ChipTone> = {
  Action: "danger",
  Animation: "violet",
  Children: "teal",
  Classics: "default",
  Comedy: "warning",
  Documentary: "default",
  Drama: "solid",
  Family: "success",
  Foreign: "violet",
  Games: "teal",
  Horror: "danger",
  Music: "solid",
  New: "success",
  "Sci-Fi": "teal",
  Sports: "warning",
  Travel: "violet",
};

export default function CategoryChip({ value }: { value: string }) {
  const tone = CAT_TONES[value] ?? "default";
  return <Chip tone={tone}>{value}</Chip>;
}
