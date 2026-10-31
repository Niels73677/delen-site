import { computeTotals, type DiscountRule, type Totals } from "@/lib/cart/calc";

/** Variant data as read from the database at checkout time. */
export type CheckoutVariant = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productStatus: string;
  isActive: boolean;
  colorName: string;
  size: string;
  unitPriceCents: number;
  stock: number;
  imageUrl: string | null;
};

export type DiscountRow = {
  id: string;
  code: string;
  kind: "percentage" | "fixed";
  value: number;
  minSubtotalCents: number;
  maxRedemptions: number | null;
  redemptionCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

export type QuoteLine = CheckoutVariant & { quantity: number; lineTotalCents: number };

export type QuoteIssue = {
  variantId: string;
  code: "NOT_FOUND" | "UNAVAILABLE" | "OUT_OF_STOCK" | "INSUFFICIENT_STOCK";
  available: number;
  message: string;
};

export type Quote =
  | { ok: true; lines: QuoteLine[]; totals: Totals; discount: DiscountRow | null; discountError: string | null }
  | { ok: false; issues: QuoteIssue[] };

export function validateDiscount(
  row: DiscountRow | null,
  subtotalCents: number,
  now: Date = new Date(),
): { ok: true; rule: DiscountRule } | { ok: false; reason: string } {
  if (!row || !row.isActive) return { ok: false, reason: "This discount code is not valid." };
  if (row.startsAt && new Date(row.startsAt) > now) return { ok: false, reason: "This discount code is not active yet." };
  if (row.endsAt && new Date(row.endsAt) <= now) return { ok: false, reason: "This discount code has expired." };
  if (row.maxRedemptions !== null && row.redemptionCount >= row.maxRedemptions) {
    return { ok: false, reason: "This discount code has reached its usage limit." };
  }
  if (subtotalCents < row.minSubtotalCents) {
    return {
      ok: false,
      reason: `This code requires a minimum order of €${(row.minSubtotalCents / 100).toFixed(0)}.`,
    };
  }
  return {
    ok: true,
    rule: { code: row.code, kind: row.kind, value: row.value, minSubtotalCents: row.minSubtotalCents },
  };
}

/**
 * Builds an authoritative order quote from database prices and stock.
 * Client-supplied prices are never used.
 */
export function buildQuote(
  items: { variantId: string; quantity: number }[],
  variants: CheckoutVariant[],
  discount: DiscountRow | null,
  now: Date = new Date(),
  /** True when the customer entered a code — a code that does not exist is then an error. */
  codeRequested: boolean = discount !== null,
): Quote {
  const byId = new Map(variants.map((v) => [v.id, v]));
  const merged = new Map<string, number>();
  for (const item of items) merged.set(item.variantId, (merged.get(item.variantId) ?? 0) + item.quantity);

  const issues: QuoteIssue[] = [];
  const lines: QuoteLine[] = [];
  for (const [variantId, quantity] of merged) {
    const v = byId.get(variantId);
    if (!v) {
      issues.push({ variantId, code: "NOT_FOUND", available: 0, message: "An item in your bag no longer exists." });
      continue;
    }
    if (v.productStatus !== "active" || !v.isActive) {
      issues.push({ variantId, code: "UNAVAILABLE", available: 0, message: `${v.productName} is no longer available.` });
      continue;
    }
    if (v.stock <= 0) {
      issues.push({
        variantId,
        code: "OUT_OF_STOCK",
        available: 0,
        message: `${v.productName} (${v.colorName}, ${v.size}) is sold out.`,
      });
      continue;
    }
    if (v.stock < quantity) {
      issues.push({
        variantId,
        code: "INSUFFICIENT_STOCK",
        available: v.stock,
        message: `Only ${v.stock} of ${v.productName} (${v.size}) available.`,
      });
      continue;
    }
    lines.push({ ...v, quantity, lineTotalCents: v.unitPriceCents * quantity });
  }
  if (issues.length > 0) return { ok: false, issues };

  const plain = lines.map((l) => ({ unitPriceCents: l.unitPriceCents, quantity: l.quantity }));
  const subtotalCents = plain.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  let discountError: string | null = null;
  let rule: DiscountRule | null = null;
  if (discount || codeRequested) {
    const result = validateDiscount(discount, subtotalCents, now);
    if (result.ok) rule = result.rule;
    else discountError = result.reason;
  }
  return {
    ok: true,
    lines,
    totals: computeTotals(plain, rule),
    discount: rule ? discount : null,
    discountError,
  };
}
