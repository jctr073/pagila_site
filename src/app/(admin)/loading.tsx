/**
 * Generic admin-section loading skeleton.
 *
 * Renders a header row + 4 KPI tile placeholders. Used as the suspense
 * fallback for any (admin) route that doesn't ship its own loading.tsx
 * (e.g. /, /sandbox). Per Next 16 (docs/01-app/03-api-reference/
 * 03-file-conventions/loading.md) this file is a Server Component by
 * default — no `'use client'` needed.
 */

export default function AdminLoading() {
  return (
    <div className="pa-page" aria-busy="true" aria-live="polite">
      <div
        className="pa-skel-row"
        style={{ marginBottom: 16, justifyContent: "space-between" }}
      >
        <div className="pa-skel pa-skel-line" style={{ width: 200, height: 22 }} />
        <div className="pa-skel" style={{ width: 120, height: 32 }} />
      </div>
      <div
        className="pa-skel-grid"
        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="pa-card"
            style={{ padding: 14, display: "grid", gap: 10 }}
          >
            <div className="pa-skel pa-skel-line" style={{ width: "60%" }} />
            <div className="pa-skel" style={{ height: 30, width: "70%" }} />
            <div className="pa-skel pa-skel-line" style={{ width: "40%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
