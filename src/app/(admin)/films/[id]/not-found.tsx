/**
 * Custom 404 for /films/[id] — triggered when `getFilm(id)` returns
 * null (already handled in the page via `notFound()`). Rendered as a
 * small card inside the admin shell.
 */

import Link from "next/link";

export default function FilmNotFound() {
  return (
    <div className="pa-page">
      <div className="pa-card" style={{ maxWidth: 460, padding: 20 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>
          Film not found.
        </h2>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          We couldn’t find a film with that ID. It may have been archived
          or the link is broken.
        </p>
        <Link href="/films" className="pa-btn" data-variant="primary">
          Back to films
        </Link>
      </div>
    </div>
  );
}
