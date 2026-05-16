import type { CSSProperties, ReactNode } from "react";
import { cn } from "./cn";

export type ChipTone =
  | "default"
  | "solid"
  | "teal"
  | "success"
  | "warning"
  | "danger"
  | "violet"
  | "accent"; // alias for `solid`

export type ChipProps = {
  tone?: ChipTone;
  dot?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Chip — small rounded pill. Tones come from designs/primitives.jsx:
 *   default (no class) / solid / teal / success / warning / danger / violet.
 * `accent` is accepted as an alias of `solid` because the design references
 * both names in different places.
 */
export default function Chip({
  tone = "default",
  dot,
  children,
  className,
  style,
}: ChipProps) {
  const toneClass =
    tone === "default"
      ? ""
      : tone === "accent"
        ? "solid"
        : tone;
  return (
    <span className={cn("pa-chip", toneClass, className)} style={style}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}
