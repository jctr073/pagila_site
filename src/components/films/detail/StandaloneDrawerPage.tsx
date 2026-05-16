/**
 * StandaloneDrawerPage — page-shaped wrapper for the drawer/modal when
 * accessed directly (cold-loaded) rather than as an overlay on /films.
 *
 * On direct visit there's no underlying list to overlay, so we render the
 * drawer body as a centered card inside the admin shell content area.
 * Same component (<FilmDrawer />) is reused — only the outer chrome
 * changes (no scrim, no slide-in animation, no fixed positioning).
 *
 * Server-renderable.
 */

import type { ReactNode } from "react";

import Btn from "@/components/ui/Btn";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

export type StandaloneDrawerPageProps = {
  /** Crumb / heading text — e.g. the film title. */
  title?: string;
  children: ReactNode;
};

export default function StandaloneDrawerPage({
  title,
  children,
}: StandaloneDrawerPageProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="pa-page-h">
        <div className="ttl">
          <h1>{title ?? "Film detail"}</h1>
          <p>
            Direct link · this page would normally appear as an overlay on the
            films list.
          </p>
        </div>
        <div className="actions">
          <Link href="/films">
            <Btn size="sm" variant="ghost" leftIcon="chevLeft">
              Back to films
            </Btn>
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingBottom: 24,
        }}
      >
        {children}
      </div>

      {/* Silence the unused-Icon import in case the consumer page doesn't
          embed any icons (keeps the bundle deterministic). */}
      <span style={{ display: "none" }} aria-hidden>
        <Icon name="x" size={10} />
      </span>
    </div>
  );
}
