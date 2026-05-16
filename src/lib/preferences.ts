/**
 * Server-side preference reader.
 *
 * The theme/density toggles in the user menu write to cookies via
 * server actions (src/lib/actions/preferences.ts). The root layout
 * reads those cookies at request time and applies the resulting CSS
 * classes server-side, so the page renders with the correct theme +
 * density on first paint — no client-side flash.
 *
 * Next 16 (node_modules/next/dist/docs/01-app/03-api-reference/
 * 04-functions/cookies.md): `cookies()` is async and returns a Promise
 * of a read-only cookie store. We can read but not set here; mutations
 * happen in server actions / route handlers only.
 */

import { cookies } from "next/headers";

export type Theme = "light" | "dark" | "system";
export type Density = "compact" | "regular" | "comfy";

export const THEME_COOKIE = "pa-theme";
export const DENSITY_COOKIE = "pa-density";

export const DEFAULT_THEME: Theme = "system";
export const DEFAULT_DENSITY: Density = "compact";

const THEME_VALUES: ReadonlySet<Theme> = new Set(["light", "dark", "system"]);
const DENSITY_VALUES: ReadonlySet<Density> = new Set([
  "compact",
  "regular",
  "comfy",
]);

function asTheme(v: string | undefined): Theme {
  return v && (THEME_VALUES as Set<string>).has(v) ? (v as Theme) : DEFAULT_THEME;
}
function asDensity(v: string | undefined): Density {
  return v && (DENSITY_VALUES as Set<string>).has(v)
    ? (v as Density)
    : DEFAULT_DENSITY;
}

export async function getPreferences(): Promise<{
  theme: Theme;
  density: Density;
}> {
  const store = await cookies();
  return {
    theme: asTheme(store.get(THEME_COOKIE)?.value),
    density: asDensity(store.get(DENSITY_COOKIE)?.value),
  };
}

/**
 * Map a Theme to the html-level class. 'system' resolves to '' here
 * because we leave the resolution to a tiny inline script that reads
 * matchMedia('(prefers-color-scheme: dark)') before first paint. That
 * keeps dark-mode-on-system users flash-free.
 */
export function themeClassFor(theme: Theme): "" | "theme-dark" {
  return theme === "dark" ? "theme-dark" : "";
}
