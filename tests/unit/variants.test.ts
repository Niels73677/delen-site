import { describe, expect, it } from "vitest";
import {
  colorsOf,
  defaultColor,
  defaultSize,
  findVariant,
  imagesForColor,
  maxAddable,
  sizesForColor,
  stockStatus,
} from "@/lib/catalog/variants";
import { compareSizes, sortSizes } from "@/lib/catalog/sizes";
import type { ProductImage, Variant } from "@/lib/catalog/types";

const v = (colorName: string, size: string, stock: number, sizeSort = 0, isActive = true): Variant => ({
  id: `${colorName}-${size}`,
  sku: `SKU-${colorName}-${size}`,
  colorName,
  colorHex: "#000000",
  size,
  sizeSort,
  priceCents: 4500,
  stock,
  isActive,
});

const variants = [
  v("White", "S", 0, 1),
  v("White", "M", 0, 2),
  v("Black", "L", 3, 3),
  v("Black", "S", 10, 1),
  v("Black", "M", 0, 2),
  v("Sky", "M", 5, 2, false),
];

describe("variant selection", () => {
  it("lists active colours with availability", () => {
    expect(colorsOf(variants)).toEqual([
      { name: "White", hex: "#000000", inStock: false },
      { name: "Black", hex: "#000000", inStock: true },
    ]);
  });

  it("defaults to the first colour with stock", () => {
    expect(defaultColor(variants)).toBe("Black");
    expect(defaultColor(variants.filter((x) => x.colorName === "White"))).toBe("White");
  });

  it("orders sizes and flags unavailable ones", () => {
    const sizes = sizesForColor(variants, "Black");
    expect(sizes.map((s) => s.size)).toEqual(["S", "M", "L"]);
    expect(sizes.map((s) => s.available)).toEqual([true, false, true]);
  });

  it("ignores inactive variants", () => {
    expect(sizesForColor(variants, "Sky")).toHaveLength(0);
    expect(findVariant(variants, "Sky", "M")).toBeNull();
  });

  it("finds the exact variant", () => {
    expect(findVariant(variants, "Black", "L")?.stock).toBe(3);
    expect(findVariant(variants, "Black", null)).toBeNull();
  });

  it("preselects a single in-stock size", () => {
    expect(defaultSize([v("Tan", "One Size", 2)], "Tan")).toBe("One Size");
    expect(defaultSize([v("Tan", "One Size", 0)], "Tan")).toBeNull();
    expect(defaultSize(variants, "Black")).toBeNull();
  });

  it("caps addable quantity by stock, bag contents and per-line limit", () => {
    expect(maxAddable({ stock: 3 }, 1, 10)).toBe(2);
    expect(maxAddable({ stock: 3 }, 3, 10)).toBe(0);
    expect(maxAddable({ stock: 50 }, 0, 10)).toBe(10);
    expect(maxAddable(null, 0)).toBe(0);
  });

  it("describes stock levels", () => {
    expect(stockStatus(0).level).toBe("out");
    expect(stockStatus(2)).toEqual({ level: "low", label: "Only 2 left" });
    expect(stockStatus(20).level).toBe("in");
  });

  it("shows colour-specific images first, then shared ones", () => {
    const img = (id: string, colorName: string | null, sortOrder: number): ProductImage => ({ id, url: id, alt: "", colorName, sortOrder });
    const images = [img("shared", null, 3), img("black-2", "Black", 2), img("white", "White", 0), img("black-1", "Black", 1)];
    expect(imagesForColor(images, "Black").map((i) => i.id)).toEqual(["black-1", "black-2", "shared"]);
    expect(imagesForColor(images, "Green").map((i) => i.id)).toEqual(["shared"]);
  });
});

describe("size ordering", () => {
  it("sorts letter, numeric and other sizes canonically", () => {
    expect(sortSizes(["XL", "32", "S", "One Size", "28", "M", "XS"])).toEqual(["XS", "S", "M", "XL", "28", "32", "One Size"]);
    expect(compareSizes("L", "M")).toBeGreaterThan(0);
  });
});
