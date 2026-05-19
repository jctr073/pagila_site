"use client";

/**
 * RentalDrawerShell — scrim + Esc-to-close for the intercepted rental
 * drawer. Mirrors StoreDrawerShell.
 */

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type RentalDrawerShellProps = {
  children: ReactNode;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export default function RentalDrawerShell({
  children,
}: RentalDrawerShellProps) {
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
