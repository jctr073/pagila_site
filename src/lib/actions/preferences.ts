"use server";

/**
 * Server actions for the theme + density preference cookies.
 *
 * Why server actions instead of toggling classes client-side: cookie
 * writes happen server-side, then `revalidatePath('/', 'layout')`
 * forces the root layout to re-render with the new <html>/<body>
 * classes. The client sees the new class as part of the next RSC
 * payload, so there's no class-application flash on reload either.
 *
 * Next 16 (node_modules/next/dist/docs/01-app/03-api-reference/
 * 04-functions/revalidatePath.md): `revalidatePath(path, type?)`
 * where type is 'page' | 'layout'. Using 'layout' here invalidates
 * the root layout (and everything beneath it) so the cookie-driven
 * class change actually takes effect on the next paint.
 */

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import {
  DENSITY_COOKIE,
  THEME_COOKIE,
  type Density,
  type Theme,
} from "@/lib/preferences";

const ONE_YEAR = 60 * 60 * 24 * 365;

const THEMES: ReadonlySet<Theme> = new Set(["light", "dark", "system"]);
const DENSITIES: ReadonlySet<Density> = new Set([
  "compact",
  "regular",
  "comfy",
]);

export async function setTheme(theme: Theme): Promise<void> {
  if (!(THEMES as Set<string>).has(theme)) {
    throw new Error(`invalid theme: ${theme}`);
  }
  const store = await cookies();
  store.set(THEME_COOKIE, theme, {
    path: "/",
    sameSite: "lax",
    maxAge: ONE_YEAR,
  });
  revalidatePath("/", "layout");
}

export async function setDensity(density: Density): Promise<void> {
  if (!(DENSITIES as Set<string>).has(density)) {
    throw new Error(`invalid density: ${density}`);
  }
  const store = await cookies();
  store.set(DENSITY_COOKIE, density, {
    path: "/",
    sameSite: "lax",
    maxAge: ONE_YEAR,
  });
  revalidatePath("/", "layout");
}
