/**
 * FilmsFooter — pagination + rows-per-page.
 *
 * Server-renderable. Produces `<Link>` buttons that preserve all other
 * query params (sort/dir/q/category/...) and update only `page` /
 * `pageSize`.
 *
 * Ported from designs/films-list.jsx#FilmsListScreen footer block.
 *
 * The rows-per-page dropdown is a native <select> wrapped to look like
 * the design's Btn; using a real form-control keeps the page server-
 * renderable (no client island needed just for a dropdown).
 */

import Link from "next/link";

import Icon from "@/components/ui/Icon";
import PageSizeSelect from "./PageSizeSelect";

export type FilmsFooterProps = {
  page: number;
  pageSize: number;
  total: number;
  /** Serialized leading query string (everything except `page`/`pageSize`). */
  baseParams: string;
};

function buildHref(baseParams: string, page: number, pageSize: number) {
  const sp = new URLSearchParams(baseParams);
  sp.set("page", String(page));
  if (pageSize !== 25) sp.set("pageSize", String(pageSize));
  else sp.delete("pageSize");
  const qs = sp.toString();
  return qs ? `/films?${qs}` : "/films";
}

/** Return the visible page list with `…` ellipsis markers. */
function paginate(current: number, last: number): (number | "…")[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  const out: (number | "…")[] = [1];
  if (current > 3) out.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(last - 1, current + 1); p++) {
    out.push(p);
  }
  if (current < last - 2) out.push("…");
  out.push(last);
  return out;
}

export default function FilmsFooter({
  page,
  pageSize,
  total,
  baseParams,
}: FilmsFooterProps) {
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
        films
      </span>
      <div style={{ flex: 1 }} />
      <span style={{ color: "var(--text-soft)" }}>Rows per page:</span>
      <PageSizeSelect pageSize={pageSize} baseParams={baseParams} />

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
      <span
        className="fl-pgbtn"
        aria-disabled="true"
        aria-label={ariaLabel}
      >
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
