/**
 * Standalone film-detail loading skeleton. Shows a drawer-shaped
 * placeholder while getFilm + adjunct queries resolve. The intercepted
 * drawer route at @drawer/(.)[id] gets its own loading.tsx so the
 * overlay version shimmers in-place.
 */

export default function FilmDetailLoading() {
  return (
    <div className="pa-page" aria-busy="true" aria-live="polite">
      <div
        className="pa-card"
        style={{ maxWidth: 460, padding: 16, display: "grid", gap: 14 }}
      >
        <div className="pa-skel-row" style={{ justifyContent: "space-between" }}>
          <div className="pa-skel pa-skel-line" style={{ width: 80 }} />
          <div className="pa-skel" style={{ width: 80, height: 22 }} />
        </div>
        <div className="pa-skel-row" style={{ alignItems: "flex-start" }}>
          <div className="pa-skel" style={{ width: 88, height: 120 }} />
          <div style={{ flex: 1, display: "grid", gap: 8 }}>
            <div className="pa-skel pa-skel-line" style={{ width: "80%", height: 18 }} />
            <div className="pa-skel pa-skel-line" style={{ width: "60%" }} />
            <div className="pa-skel pa-skel-line" style={{ width: "70%" }} />
          </div>
        </div>
        <div className="pa-skel" style={{ height: 64 }} />
        <div className="pa-skel-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pa-skel pa-skel-line" />
          ))}
        </div>
        <div className="pa-skel" style={{ height: 48 }} />
      </div>
    </div>
  );
}
