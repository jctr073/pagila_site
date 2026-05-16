"use client";

/**
 * Sidebar — admin shell navigation column.
 *
 * Ported from design_handoff_pagila_admin/designs/shell.jsx#Sidebar.
 * Active state derives from the current pathname (next/navigation).
 *
 * Class hooks: .pa-sidebar (root), .pa-brand, .pa-side-store,
 * .pa-side-group, .pa-side-item (with .is-active modifier), .pa-side-foot.
 * Geometry tokens (--sidebar-w, --border, --surface, etc.) come from
 * src/app/globals.css; per-shell layout CSS lives in src/app/_shell.css.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";

type NavItem = {
  href: string;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
};

type NavSection = {
  id: string;
  label?: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: "home" }],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      { href: "/films", label: "Films", icon: "film" },
      { href: "/categories", label: "Categories", icon: "tag" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [{ href: "/stores", label: "Stores & Staff", icon: "store" }],
  },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar() {
  const pathname = usePathname();
  const [storeOpen, setStoreOpen] = useState(false);

  return (
    <aside className="pa-sidebar">
      <div className="pa-brand">
        <div className="pa-brand-logo" aria-hidden>
          P
        </div>
        <div className="pa-brand-text">
          <div className="pa-brand-name">Pagila</div>
          <div className="pa-brand-sub">Admin</div>
        </div>
      </div>

      <div className="pa-side-store-wrap">
        <button
          type="button"
          className="pa-side-store"
          aria-haspopup="menu"
          aria-expanded={storeOpen}
          onClick={() => setStoreOpen((v) => !v)}
        >
          <Avatar initials="A" tone="accent" size={24} />
          <span className="lbl">
            <b>Store</b>
            <span>All locations</span>
          </span>
          <Icon name="chevron-up-down" size={14} />
        </button>
        {storeOpen && (
          <>
            {/* Backdrop closes the popover on outside click. */}
            <button
              type="button"
              aria-label="Close store picker"
              className="pa-popover-backdrop"
              onClick={() => setStoreOpen(false)}
            />
            <div className="pa-side-store-pop" role="menu">
              <button
                type="button"
                role="menuitem"
                className="pa-side-store-opt"
                onClick={() => setStoreOpen(false)}
              >
                All locations
              </button>
              <button
                type="button"
                role="menuitem"
                className="pa-side-store-opt"
                onClick={() => setStoreOpen(false)}
              >
                Store #1
              </button>
              <button
                type="button"
                role="menuitem"
                className="pa-side-store-opt"
                onClick={() => setStoreOpen(false)}
              >
                Store #2
              </button>
            </div>
          </>
        )}
      </div>

      <nav className="pa-side-nav">
        {SECTIONS.map((section) => (
          <div key={section.id} className="pa-side-section">
            {section.label && (
              <div className="pa-side-group">{section.label}</div>
            )}
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`pa-side-item${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon name={item.icon} size={15} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="pa-side-foot">
        <Link href="/help" className="pa-side-item">
          <Icon name="info" size={15} />
          <span>Help &amp; shortcuts</span>
        </Link>
        <div className="pa-side-version">v0.1.0 · Phase 3</div>
      </div>
    </aside>
  );
}
