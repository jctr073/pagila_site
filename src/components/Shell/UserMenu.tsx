"use client";

/**
 * UserMenu — avatar button + popover for the topbar.
 *
 * Phase 3 stubbed the theme + density buttons; Phase 10 wires them to
 * the server actions in @/lib/actions/preferences. Each toggle cycles
 * through its value space, calls the server action inside a
 * `useTransition` so the menu stays responsive, and emits a toast.
 *
 * The actual <html>/<body> classes are applied server-side after the
 * cookie write — see src/app/layout.tsx + src/lib/preferences.ts. We
 * deliberately do NOT also toggle classes from the client, because
 * that double-application is exactly the flash this design is meant
 * to avoid.
 */

import { useEffect, useState, useTransition } from "react";

import Avatar from "@/components/ui/Avatar";
import { toast } from "@/components/ui/Toast";
import { setDensity, setTheme } from "@/lib/actions/preferences";
import type { Density, Theme } from "@/lib/preferences";

const THEMES: readonly Theme[] = ["light", "dark", "system"];
const DENSITIES: readonly Density[] = ["compact", "regular", "comfy"];

function nextOf<T>(arr: readonly T[], current: T): T {
  const i = arr.indexOf(current);
  return arr[(i + 1) % arr.length] ?? arr[0];
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&") + "=([^;]+)"),
  );
  return m ? decodeURIComponent(m[1]) : undefined;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export type UserMenuProps = {
  initialTheme?: Theme;
  initialDensity?: Density;
};

export default function UserMenu({
  initialTheme = "system",
  initialDensity = "compact",
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [density, setDensityState] = useState<Density>(initialDensity);
  const [pending, startTransition] = useTransition();

  // Hydrate from cookie on mount so a manual cookie edit / cross-tab
  // change still reflects in the menu label. The new
  // react-hooks/set-state-in-effect rule flags this pattern, but
  // here we're explicitly bridging a client-only source (document.cookie)
  // into React state — exactly what effects are for.
  useEffect(() => {
    const t = readCookie("pa-theme") as Theme | undefined;
    const d = readCookie("pa-density") as Density | undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t && THEMES.includes(t)) setThemeState(t);
    if (d && DENSITIES.includes(d)) setDensityState(d);
  }, []);

  function cycleTheme() {
    const next = nextOf(THEMES, theme);
    setThemeState(next);
    startTransition(async () => {
      try {
        await setTheme(next);
        toast.success(`Theme: ${cap(next)}`);
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  function cycleDensity() {
    const next = nextOf(DENSITIES, density);
    setDensityState(next);
    startTransition(async () => {
      try {
        await setDensity(next);
        toast.success(`Density: ${cap(next)}`);
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  function signOut() {
    // Real auth lands later — for now, just close the menu.
    setOpen(false);
  }

  return (
    <div className="pa-usermenu">
      <button
        type="button"
        className="pa-usermenu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar initials="DA" tone="teal" size={28} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close account menu"
            className="pa-popover-backdrop"
            onClick={() => setOpen(false)}
          />
          <div className="pa-usermenu-pop" role="menu">
            <a className="pa-usermenu-item" href="/profile" role="menuitem">
              Profile
            </a>
            <button
              type="button"
              role="menuitem"
              className="pa-usermenu-item"
              onClick={cycleTheme}
              disabled={pending}
            >
              Theme: <b>{theme}</b>
            </button>
            <button
              type="button"
              role="menuitem"
              className="pa-usermenu-item"
              onClick={cycleDensity}
              disabled={pending}
            >
              Density: <b>{density}</b>
            </button>
            <div className="pa-usermenu-sep" role="separator" />
            <button
              type="button"
              role="menuitem"
              className="pa-usermenu-item is-danger"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
