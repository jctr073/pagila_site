"use client";

/**
 * DrawerCloseButton — tiny client island so the drawer's X / "Close"
 * buttons can call `router.back()`. Keeps <FilmDrawer> server-renderable.
 *
 * Used for both the overlay (intercepted) and standalone routes:
 *   - Overlay: router.back() pops the intercepting route and the films
 *     list stays mounted underneath.
 *   - Standalone: router.back() falls through to whatever route the user
 *     came from (usually /films). If there's no history (cold reload of
 *     /films/1), the caller passes `fallbackHref="/films"` so we
 *     `router.push` to the list instead.
 */

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import Btn, { type BtnProps } from "@/components/ui/Btn";

export type DrawerCloseButtonProps = {
  fallbackHref?: string;
  children?: ReactNode;
  variant?: BtnProps["variant"];
  size?: BtnProps["size"];
  iconOnly?: boolean;
  leftIcon?: BtnProps["leftIcon"];
  "aria-label"?: string;
};

export default function DrawerCloseButton({
  fallbackHref,
  children,
  variant = "ghost",
  size = "sm",
  iconOnly,
  leftIcon,
  "aria-label": ariaLabel,
}: DrawerCloseButtonProps) {
  const router = useRouter();

  function onClick() {
    // `history.length > 1` is the heuristic we use to distinguish
    // "came from another page" vs. "cold-loaded this URL directly".
    // The latter case can't pop back so we navigate to the fallback.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (fallbackHref) {
      router.push(fallbackHref);
    } else {
      router.back();
    }
  }

  return (
    <Btn
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      leftIcon={leftIcon}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </Btn>
  );
}
