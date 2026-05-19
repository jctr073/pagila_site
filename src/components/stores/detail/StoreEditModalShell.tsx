"use client";

/**
 * StoreEditModalShell — client wrapper for the centered edit modal.
 *
 * Same scrim + Esc-to-close pattern as FilmEditModalShell. The Esc handler
 * skips dispatch when the user is focused inside an editable element so
 * routine keystrokes don't accidentally dismiss the modal.
 */

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type StoreEditModalShellProps = {
  children: ReactNode;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export default function StoreEditModalShell({
  children,
}: StoreEditModalShellProps) {
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
