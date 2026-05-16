"use client";

/**
 * Admin-section error boundary.
 *
 * Per node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/error.md (v16.2.0 changelog: "unstable_retry
 * prop added"), the preferred recovery prop is `unstable_retry`.
 * `reset` still exists for the rare case where you want to clear
 * error state without re-fetching, but for a "Try again" button the
 * docs recommend `unstable_retry`.
 *
 * Error boundaries MUST be Client Components.
 */

import { useEffect } from "react";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // In real life this would ship to Sentry/Datadog. For now console
    // is enough — `digest` is set in production builds and is the key
    // to look up the full stack on the server.
    console.error("[admin error]", error);
  }, [error]);

  return (
    <div className="pa-page">
      <div className="pa-card pa-error">
        <h2>Something went wrong.</h2>
        <p>{error.message || "An unexpected error occurred."}</p>
        <button
          type="button"
          className="pa-btn"
          data-variant="primary"
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
