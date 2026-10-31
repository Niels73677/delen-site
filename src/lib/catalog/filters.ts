import { z } from "zod";
import { commerce } from "@/config/brand";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
const SORT_VALUES = SORT_OPTIONS.map((o) => o.value) as [SortValue, ...SortValue[]];

export type CatalogFilters = {
  q: string | null;
  category: string | null;
  collection: string | null;
  sizes: string[];
  colors: string[];
  minPrice: number | null; // whole currency units
  maxPrice: number | null;
  inStock: boolean;
  sort: SortValue;
  page: number;
};

export const DEFAULT_FILTERS: CatalogFilters = {
  q: null,
  category: null,
  collection: null,
  sizes: [],
  colors: [],
  minPrice: null,
  maxPrice: null,
  inStock: false,
  sort: "featured",
  page: 1,
};

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function getAll(params: RawParams, key: string): string[] {
  if (params instanceof URLSearchParams) return params.getAll(key);
  const v = params[key];
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .max(80);
const money = z.coerce.number().int().min(0).max(100000);

/** Values may arrive repeated (?size=S&size=M) or comma-separated (?size=S,M). */
function list(params: RawParams, key: string, max = 20): string[] {
  const out = getAll(params, key)
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter((v) => v.length > 0 && v.length <= 40);
  return [...new Set(out)].slice(0, max);
}

/**
 * Parses untrusted URL search params into a normalized, validated filter
 * object. Invalid values are dropped rather than throwing, so a hand-edited
 * URL never breaks the page.
 */
export function parseFilters(params: RawParams): CatalogFilters {
  const first = (key: string) => getAll(params, key)[0];
  const parsedSlug = (key: string) => {
    const r = slug.safeParse(first(key));
    return r.success ? r.data : null;
  };
  const parsedMoney = (key: string) => {
    const raw = first(key);
    if (raw === undefined || raw === "") return null;
    const r = money.safeParse(raw);
    return r.success ? r.data : null;
  };
  const q = (first("q") ?? "").trim().slice(0, 80);
  const sortResult = z.enum(SORT_VALUES).safeParse(first("sort"));
  const pageResult = z.coerce.number().int().min(1).max(500).safeParse(first("page"));

  let minPrice = parsedMoney("min");
  let maxPrice = parsedMoney("max");
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return {
    q: q.length > 0 ? q : null,
    category: parsedSlug("category"),
    collection: parsedSlug("collection"),
    sizes: list(params, "size"),
    colors: list(params, "color").map((c) => c.toLowerCase()),
    minPrice,
    maxPrice,
    inStock: ["1", "true"].includes(first("inStock") ?? ""),
    sort: sortResult.success ? sortResult.data : "featured",
    page: pageResult.success ? pageResult.data : 1,
  };
}

/** Serializes filters back to a canonical query string (defaults omitted). */
export function filtersToSearchParams(filters: Partial<CatalogFilters>): URLSearchParams {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.category) sp.set("category", f.category);
  if (f.collection) sp.set("collection", f.collection);
  f.sizes.forEach((s) => sp.append("size", s));
  f.colors.forEach((c) => sp.append("color", c));
  if (f.minPrice !== null) sp.set("min", String(f.minPrice));
  if (f.maxPrice !== null) sp.set("max", String(f.maxPrice));
  if (f.inStock) sp.set("inStock", "1");
  if (f.sort !== "featured") sp.set("sort", f.sort);
  if (f.page > 1) sp.set("page", String(f.page));
  return sp;
}

/** Returns a new filter set with one change applied. Any change resets pagination. */
export function updateFilters(current: CatalogFilters, patch: Partial<CatalogFilters>): CatalogFilters {
  return { ...current, page: 1, ...patch };
}

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

export function countActiveFilters(f: CatalogFilters): number {
  return (
    (f.category ? 1 : 0) +
    f.sizes.length +
    f.colors.length +
    (f.minPrice !== null || f.maxPrice !== null ? 1 : 0) +
    (f.inStock ? 1 : 0)
  );
}

/** Maps filters to the `search_products` RPC arguments (prices in cents). */
export function toSearchArgs(f: CatalogFilters, perPage: number = commerce.productsPerPage) {
  return {
    p_query: f.q ?? undefined,
    p_category: f.category ?? undefined,
    p_collection: f.collection ?? undefined,
    p_sizes: f.sizes.length ? f.sizes : undefined,
    p_colors: f.colors.length ? f.colors : undefined,
    p_min_price: f.minPrice !== null ? f.minPrice * 100 : undefined,
    p_max_price: f.maxPrice !== null ? f.maxPrice * 100 : undefined,
    p_in_stock: f.inStock,
    p_sort: f.sort,
    p_limit: perPage,
    p_offset: (f.page - 1) * perPage,
  };
}
