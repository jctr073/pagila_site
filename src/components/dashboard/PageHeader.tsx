import { Btn } from "@/components/ui";

/**
 * Format a `Date` as a relative time string ("just now", "2 min ago",
 * "3 hours ago", "5 days ago"). Locale-free, deterministic, no Intl.
 */
function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const sec = Math.max(0, Math.round(diffMs / 1000));
  if (sec < 45) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const days = Math.round(hr / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export type PageHeaderProps = {
  greetingName: string;
  lastSyncAt: Date;
};

/**
 * Dashboard page header — greeting + last-sync timestamp + range filter +
 * "New film" primary CTA. Server-renderable; no client hooks.
 *
 * Class structure ported verbatim from
 * design_handoff_pagila_admin/designs/dashboard.jsx (the `pa-page-h`
 * block). Style rules live in src/app/_dashboard.css.
 */
export default function PageHeader({
  greetingName,
  lastSyncAt,
}: PageHeaderProps) {
  return (
    <div className="pa-page-h db-page-head">
      <div className="ttl">
        <h1>Good day, {greetingName}</h1>
        <p>Catalog &amp; inventory across both stores — synced {relativeTime(lastSyncAt)}.</p>
      </div>
      <div className="actions">
        <Btn size="sm" variant="ghost" leftIcon="clock">
          Last 30 days
        </Btn>
        <Btn size="sm" leftIcon="plus" variant="primary">
          New film
        </Btn>
      </div>
    </div>
  );
}
