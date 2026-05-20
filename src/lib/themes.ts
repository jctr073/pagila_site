/**
 * Theme & density value types + labels.
 *
 * Lives in its own module (rather than alongside `getPreferences`)
 * because the latter imports `next/headers`, which is server-only.
 * Client components like the UserMenu need the option lists + labels
 * at runtime, so they import from here instead. server-only code in
 * src/lib/preferences.ts re-exports these for symmetry.
 */

// "system" resolves to one of the two cross-mode defaults (persimmon
// for light, dark for dark) via prefers-color-scheme. The remaining
// values are explicit looks added by design handoff #2.
export type Theme =
  | "system"
  | "persimmon"
  | "dark"
  | "midnight"
  | "plum"
  | "forest"
  | "cobalt"
  | "mint"
  | "mono";
export type Density = "compact" | "regular" | "comfy";

export const THEME_COOKIE = "pa-theme";
export const DENSITY_COOKIE = "pa-density";

export const DEFAULT_THEME: Theme = "system";
export const DEFAULT_DENSITY: Density = "compact";

export const THEMES: readonly Theme[] = [
  "system",
  "persimmon",
  "dark",
  "midnight",
  "plum",
  "forest",
  "cobalt",
  "mint",
  "mono",
] as const;

export const DENSITIES: readonly Density[] = [
  "compact",
  "regular",
  "comfy",
] as const;

export const THEME_LABELS: Record<Theme, string> = {
  system: "System",
  persimmon: "Persimmon",
  dark: "Warm Dark",
  midnight: "Midnight Lime",
  plum: "Plum Velvet",
  forest: "Forest Amber",
  cobalt: "Cobalt Paper",
  mint: "Slate Mint",
  mono: "Mono",
};

// Themes whose token blocks produce a dark canvas. The no-flash
// bootstrap uses this to figure out which class to apply when the
// saved theme is "system" and the OS asks for dark mode.
export const DARK_THEMES: ReadonlySet<Theme> = new Set([
  "dark",
  "midnight",
  "plum",
  "forest",
]);

/**
 * Map a Theme to the html-level class. The default light look
 * ("persimmon") lives on `:root` with no class, so it returns "".
 * "system" also returns "" here — the inline bootstrap in layout.tsx
 * adds the right class before paint when the OS prefers dark mode.
 */
export function themeClassFor(theme: Theme): string {
  switch (theme) {
    case "dark":
      return "theme-dark";
    case "midnight":
      return "theme-midnight";
    case "plum":
      return "theme-plum";
    case "forest":
      return "theme-forest";
    case "cobalt":
      return "theme-cobalt";
    case "mint":
      return "theme-mint";
    case "mono":
      return "theme-mono";
    case "persimmon":
    case "system":
    default:
      return "";
  }
}
