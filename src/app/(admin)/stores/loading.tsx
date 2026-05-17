/**
 * Stores loading skeleton — mirrors the films table shape (toolbar row
 * + 8 row placeholders inside a card) so the layout doesn't jump when
 * the data lands.
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
      <div className="pa-skel-row" style={{ marginBottom: 14, gap: 8 }}>
        <div className="pa-skel" style={{ width: 260, height: 28 }} />
        <div className="pa-skel" style={{ width: 92, height: 28 }} />
        <div className="pa-skel" style={{ width: 92, height: 28 }} />
        <div style={{ flex: 1 }} />
        <div className="pa-skel" style={{ width: 110, height: 28 }} />
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
