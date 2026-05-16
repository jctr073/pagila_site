/**
 * Films-list loading skeleton — toolbar shimmer + 10 row placeholders.
 *
 * The films-table layout is grid-driven (see .fl-table in
 * src/app/_films.css), so we don't try to mimic the column widths
 * exactly; a single full-width skeleton bar per row is sufficient to
 * convey "table is loading" without flicker when the real markup
 * streams in.
 */

export default function FilmsLoading() {
  return (
    <div className="pa-page" aria-busy="true" aria-live="polite">
      <div
        className="pa-skel-row"
        style={{ marginBottom: 14, justifyContent: "space-between" }}
      >
        <div className="pa-skel pa-skel-line" style={{ width: 220, height: 22 }} />
        <div className="pa-skel" style={{ width: 140, height: 32 }} />
      </div>
      <div
        className="pa-skel-row"
        style={{ marginBottom: 14, gap: 8 }}
        aria-hidden
      >
        <div className="pa-skel" style={{ width: 240, height: 32 }} />
        <div className="pa-skel" style={{ width: 90, height: 32 }} />
        <div className="pa-skel" style={{ width: 90, height: 32 }} />
        <div className="pa-skel" style={{ width: 90, height: 32 }} />
        <div style={{ flex: 1 }} />
        <div className="pa-skel" style={{ width: 100, height: 32 }} />
      </div>
      <div className="pa-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          className="pa-skel"
          style={{ height: 36, borderRadius: 0, opacity: 0.6 }}
        />
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: "10px 14px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div className="pa-skel pa-skel-line" style={{ width: "92%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
