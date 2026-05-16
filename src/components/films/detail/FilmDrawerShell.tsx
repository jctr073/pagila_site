"use client";

/**
 * FilmDrawerShell — client wrapper that gives the drawer its overlay
 * behavior: scrim, Esc-to-close, slide-in animation.
 *
 * The actual drawer body (<FilmDrawer />) is passed in as `children`
 * from the route page so its content can stay server-rendered.
 *
 * Behavior:
 *   - Scrim click → router.back()
 *   - Escape key  → router.back() (but only when the event isn't already
 *                   targeted at an editable form element, so typing in a
 *                   nested input/textarea doesn't dismiss the drawer)
 *   - Slide-in    → handled via CSS keyframe (`drw-in`) on .drw
 *
 * For the standalone fallback (cold-load of /films/[id]) the page does
 * NOT use this shell; see StandaloneDrawerPage instead.
 */

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type FilmDrawerShellProps = {
  children: ReactNode;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export default function FilmDrawerShell({ children }: FilmDrawerShellProps) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      // Don't close while the user is editing a form field inside the
      // drawer (e.g. an inline-edit input) — the field's own onKeyDown
      // gets first dibs and may cancel the edit. We treat defaultPrevented
      // as "someone else handled it" too.
      if (e.defaultPrevented) return;
      if (isEditableTarget(e.target)) return;
      router.back();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <>
      {/*
       * The scrim sits below the drawer (z-index 60 vs 61 in CSS) so a
       * scrim click reaches this onClick even though the drawer is above
       * it visually.
       */}
      <div
        className="drw-scrim"
        aria-hidden="true"
        onClick={() => router.back()}
      />
      {children}
    </>
  );
}
