import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  filtersToSearchParams,
  parseFilters,
  toSearchArgs,
  toggleValue,
  updateFilters,
} from "@/lib/catalog/filters";

describe("parseFilters", () => {
  it("returns defaults for empty params", () => {
    expect(parseFilters({})).toEqual(DEFAULT_FILTERS);
  });

  it("parses every supported filter", () => {
    const f = parseFilters({
      q: "  wool coat ",
      category: "Outerwear",
      collection: "new-arrivals",
      size: ["S", "M"],
      color: "Black,Camel",
      min: "50",
      max: "300",
      inStock: "1",
      sort: "price-desc",
      page: "3",
    });
    expect(f).toEqual({
      q: "wool coat",
      category: "outerwear",
      collection: "new-arrivals",
      sizes: ["S", "M"],
      colors: ["black", "camel"],
      minPrice: 50,
      maxPrice: 300,
      inStock: true,
      sort: "price-desc",
      page: 3,
    });
  });

  it("drops invalid values instead of throwing", () => {
    const f = parseFilters({
      category: "../../etc",
      sort: "drop table",
      page: "-4",
      min: "abc",
      max: "999999999",
      inStock: "maybe",
    });
    expect(f.category).toBeNull();
    expect(f.sort).toBe("featured");
    expect(f.page).toBe(1);
    expect(f.minPrice).toBeNull();
    expect(f.maxPrice).toBeNull();
    expect(f.inStock).toBe(false);
  });

  it("swaps an inverted price range", () => {
    const f = parseFilters({ min: "200", max: "50" });
    expect([f.minPrice, f.maxPrice]).toEqual([50, 200]);
  });

  it("deduplicates and caps list values", () => {
    const sizes = Array.from({ length: 40 }, (_, i) => `S${i}`);
    expect(parseFilters({ size: ["M", "M", "L"] }).sizes).toEqual(["M", "L"]);
    expect(parseFilters({ size: sizes }).sizes).toHaveLength(20);
  });

  it("accepts URLSearchParams", () => {
    const f = parseFilters(new URLSearchParams("size=S&size=XL&sort=newest"));
    expect(f.sizes).toEqual(["S", "XL"]);
    expect(f.sort).toBe("newest");
  });
});

describe("filtersToSearchParams", () => {
  it("omits defaults", () => {
    expect(filtersToSearchParams(DEFAULT_FILTERS).toString()).toBe("");
  });

  it("round-trips through parseFilters", () => {
    const original = parseFilters({
      q: "tee",
      category: "tees",
      size: ["S", "M"],
      color: ["black"],
      min: "10",
      max: "90",
      inStock: "1",
      sort: "popular",
      page: "2",
    });
    const again = parseFilters(filtersToSearchParams(original));
    expect(again).toEqual(original);
  });
});

describe("filter helpers", () => {
  it("resets pagination whenever a filter changes", () => {
    const f = { ...DEFAULT_FILTERS, page: 4 };
    expect(updateFilters(f, { sizes: ["M"] }).page).toBe(1);
  });

  it("toggles values", () => {
    expect(toggleValue(["S"], "M")).toEqual(["S", "M"]);
    expect(toggleValue(["S", "M"], "S")).toEqual(["M"]);
  });

  it("counts active filters (sort and query excluded)", () => {
    const f = parseFilters({ q: "x", category: "tees", size: ["S", "M"], min: "10", inStock: "1", sort: "newest" });
    expect(countActiveFilters(f)).toBe(5);
  });

  it("maps to RPC arguments with prices in cents and offset pagination", () => {
    const args = toSearchArgs(parseFilters({ min: "50", max: "120", page: "3", size: "M" }), 12);
    expect(args.p_min_price).toBe(5000);
    expect(args.p_max_price).toBe(12000);
    expect(args.p_offset).toBe(24);
    expect(args.p_limit).toBe(12);
    expect(args.p_sizes).toEqual(["M"]);
    expect(args.p_colors).toBeUndefined();
  });
});
