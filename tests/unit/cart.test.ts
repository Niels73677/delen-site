import { describe, expect, it } from "vitest";
import { computeTotals, discountAmount, shippingFor } from "@/lib/cart/calc";
import { addLine, mergeLines, reconcileLines, setLineQuantity, type CartLine } from "@/lib/cart/lines";
import { commerce } from "@/config/brand";

const item = (over: Partial<CartLine> = {}): Omit<CartLine, "quantity"> => ({
  variantId: "v1",
  productId: "p1",
  slug: "tee",
  name: "Tee",
  colorName: "Black",
  size: "M",
  imageUrl: null,
  unitPriceCents: 4500,
  maxQuantity: 5,
  ...over,
});

describe("cart calculations", () => {
  it("sums line totals", () => {
    const t = computeTotals([
      { unitPriceCents: 4500, quantity: 2 },
      { unitPriceCents: 12000, quantity: 1 },
    ]);
    expect(t.subtotalCents).toBe(21000);
    expect(t.itemCount).toBe(3);
  });

  it("charges flat shipping below the free threshold and none above it", () => {
    expect(shippingFor(commerce.freeShippingThresholdCents - 1, 1)).toBe(commerce.standardShippingCents);
    expect(shippingFor(commerce.freeShippingThresholdCents, 1)).toBe(0);
    expect(shippingFor(0, 0)).toBe(0);
  });

  it("applies percentage and fixed discounts, never below zero", () => {
    expect(discountAmount({ code: "P10", kind: "percentage", value: 10, minSubtotalCents: 0 }, 9999)).toBe(1000);
    expect(discountAmount({ code: "F25", kind: "fixed", value: 2500, minSubtotalCents: 0 }, 1000)).toBe(1000);
    expect(discountAmount({ code: "MIN", kind: "fixed", value: 2500, minSubtotalCents: 20000 }, 19999)).toBe(0);
  });

  it("evaluates free shipping on the discounted subtotal", () => {
    // €160 - 10% = €144 → below €150 threshold → shipping charged
    const t = computeTotals([{ unitPriceCents: 16000, quantity: 1 }], { code: "P10", kind: "percentage", value: 10, minSubtotalCents: 0 });
    expect(t.discountCents).toBe(1600);
    expect(t.shippingCents).toBe(commerce.standardShippingCents);
    expect(t.totalCents).toBe(16000 - 1600 + commerce.standardShippingCents);
  });

  it("reports how far the bag is from free shipping", () => {
    const t = computeTotals([{ unitPriceCents: 10000, quantity: 1 }]);
    expect(t.freeShippingRemainingCents).toBe(commerce.freeShippingThresholdCents - 10000);
  });
});

describe("cart lines", () => {
  it("adds a new line", () => {
    const { lines, added } = addLine([], item(), 2);
    expect(added).toBe(2);
    expect(lines).toHaveLength(1);
    expect(lines[0]!.quantity).toBe(2);
  });

  it("merges quantities for the same variant and clamps to stock", () => {
    const first = addLine([], item(), 3).lines;
    const { lines, added } = addLine(first, item(), 4);
    expect(added).toBe(2);
    expect(lines[0]!.quantity).toBe(5);
  });

  it("adds nothing when the variant is out of stock", () => {
    expect(addLine([], item({ maxQuantity: 0 }), 1).added).toBe(0);
  });

  it("enforces the per-line limit even with large stock", () => {
    expect(addLine([], item({ maxQuantity: 500 }), 50).added).toBe(commerce.maxQuantityPerLine);
  });

  it("sets quantity within stock and removes at zero", () => {
    const lines = addLine([], item(), 1).lines;
    expect(setLineQuantity(lines, "v1", 99)[0]!.quantity).toBe(5);
    expect(setLineQuantity(lines, "v1", 0)).toHaveLength(0);
  });

  it("merges a guest bag with an account bag using the larger quantity", () => {
    const a = addLine([], item(), 1).lines;
    const b = addLine(addLine([], item(), 3).lines, item({ variantId: "v2" }), 1).lines;
    const merged = mergeLines(a, b);
    expect(merged.find((l) => l.variantId === "v1")!.quantity).toBe(3);
    expect(merged).toHaveLength(2);
  });

  it("reconciles with fresh server data", () => {
    let lines = addLine([], item(), 4).lines;
    lines = addLine(lines, item({ variantId: "v2", name: "Coat" }), 1).lines;
    const { lines: next, notes } = reconcileLines(lines, [
      { variantId: "v1", unitPriceCents: 5000, stock: 2, available: true },
      { variantId: "v2", unitPriceCents: 1, stock: 0, available: true },
    ]);
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ quantity: 2, unitPriceCents: 5000, maxQuantity: 2 });
    expect(notes).toHaveLength(3);
  });
});
