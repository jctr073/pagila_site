"use client";

/**
 * Topbar — sticky header for the admin shell.
 *
 * Ported from design_handoff_pagila_admin/designs/shell.jsx#Topbar.
 *
 * Layout (CSS grid, see .pa-topbar in src/app/_shell.css):
 *   [breadcrumb] [search]  ...  [bell] [avatar]
 *
 * The bell and avatar are placeholders for popover-triggering islands
 * landing in later phases; UserMenu already wraps the avatar.
 */

import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import Btn from "@/components/ui/Btn";
import type { Density, Theme } from "@/lib/preferences";
import UserMenu from "./UserMenu";

export type TopbarProps = {
  /** Optional breadcrumb tail, e.g. "Films / Detail". Slashes are rendered as chevrons. */
  crumb?: string;
  /** Initial theme value for the UserMenu — forwarded from the admin layout (server-read). */
  initialTheme?: Theme;
  /** Initial density value for the UserMenu — forwarded from the admin layout (server-read). */
  initialDensity?: Density;
};

function renderCrumb(crumb?: string) {
  if (!crumb) return null;
  const parts = crumb.split("/").map((p) => p.trim()).filter(Boolean);
  return parts.map((part, i) => {
    const isLast = i === parts.length - 1;
    return (
      <span key={`${i}-${part}`} className="pa-crumb-seg">
        {i > 0 && (
          <Icon name="chevron-right" size={12} className="pa-crumb-sep" />
        )}
        {isLast ? <b>{part}</b> : <span>{part}</span>}
      </span>
    );
  });
}

export default function Topbar({
  crumb,
  initialTheme,
  initialDensity,
}: TopbarProps) {
  return (
    <header className="pa-topbar">
      <div className="pa-crumb">{renderCrumb(crumb)}</div>

      <div className="pa-topbar-search">
        <Input
          leftIcon="search"
          placeholder="Search films, actors, customers…"
          kbd="⌘K"
          size="sm"
          wrapStyle={{ width: "100%" }}
          aria-label="Search"
        />
      </div>

      <div className="pa-topbar-right">
        <Btn
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Notifications"
          leftIcon="bell"
        />
        <div className="pa-topbar-rule" aria-hidden />
        <UserMenu
          initialTheme={initialTheme}
          initialDensity={initialDensity}
        />
      </div>
    </header>
  );
}
