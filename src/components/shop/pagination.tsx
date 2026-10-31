import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { filtersToSearchParams, type CatalogFilters } from "@/lib/catalog/filters";
import { cn } from "@/lib/utils";

export function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({
  filters,
  totalPages,
  basePath,
  omit = [],
}: {
  filters: CatalogFilters;
  totalPages: number;
  basePath: string;
  omit?: (keyof CatalogFilters)[];
}) {
  if (totalPages <= 1) return null;
  const href = (page: number) => {
    const sp = filtersToSearchParams({ ...filters, ...Object.fromEntries(omit.map((k) => [k, null])), page });
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const current = filters.page;
  const cell = "flex size-11 items-center justify-center text-sm transition-colors";
  return (
    <nav aria-label="Pagination" className="mt-16 flex items-center justify-center gap-1">
      {current > 1 ? (
        <Link href={href(current - 1)} className={cn(cell, "hover:bg-surface")} aria-label="Previous page" scroll>
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(cell, "opacity-30")} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}
      {pageWindow(current, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className={cn(cell, "text-muted-foreground")}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === current ? "page" : undefined}
            className={cn(cell, "tabular-nums", p === current ? "bg-foreground text-background" : "hover:bg-surface")}
          >
            {p}
          </Link>
        ),
      )}
      {current < totalPages ? (
        <Link href={href(current + 1)} className={cn(cell, "hover:bg-surface")} aria-label="Next page">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(cell, "opacity-30")} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
