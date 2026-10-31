"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  SORT_OPTIONS,
  countActiveFilters,
  filtersToSearchParams,
  toggleValue,
  updateFilters,
  type CatalogFilters,
  type SortValue,
} from "@/lib/catalog/filters";
import type { Category, Facets } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import { useCatalogTransition } from "./catalog-transition";

type Props = {
  filters: CatalogFilters;
  facets: Facets;
  categories: Category[];
  total: number;
  basePath: string;
  /** Filters fixed by the page (e.g. the collection) and not shown in the URL. */
  fixed?: Partial<CatalogFilters>;
};

export function FilterBar({ filters, facets, categories, total, basePath, fixed = {} }: Props) {
  const { navigate, pending } = useCatalogTransition();
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(filters);

  const apply = (patch: Partial<CatalogFilters>) => {
    const next = updateFilters(filters, patch);
    const params = filtersToSearchParams({ ...next, ...Object.fromEntries(Object.keys(fixed).map((k) => [k, null])) });
    const qs = params.toString();
    navigate(qs ? `${basePath}?${qs}` : basePath);
  };

  const clearAll = () =>
    apply({ category: null, sizes: [], colors: [], minPrice: null, maxPrice: null, inStock: false });

  const chips: { label: string; onRemove: () => void }[] = [
    ...(filters.category
      ? [{ label: categories.find((c) => c.slug === filters.category)?.name ?? filters.category, onRemove: () => apply({ category: null }) }]
      : []),
    ...filters.sizes.map((s) => ({ label: `Size ${s}`, onRemove: () => apply({ sizes: filters.sizes.filter((x) => x !== s) }) })),
    ...filters.colors.map((c) => ({
      label: facets.colors.find((f) => f.name.toLowerCase() === c)?.name ?? c,
      onRemove: () => apply({ colors: filters.colors.filter((x) => x !== c) }),
    })),
    ...(filters.minPrice !== null || filters.maxPrice !== null
      ? [{ label: `€${filters.minPrice ?? 0} – €${filters.maxPrice ?? "∞"}`, onRemove: () => apply({ minPrice: null, maxPrice: null }) }]
      : []),
    ...(filters.inStock ? [{ label: "In stock", onRemove: () => apply({ inStock: false }) }] : []),
  ];

  return (
    <div className="mb-8 lg:mb-10">
      {!fixed.category && (
        <nav aria-label="Categories" className="scrollbar-none -mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-2">
            <li>
              <button
                type="button"
                onClick={() => apply({ category: null })}
                className={cn(
                  "h-9 whitespace-nowrap border px-4 text-[13px] transition-colors",
                  !filters.category ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
                )}
                aria-pressed={!filters.category}
              >
                All
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => apply({ category: filters.category === c.slug ? null : c.slug })}
                  className={cn(
                    "h-9 whitespace-nowrap border px-4 text-[13px] transition-colors",
                    filters.category === c.slug ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
                  )}
                  aria-pressed={filters.category === c.slug}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="flex items-center justify-between gap-4 border-y border-border py-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="eyebrow flex h-10 items-center gap-2 transition-opacity hover:opacity-60"
          data-testid="open-filters"
        >
          <SlidersHorizontal className="size-4" strokeWidth={1.5} />
          Filter{active > 0 && <span className="tabular-nums">({active})</span>}
        </button>
        <p className="hidden text-[13px] text-muted-foreground sm:block" aria-live="polite">
          {pending ? "Updating…" : `${total} ${total === 1 ? "product" : "products"}`}
        </p>
        <label className="flex items-center gap-2">
          <span className="eyebrow hidden text-muted-foreground sm:inline">Sort</span>
          <select
            value={filters.sort}
            onChange={(e) => apply({ sort: e.target.value as SortValue })}
            className="h-10 cursor-pointer bg-transparent pr-1 text-[13px] focus:outline-none"
            aria-label="Sort products"
            data-testid="sort-select"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {chips.length > 0 && (
        <ul className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <li key={chip.label}>
              <button
                type="button"
                onClick={chip.onRemove}
                className="flex h-8 items-center gap-1.5 bg-surface px-3 text-[12px] transition-colors hover:bg-border"
                aria-label={`Remove filter ${chip.label}`}
              >
                {chip.label} <X className="size-3" />
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={clearAll} className="h-8 px-2 text-[12px] underline underline-offset-4">
              Clear all
            </button>
          </li>
        </ul>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>Filter</SheetTitle>
            <SheetDescription className="sr-only">Refine the products shown</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6">
            <Accordion type="multiple" defaultValue={["size", "color", "price", "availability"]}>
              {!fixed.category && (
                <AccordionItem value="category">
                  <AccordionTrigger>Category</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3">
                      {categories.map((c) => (
                        <li key={c.id}>
                          <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                            <Checkbox
                              checked={filters.category === c.slug}
                              onCheckedChange={(v) => apply({ category: v ? c.slug : null })}
                            />
                            {c.name}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="size">
                <AccordionTrigger>Size</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-4 gap-2">
                    {facets.sizes.map((s) => {
                      const on = filters.sizes.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => apply({ sizes: toggleValue(filters.sizes, s) })}
                          aria-pressed={on}
                          className={cn(
                            "h-11 border px-1 text-[13px] text-foreground transition-colors",
                            s.length > 4 && "col-span-2",
                            on ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
                          )}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="color">
                <AccordionTrigger>Colour</AccordionTrigger>
                <AccordionContent>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {facets.colors.map((c) => {
                      const key = c.name.toLowerCase();
                      const on = filters.colors.includes(key);
                      return (
                        <li key={c.name}>
                          <button
                            type="button"
                            onClick={() => apply({ colors: toggleValue(filters.colors, key) })}
                            aria-pressed={on}
                            className="flex w-full items-center gap-3 text-left text-sm text-foreground"
                          >
                            <span
                              className={cn(
                                "size-5 shrink-0 rounded-full border border-foreground/15 ring-offset-2 ring-offset-background",
                                on && "ring-1 ring-foreground",
                              )}
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className={cn(on && "font-medium")}>{c.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="price">
                <AccordionTrigger>Price</AccordionTrigger>
                <AccordionContent>
                  <PriceFilter
                    key={`${filters.minPrice}-${filters.maxPrice}`}
                    min={filters.minPrice}
                    max={filters.maxPrice}
                    bounds={{ min: Math.floor(facets.price.min / 100), max: Math.ceil(facets.price.max / 100) }}
                    onApply={(minPrice, maxPrice) => apply({ minPrice, maxPrice })}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="availability">
                <AccordionTrigger>Availability</AccordionTrigger>
                <AccordionContent>
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                    <Checkbox checked={filters.inStock} onCheckedChange={(v) => apply({ inStock: v === true })} />
                    In stock only
                  </label>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-border p-4">
            <Button variant="outline" onClick={clearAll} disabled={active === 0}>
              Clear
            </Button>
            <Button onClick={() => setOpen(false)} data-testid="show-results">
              {pending ? "Updating…" : `Show ${total}`}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PriceFilter({
  min,
  max,
  bounds,
  onApply,
}: {
  min: number | null;
  max: number | null;
  bounds: { min: number; max: number };
  onApply: (min: number | null, max: number | null) => void;
}) {
  const [lo, setLo] = useState(min?.toString() ?? "");
  const [hi, setHi] = useState(max?.toString() ?? "");
  const parse = (v: string) => (v.trim() === "" ? null : Math.max(0, Math.floor(Number(v))));
  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(parse(lo), parse(hi));
      }}
    >
      <label className="flex-1 text-xs text-muted-foreground">
        Min (€)
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={lo}
          onChange={(e) => setLo(e.target.value)}
          placeholder={String(bounds.min)}
          className="mt-1 h-11 w-full border border-border bg-card px-3 text-sm text-foreground focus:border-foreground focus:outline-none"
        />
      </label>
      <label className="flex-1 text-xs text-muted-foreground">
        Max (€)
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={hi}
          onChange={(e) => setHi(e.target.value)}
          placeholder={String(bounds.max)}
          className="mt-1 h-11 w-full border border-border bg-card px-3 text-sm text-foreground focus:border-foreground focus:outline-none"
        />
      </label>
      <Button type="submit" variant="outline" size="sm" className="h-11">
        Apply
      </Button>
    </form>
  );
}
