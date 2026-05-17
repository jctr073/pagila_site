/**
 * StoresFooter — pagination + rows-per-page for the stores table.
 * Server-renderable. Uses the films footer's `fl-foot` class hooks so we
 * inherit the existing pagination styling.
 */

import Link from "next/link";

import { Btn, Icon } from "@/components/ui";

export type StoresFooterProps = {
  page: number;
  pageSize: number;
  total: number;
  /** Stringified query params excluding `page` / `pageSize`. */
  baseParams: string;
};

function buildHref(baseParams: string, page: number, pageSize: number): string {
  const sp = new URLSearchParams(baseParams);
  sp.set("page", String(page));
  if (pageSize !== 25) sp.set("pageSize", String(pageSize));
  else sp.delete("pageSize");
  const qs = sp.toString();
  return qs ? `/stores?${qs}` : "/stores";
}

function paginate(current: number, last: number): (number | "…")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  if (current > 3) out.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(last - 1, current + 1); p++) {
    out.push(p);
  }
  if (current < last - 2) out.push("…");
  out.push(last);
  return out;
}

export default function StoresFooter({
  page,
  pageSize,
  total,
  baseParams,
}: StoresFooterProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(total, safePage * pageSize);
  const pages = paginate(safePage, totalPages);

  return (
    <div className="fl-foot">
      <span>
        <b style={{ color: "var(--text)" }}>
          {from.toLocaleString()}–{to.toLocaleString()}
        </b>{" "}
        of <b style={{ color: "var(--text)" }}>{total.toLocaleString()}</b>{" "}
        stores
      </span>
      <div style={{ flex: 1 }} />
      <span style={{ color: "var(--text-soft)" }}>Rows per page:</span>
      <Btn size="sm" variant="ghost" rightIcon="chevDown" disabled>
        {pageSize}
      </Btn>

      <nav className="pager" aria-label="Pagination">
        <PagerLink
          href={buildHref(baseParams, Math.max(1, safePage - 1), pageSize)}
          disabled={safePage <= 1}
          ariaLabel="Previous page"
        >
          <Icon name="chevLeft" size={12} />
        </PagerLink>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e-${i}`} className="fl-pgbtn ellipsis" aria-hidden>
              …
            </span>
          ) : (
            <PagerLink
              key={p}
              href={buildHref(baseParams, p, pageSize)}
              active={p === safePage}
              ariaLabel={`Page ${p}`}
            >
              {p}
            </PagerLink>
          ),
        )}

        <PagerLink
          href={buildHref(baseParams, Math.min(totalPages, safePage + 1), pageSize)}
          disabled={safePage >= totalPages}
          ariaLabel="Next page"
        >
          <Icon name="chevRight" size={12} />
        </PagerLink>
      </nav>
    </div>
  );
}

function PagerLink({
  href,
  active,
  disabled,
  ariaLabel,
  children,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="fl-pgbtn" aria-disabled="true" aria-label={ariaLabel}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`fl-pgbtn${active ? " is-active" : ""}`}
      aria-current={active ? "page" : undefined}
      aria-label={ariaLabel}
      scroll={false}
    >
      {children}
    </Link>
  );
}
