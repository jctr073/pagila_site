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
 *
 * Type/label exports re-exported from ./themes so client components
 * can import option lists without dragging `next/headers` into the
 * browser bundle.
 */

import { cookies } from "next/headers";

import {
  DEFAULT_DENSITY,
  DEFAULT_THEME,
  DENSITIES,
  DENSITY_COOKIE,
  THEMES,
  THEME_COOKIE,
  type Density,
  type Theme,
} from "./themes";

export {
  DARK_THEMES,
  DEFAULT_DENSITY,
  DEFAULT_THEME,
  DENSITIES,
  DENSITY_COOKIE,
  THEMES,
  THEME_COOKIE,
  THEME_LABELS,
  themeClassFor,
  type Density,
  type Theme,
} from "./themes";

const THEME_VALUES: ReadonlySet<string> = new Set([...THEMES, "light"]);
const DENSITY_VALUES: ReadonlySet<string> = new Set(DENSITIES);

function asTheme(v: string | undefined): Theme {
  if (!v || !THEME_VALUES.has(v)) return DEFAULT_THEME;
  // legacy: pre-handoff-2 cookies stored "light"
  if (v === "light") return "persimmon";
  return v as Theme;
}
function asDensity(v: string | undefined): Density {
  return v && DENSITY_VALUES.has(v) ? (v as Density) : DEFAULT_DENSITY;
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
