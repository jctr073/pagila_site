"use client";

/**
 * UserMenu — avatar button + popover for the topbar.
 *
 * Phase 3 stubbed the theme + density buttons; Phase 10 wires them to
 * the server actions in @/lib/actions/preferences. The theme picker
 * expands into a sublist (9 options is too many to cycle through);
 * density still cycles since there are only three values.
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
import {
  DENSITIES,
  THEMES,
  THEME_LABELS,
  type Density,
  type Theme,
} from "@/lib/themes";

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

const THEME_SET: ReadonlySet<string> = new Set(THEMES);
const DENSITY_SET: ReadonlySet<string> = new Set(DENSITIES);

export type UserMenuProps = {
  initialTheme?: Theme;
  initialDensity?: Density;
};

export default function UserMenu({
  initialTheme = "system",
  initialDensity = "compact",
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [density, setDensityState] = useState<Density>(initialDensity);
  const [pending, startTransition] = useTransition();

  // Hydrate from cookie on mount so a manual cookie edit / cross-tab
  // change still reflects in the menu label. The new
  // react-hooks/set-state-in-effect rule flags this pattern, but
  // here we're explicitly bridging a client-only source (document.cookie)
  // into React state — exactly what effects are for.
  useEffect(() => {
    const t = readCookie("pa-theme");
    const d = readCookie("pa-density");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t && THEME_SET.has(t)) setThemeState(t as Theme);
    if (d && DENSITY_SET.has(d)) setDensityState(d as Density);
  }, []);

  function pickTheme(next: Theme) {
    setThemeState(next);
    setThemesOpen(false);
    startTransition(async () => {
      try {
        await setTheme(next);
        toast.success(`Theme: ${THEME_LABELS[next]}`);
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

  function close() {
    setOpen(false);
    setThemesOpen(false);
  }

  function signOut() {
    // Real auth lands later — for now, just close the menu.
    close();
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
            onClick={close}
          />
          <div className="pa-usermenu-pop" role="menu">
            <a className="pa-usermenu-item" href="/profile" role="menuitem">
              Profile
            </a>
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={themesOpen}
              className="pa-usermenu-item"
              onClick={() => setThemesOpen((v) => !v)}
              disabled={pending}
            >
              Theme: <b>{THEME_LABELS[theme]}</b>
            </button>
            {themesOpen && (
              <div className="pa-usermenu-sublist" role="menu" aria-label="Theme">
                {THEMES.map((t) => (
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={t === theme}
                    key={t}
                    className={
                      "pa-usermenu-item is-sub" +
                      (t === theme ? " is-active" : "")
                    }
                    onClick={() => pickTheme(t)}
                    disabled={pending}
                  >
                    <span
                      className="pa-theme-swatch"
                      data-theme={t}
                      aria-hidden="true"
                    />
                    {THEME_LABELS[t]}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              role="menuitem"
              className="pa-usermenu-item"
              onClick={cycleDensity}
              disabled={pending}
            >
              Density: <b>{cap(density)}</b>
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
