import type { SVGProps } from "react";

/**
 * Icon — inline SVG glyph set ported from
 * design_handoff_pagila_admin/designs/primitives.jsx.
 *
 * Stroke 1.7, viewBox 0 0 24 24, rounded line caps.
 *
 * Names track the canonical spec list (e.g. `chevron-down`, `more-horiz`)
 * with aliases for the shorter primitives.jsx names (`chevDown`, `more`)
 * so call-sites copied from the design files keep working.
 */

const PATHS = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  check: "M5 12l4 4 10-10",
  x: "M6 6l12 12M18 6 6 18",
  "chevron-down": "m6 9 6 6 6-6",
  "chevron-up": "m18 15-6-6-6 6",
  "chevron-right": "m9 6 6 6-6 6",
  "chevron-left": "m15 6-6 6 6 6",
  "chevron-up-down": "M8 9l4-4 4 4M8 15l4 4 4-4",
  filter: "M4 5h16M7 12h10M10 19h4",
  sort:
    "M3 6h13M3 12h9M3 18h5M17 8l4-4 4 4M21 4v16M17 16l4 4 4-4",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  list:
    "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  pencil: "M4 20h4l11-11-4-4L4 16v4z",
  edit: "M4 20h4l11-11-4-4L4 16v4z",
  trash:
    "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13",
  upload: "M12 16V4M6 10l6-6 6 6M4 20h16",
  download: "M12 4v12M6 14l6 6 6-6M4 20h16",
  settings:
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z",
  film:
    "M4 4h16v16H4zM4 8h16M4 16h16M8 4v16M16 4v16",
  users:
    "M16 17a4 4 0 0 0-8 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 17a4 4 0 0 0-3-3.87M19 5a4 4 0 0 1 0 7.75",
  store: "M3 9l1-5h16l1 5M5 9v11h14V9M9 13h6",
  tag: "M3 12V3h9l9 9-9 9-9-9ZM7 7h.01",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9ZM10 21a2 2 0 0 0 4 0",
  home: "M3 12 12 3l9 9M5 10v10h14V10",
  bookmark:
    "M5 4v17l7-5 7 5V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1Z",
  cycle:
    "M21 4v6h-6M3 20v-6h6M21 10a9 9 0 0 0-16.1-2M3 14a9 9 0 0 0 16.1 2",
  money:
    "M12 5v14M16 9a3 3 0 0 0-3-2h-2a2.5 2.5 0 0 0 0 5h2a2.5 2.5 0 0 1 0 5h-2a3 3 0 0 1-3-2",
  star: "M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 16.8 6.6 19.6l1-6L3.3 9.4l6-.9z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
  sun:
    "M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 20.5 19 19M5 19l-1.5 1.5M20.5 3.5 19 5M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  "more-horiz": "M5 12h.01M12 12h.01M19 12h.01",
  kebab: "M12 5h.01M12 12h.01M12 19h.01",
  folder:
    "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z",
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
  "arrow-up": "M12 19V5M6 11l6-6 6 6",
  "arrow-down": "M12 5v14M6 13l6 6 6-6",
  info: "M12 8h.01M11 12h1v4h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  clock: "M12 7v5l3 2 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  sparkle:
    "M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z",
  duplicate: "M9 9h10v10H9zM5 5h10v3M5 5v10h3",
  image: "M4 5h16v14H4zM4 15l5-5 5 5M14 12l3-3 3 3",
  archive: "M3 5h18v4H3zM5 9v10h14V9M10 13h4",
  play: "M7 4l13 8-13 8z",
  // box (for inventory/products nav)
  box:
    "M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8",

  // ── primitives.jsx legacy aliases (camelCase) ───────────────────────
  chevDown: "m6 9 6 6 6-6",
  chevUp: "m18 15-6-6-6 6",
  chevRight: "m9 6 6 6-6 6",
  chevLeft: "m15 6-6 6 6 6",
  chevUpDown: "M8 9l4-4 4 4M8 15l4 4 4-4",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  arrowUp: "M12 19V5M6 11l6-6 6 6",
  arrowDown: "M12 5v14M6 13l6 6 6-6",
  more: "M5 12h.01M12 12h.01M19 12h.01",
} as const;

export type IconName = keyof typeof PATHS;

export type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
} & Omit<SVGProps<SVGSVGElement>, "name">;

export default function Icon({
  name,
  size = 14,
  className,
  strokeWidth = 1.7,
  ...rest
}: IconProps) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
