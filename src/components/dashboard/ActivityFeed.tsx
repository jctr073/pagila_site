import { Chip } from "@/components/ui";
import type { RecentActivity } from "@/lib/types";

export type ActivityFeedProps = {
  items: RecentActivity[];
};

const KIND_DOT: Record<string, string> = {
  payment: "db-dot--accent",
  rental: "db-dot--teal",
  update: "db-dot--success",
  archive: "db-dot--warning",
};

function shortAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.round(diffMs / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const days = Math.round(hr / 24);
  return `${days}d`;
}

function describe(item: RecentActivity): string {
  const verb = item.kind === "payment" ? "collected" : "logged";
  // For payments the detail is the amount string; render it with a "$" prefix
  // so the feed reads naturally ("Mike H. collected $4.99 on Academy Dinosaur").
  const detail =
    item.kind === "payment" ? `$${item.detail}` : item.detail;
  return `${item.who} ${verb} ${detail} on `;
}

/**
 * Recent-activity card. Ports the `db-feed` block from
 * design_handoff_pagila_admin/designs/dashboard.jsx — colored dot · body
 * text · mono relative timestamp.
 */
export default function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="pa-card db-actv" style={{ display: "flex", flexDirection: "column" }}>
      <div className="db-section-h">
        <h3>Recent activity</h3>
        <div className="spacer" />
        <Chip dot tone="teal">
          Live
        </Chip>
      </div>
      <div className="db-feed">
        {items.map((item, i) => (
          <div key={`${item.at}-${i}`} className="db-actv-row">
            <span className={`dot ${KIND_DOT[item.kind] ?? "db-dot--accent"}`} />
            <div className="body">
              {describe(item)}
              <b>{item.what}</b>
            </div>
            <span className="time">{shortAgo(item.at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
