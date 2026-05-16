"use client";

/**
 * PageSizeSelect — tiny client island for the rows-per-page dropdown in
 * FilmsFooter. Owns just the <select onChange> handler so the parent
 * footer can stay server-renderable.
 */

import { useRouter } from "next/navigation";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export type PageSizeSelectProps = {
  pageSize: number;
  baseParams: string;
};

export default function PageSizeSelect({
  pageSize,
  baseParams,
}: PageSizeSelectProps) {
  const router = useRouter();
  return (
    <span className="pa-btn" data-size="sm" style={{ padding: "0 4px 0 9px" }}>
      <select
        aria-label="Rows per page"
        value={pageSize}
        onChange={(e) => {
          const ps = Number(e.currentTarget.value);
          const sp = new URLSearchParams(baseParams);
          sp.set("page", "1");
          if (ps !== 25) sp.set("pageSize", String(ps));
          else sp.delete("pageSize");
          const qs = sp.toString();
          router.push(qs ? `/films?${qs}` : "/films", { scroll: false });
        }}
        style={{
          background: "transparent",
          border: 0,
          outline: "none",
          font: "inherit",
          color: "inherit",
          cursor: "pointer",
          padding: 0,
        }}
      >
        {PAGE_SIZE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </span>
  );
}
