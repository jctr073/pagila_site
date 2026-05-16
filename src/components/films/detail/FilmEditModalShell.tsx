"use client";

/**
 * FilmEditModalShell — client wrapper for the centered edit modal.
 *
 * Same Esc + scrim-click → router.back() pattern as <FilmDrawerShell>;
 * stronger blur on the scrim per design spec (rgba(40,28,16,.55), blur 3px).
 *
 * The Esc-handler intentionally skips dispatch when the user has an
 * input/textarea focused — the modal is a form and we don't want every
 * keystroke risking accidental dismissal.
 */

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type FilmEditModalShellProps = {
  children: ReactNode;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export default function FilmEditModalShell({
  children,
}: FilmEditModalShellProps) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (e.defaultPrevented) return;
      if (isEditableTarget(e.target)) return;
      router.back();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <>
      <div
        className="mdl-scrim"
        aria-hidden="true"
        onClick={() => router.back()}
      />
      {children}
    </>
  );
}
