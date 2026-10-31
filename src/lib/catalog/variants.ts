import { compareSizes } from "./sizes";
import type { ProductImage, Variant } from "./types";

export const LOW_STOCK_THRESHOLD = 3;

export function colorsOf(variants: Variant[]) {
  const seen = new Map<string, { name: string; hex: string; inStock: boolean }>();
  for (const v of variants) {
    if (!v.isActive) continue;
    const entry = seen.get(v.colorName) ?? { name: v.colorName, hex: v.colorHex, inStock: false };
    entry.inStock ||= v.stock > 0;
    seen.set(v.colorName, entry);
  }
  return [...seen.values()];
}

/** Sizes offered for a colour, with their stock, in canonical order. */
export function sizesForColor(variants: Variant[], colorName: string) {
  return variants
    .filter((v) => v.isActive && v.colorName === colorName)
    .sort((a, b) => a.sizeSort - b.sizeSort || compareSizes(a.size, b.size))
    .map((v) => ({ size: v.size, variant: v, available: v.stock > 0 }));
}

export function findVariant(variants: Variant[], colorName: string | null, size: string | null) {
  if (!colorName || !size) return null;
  return variants.find((v) => v.isActive && v.colorName === colorName && v.size === size) ?? null;
}

/** First colour that has stock, falling back to the first colour. */
export function defaultColor(variants: Variant[]): string | null {
  const colors = colorsOf(variants);
  return (colors.find((c) => c.inStock) ?? colors[0])?.name ?? null;
}

/** With a single size (e.g. "One Size"), preselect it. */
export function defaultSize(variants: Variant[], colorName: string | null): string | null {
  if (!colorName) return null;
  const sizes = sizesForColor(variants, colorName);
  return sizes.length === 1 && sizes[0]!.available ? sizes[0]!.size : null;
}

/** How many more units of a variant can be added, given what is already in the bag. */
export function maxAddable(variant: Pick<Variant, "stock"> | null, inCart: number, perLineLimit = 10): number {
  if (!variant) return 0;
  return Math.max(0, Math.min(variant.stock, perLineLimit) - inCart);
}

export type StockStatus = { level: "out" | "low" | "in"; label: string };

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return { level: "out", label: "Sold out" };
  if (stock <= LOW_STOCK_THRESHOLD) return { level: "low", label: `Only ${stock} left` };
  return { level: "in", label: "In stock" };
}

/** Images for the selected colour first, then shared images; never empty if any exist. */
export function imagesForColor(images: ProductImage[], colorName: string | null): ProductImage[] {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  if (!colorName) return sorted;
  const forColor = sorted.filter((i) => i.colorName === colorName);
  const shared = sorted.filter((i) => i.colorName === null);
  const result = [...forColor, ...shared];
  return result.length > 0 ? result : sorted;
}
