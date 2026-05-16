"use client";

/**
 * Film-edit modal error boundary. Renders inside the modal route so
 * a crash in the edit form doesn't tear down the underlying films
 * list or detail page.
 */

import { useEffect } from "react";

export default function FilmEditError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[film edit error]", error);
  }, [error]);

  return (
    <div className="pa-page">
      <div className="pa-card pa-error" style={{ maxWidth: 520 }}>
        <h2>Edit form failed to load.</h2>
        <p>{error.message || "We couldn’t render the editor."}</p>
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
