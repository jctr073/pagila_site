"use client";

/**
 * StoreDrawerShell — client overlay around <StoreDrawer />: scrim,
 * Esc-to-close, and the slide-in animation (CSS keyframe on `.drw`).
 *
 * Functionally identical to FilmDrawerShell — kept as a sibling instead
 * of a shared primitive so each section can evolve its overlay behaviour
 * independently (e.g. nested intercepted /stores/[id]/edit later).
 */

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type StoreDrawerShellProps = {
  children: ReactNode;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export default function StoreDrawerShell({ children }: StoreDrawerShellProps) {
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
        className="drw-scrim"
        aria-hidden="true"
        onClick={() => router.back()}
      />
      {children}
    </>
  );
}
