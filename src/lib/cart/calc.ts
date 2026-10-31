import { commerce } from "@/config/brand";

export type DiscountRule = {
  code: string;
  kind: "percentage" | "fixed";
  value: number; // percent (1-100) or cents
  minSubtotalCents: number;
};

export type PricedLine = { unitPriceCents: number; quantity: number };

export type Totals = {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingRemainingCents: number;
  itemCount: number;
};

export function lineTotal(line: PricedLine): number {
  return line.unitPriceCents * line.quantity;
}

export function subtotal(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + lineTotal(l), 0);
}

export function discountAmount(rule: DiscountRule | null, subtotalCents: number): number {
  if (!rule || subtotalCents <= 0 || subtotalCents < rule.minSubtotalCents) return 0;
  const raw = rule.kind === "percentage" ? Math.round((subtotalCents * rule.value) / 100) : rule.value;
  return Math.min(Math.max(raw, 0), subtotalCents);
}

export function shippingFor(
  discountedSubtotalCents: number,
  itemCount: number,
  opts: { threshold?: number; flat?: number } = {},
): number {
  const threshold = opts.threshold ?? commerce.freeShippingThresholdCents;
  const flat = opts.flat ?? commerce.standardShippingCents;
  if (itemCount === 0) return 0;
  return discountedSubtotalCents >= threshold ? 0 : flat;
}

/** Single source of truth for order maths — used for the client estimate and the server quote. */
export function computeTotals(lines: PricedLine[], rule: DiscountRule | null = null): Totals {
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const sub = subtotal(lines);
  const discount = discountAmount(rule, sub);
  const afterDiscount = sub - discount;
  const shipping = shippingFor(afterDiscount, itemCount);
  return {
    subtotalCents: sub,
    discountCents: discount,
    shippingCents: shipping,
    totalCents: afterDiscount + shipping,
    freeShippingRemainingCents: itemCount === 0 ? commerce.freeShippingThresholdCents : Math.max(0, commerce.freeShippingThresholdCents - afterDiscount),
    itemCount,
  };
}
