/**
 * Rentals loading skeleton — toolbar + 8 row placeholders. Mirrors
 * src/app/(admin)/stores/loading.tsx so route transitions don't shift
 * the layout while data loads.
 */

export default function RentalsLoading() {
  return (
    <div className="pa-page" aria-busy="true" aria-live="polite">
      <div
        className="pa-skel-row"
        style={{ marginBottom: 14, justifyContent: "space-between" }}
      >
        <div className="pa-skel pa-skel-line" style={{ width: 200, height: 22 }} />
        <div className="pa-skel" style={{ width: 160, height: 32 }} />
      </div>
      <div className="pa-skel-row" style={{ marginBottom: 14, gap: 8 }}>
        <div className="pa-skel" style={{ width: 280, height: 28 }} />
        <div className="pa-skel" style={{ width: 220, height: 28 }} />
        <div style={{ flex: 1 }} />
        <div className="pa-skel" style={{ width: 90, height: 28 }} />
      </div>
      <div className="pa-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          className="pa-skel"
          style={{ height: 36, borderRadius: 0, opacity: 0.6 }}
        />
        {Array.from({ length: 8 }).map((_, i) => (
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
