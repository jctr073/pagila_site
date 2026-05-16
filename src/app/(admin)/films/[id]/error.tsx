"use client";

/**
 * Film detail error boundary — covers the standalone /films/[id] page.
 * The intercepted drawer variant (@drawer/(.)[id]) has its own
 * error.tsx so a drawer-time crash doesn't take out the films list
 * behind it.
 */

import { useEffect } from "react";

export default function FilmDetailError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[film detail error]", error);
  }, [error]);

  return (
    <div className="pa-page">
      <div className="pa-card pa-error" style={{ maxWidth: 460 }}>
        <h2>Couldn’t load this film.</h2>
        <p>{error.message || "The film detail failed to render."}</p>
        <button
          type="button"
          className="pa-btn"
          onClick={() => unstable_retry()}
        >
          Try again
        </button>
        {error.digest && (
          <div className="pa-error-code">digest: {error.digest}</div>
        )}
      </div>
    </div>
  );
}
