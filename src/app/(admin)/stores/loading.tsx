/**
 * Stores loading skeleton — 2 store-card placeholders + a staff table
 * shimmer. The real /stores page renders a 2-column store-card grid
 * with a staff table below; this mirrors that shape.
 */

export default function StoresLoading() {
  return (
    <div className="pa-page" aria-busy="true" aria-live="polite">
      <div
        className="pa-skel-row"
        style={{ marginBottom: 14, justifyContent: "space-between" }}
      >
        <div className="pa-skel pa-skel-line" style={{ width: 220, height: 22 }} />
        <div className="pa-skel" style={{ width: 160, height: 32 }} />
      </div>
      <div
        className="pa-skel-grid"
        style={{
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          marginBottom: 14,
        }}
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="pa-card"
            style={{ padding: 16, display: "grid", gap: 12 }}
          >
            <div className="pa-skel-row" style={{ gap: 12 }}>
              <div
                className="pa-skel"
                style={{ width: 48, height: 48, borderRadius: 12 }}
              />
              <div style={{ flex: 1, display: "grid", gap: 6 }}>
                <div className="pa-skel pa-skel-line" style={{ width: "60%" }} />
                <div className="pa-skel pa-skel-line" style={{ width: "40%" }} />
              </div>
            </div>
            <div className="pa-skel" style={{ height: 60 }} />
            <div className="pa-skel pa-skel-line" style={{ width: "80%" }} />
            <div className="pa-skel pa-skel-line" style={{ width: "70%" }} />
          </div>
        ))}
      </div>
      <div className="pa-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          className="pa-skel"
          style={{ height: 36, borderRadius: 0, opacity: 0.6 }}
        />
        {Array.from({ length: 6 }).map((_, i) => (
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
