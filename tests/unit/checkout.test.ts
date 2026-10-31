import { describe, expect, it, vi } from "vitest";
import { buildQuote, validateDiscount, type CheckoutVariant, type DiscountRow } from "@/lib/checkout/quote";
import { createCheckout, type CheckoutDeps } from "@/lib/checkout/create-checkout";
import { checkoutRequestSchema } from "@/lib/checkout/schema";
import { CheckoutError, fromReservationError } from "@/lib/checkout/errors";
import { commerce } from "@/config/brand";

const V1 = "11111111-1111-4111-8111-111111111111";
const V2 = "22222222-2222-4222-8222-222222222222";
const ORDER = "33333333-3333-4333-8333-333333333333";

const variant = (over: Partial<CheckoutVariant> = {}): CheckoutVariant => ({
  id: V1,
  productId: "p1",
  productName: "Heavyweight Tee",
  productSlug: "tee",
  productStatus: "active",
  isActive: true,
  colorName: "Black",
  size: "M",
  unitPriceCents: 4500,
  stock: 10,
  imageUrl: "https://images.unsplash.com/x",
  ...over,
});

const discount = (over: Partial<DiscountRow> = {}): DiscountRow => ({
  id: "d1",
  code: "WELCOME10",
  kind: "percentage",
  value: 10,
  minSubtotalCents: 0,
  maxRedemptions: null,
  redemptionCount: 0,
  startsAt: null,
  endsAt: null,
  isActive: true,
  ...over,
});

function deps(over: Partial<CheckoutDeps> = {}): CheckoutDeps {
  return {
    siteUrl: "https://shop.test",
    now: () => new Date("2026-10-31T12:00:00Z"),
    loadVariants: vi.fn(async () => [variant(), variant({ id: V2, unitPriceCents: 12000, size: "L" })]),
    loadDiscount: vi.fn(async () => discount()),
    reserveOrder: vi.fn(async () => ({ orderId: ORDER, orderNumber: 100001 })),
    createStripeSession: vi.fn(async () => ({ id: "cs_test_123", url: "https://checkout.stripe.com/c/pay/cs_test_123" })),
    attachSession: vi.fn(async () => undefined),
    releaseOrder: vi.fn(async () => undefined),
    ...over,
  };
}

describe("checkout request validation", () => {
  it("accepts a valid bag and normalises the discount code", () => {
    const r = checkoutRequestSchema.parse({ items: [{ variantId: V1, quantity: 2 }], discountCode: "welcome10" });
    expect(r.discountCode).toBe("WELCOME10");
  });

  it("rejects empty bags, bad ids, and out-of-range quantities", () => {
    expect(checkoutRequestSchema.safeParse({ items: [] }).success).toBe(false);
    expect(checkoutRequestSchema.safeParse({ items: [{ variantId: "nope", quantity: 1 }] }).success).toBe(false);
    expect(checkoutRequestSchema.safeParse({ items: [{ variantId: V1, quantity: 0 }] }).success).toBe(false);
    expect(checkoutRequestSchema.safeParse({ items: [{ variantId: V1, quantity: commerce.maxQuantityPerLine + 1 }] }).success).toBe(false);
  });

  it("ignores any client-supplied price fields", () => {
    const r = checkoutRequestSchema.parse({ items: [{ variantId: V1, quantity: 1, unitPriceCents: 1 }] });
    expect(r.items[0]).toEqual({ variantId: V1, quantity: 1 });
  });
});

describe("buildQuote", () => {
  it("prices from database values and merges duplicate lines", () => {
    const q = buildQuote(
      [
        { variantId: V1, quantity: 1 },
        { variantId: V1, quantity: 2 },
      ],
      [variant()],
      null,
    );
    expect(q.ok).toBe(true);
    if (!q.ok) return;
    expect(q.lines).toHaveLength(1);
    expect(q.lines[0]!.quantity).toBe(3);
    expect(q.totals.subtotalCents).toBe(13500);
  });

  it("reports unavailable, sold-out and insufficient-stock items", () => {
    const q = buildQuote(
      [
        { variantId: V1, quantity: 5 },
        { variantId: V2, quantity: 1 },
        { variantId: "missing", quantity: 1 },
      ],
      [variant({ stock: 2 }), variant({ id: V2, productStatus: "archived" })],
      null,
    );
    expect(q.ok).toBe(false);
    if (q.ok) return;
    expect(q.issues.map((i) => i.code).sort()).toEqual(["INSUFFICIENT_STOCK", "NOT_FOUND", "UNAVAILABLE"]);
    expect(q.issues.find((i) => i.code === "INSUFFICIENT_STOCK")!.available).toBe(2);
  });

  it("applies a valid discount and reports an invalid one", () => {
    const ok = buildQuote([{ variantId: V1, quantity: 2 }], [variant()], discount());
    expect(ok.ok && ok.totals.discountCents).toBe(900);
    const bad = buildQuote([{ variantId: V1, quantity: 1 }], [variant()], discount({ minSubtotalCents: 20000 }));
    expect(bad.ok && bad.discountError).toMatch(/minimum order/);
    expect(bad.ok && bad.totals.discountCents).toBe(0);
  });
});

describe("validateDiscount", () => {
  const now = new Date("2026-10-31T12:00:00Z");
  it.each([
    [discount({ isActive: false }), /not valid/],
    [discount({ startsAt: "2026-11-01T00:00:00Z" }), /not active yet/],
    [discount({ endsAt: "2026-10-30T00:00:00Z" }), /expired/],
    [discount({ maxRedemptions: 5, redemptionCount: 5 }), /usage limit/],
  ])("rejects %#", (row, reason) => {
    const r = validateDiscount(row, 10000, now);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(reason);
  });
});

describe("createCheckout", () => {
  it("reserves stock with server-computed totals, then creates and attaches a Stripe session", async () => {
    const d = deps();
    const result = await createCheckout(
      d,
      { items: [{ variantId: V1, quantity: 2 }, { variantId: V2, quantity: 1 }], discountCode: "WELCOME10" },
      { id: "user-1", email: "ann@example.com" },
    );
    // 2 × 45 + 120 = 210; 10% = 21; shipping free over 150.
    expect(d.reserveOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        email: "ann@example.com",
        subtotalCents: 21000,
        discountCents: 2100,
        shippingCents: 0,
        totalCents: 18900,
        discountCodeId: "d1",
        items: [
          { variant_id: V1, quantity: 2 },
          { variant_id: V2, quantity: 1 },
        ],
      }),
    );
    const session = vi.mocked(d.createStripeSession).mock.calls[0]![0];
    expect(session.orderId).toBe(ORDER);
    expect(session.discountCents).toBe(2100);
    expect(session.successUrl).toBe("https://shop.test/checkout/success?session_id={CHECKOUT_SESSION_ID}");
    expect(session.expiresAt.getTime() - Date.parse("2026-10-31T12:00:00Z")).toBeGreaterThanOrEqual(30 * 60_000);
    expect(d.attachSession).toHaveBeenCalledWith(ORDER, "cs_test_123");
    expect(result.url).toContain("checkout.stripe.com");
  });

  it("supports guest checkout", async () => {
    const d = deps();
    await createCheckout(d, { items: [{ variantId: V1, quantity: 1 }] }, null);
    expect(d.reserveOrder).toHaveBeenCalledWith(expect.objectContaining({ userId: null, email: null, shippingCents: commerce.standardShippingCents }));
  });

  it("refuses to start when stock is insufficient — nothing is reserved", async () => {
    const d = deps({ loadVariants: vi.fn(async () => [variant({ stock: 1 })]) });
    await expect(createCheckout(d, { items: [{ variantId: V1, quantity: 2 }] }, null)).rejects.toMatchObject({ code: "STOCK" });
    expect(d.reserveOrder).not.toHaveBeenCalled();
  });

  it("rejects an invalid discount code before reserving", async () => {
    const d = deps({ loadDiscount: vi.fn(async () => null) });
    await expect(createCheckout(d, { items: [{ variantId: V1, quantity: 1 }], discountCode: "NOPE" }, null)).rejects.toMatchObject({
      code: "DISCOUNT_INVALID",
    });
    expect(d.reserveOrder).not.toHaveBeenCalled();
  });

  it("maps a lost race at the database into a stock error", async () => {
    const d = deps({ reserveOrder: vi.fn(async () => Promise.reject(new Error(`INSUFFICIENT_STOCK:${V1}`))) });
    await expect(createCheckout(d, { items: [{ variantId: V1, quantity: 1 }] }, null)).rejects.toMatchObject({ code: "STOCK", status: 409 });
    expect(d.createStripeSession).not.toHaveBeenCalled();
  });

  it("releases the reservation when Stripe fails", async () => {
    const d = deps({ createStripeSession: vi.fn(async () => Promise.reject(new Error("stripe down"))) });
    const err = await createCheckout(d, { items: [{ variantId: V1, quantity: 1 }] }, null).catch((e) => e);
    expect(err).toBeInstanceOf(CheckoutError);
    expect(err.code).toBe("PAYMENT_PROVIDER");
    expect(d.releaseOrder).toHaveBeenCalledWith(ORDER);
    expect(d.attachSession).not.toHaveBeenCalled();
  });

  it("continues without a Stripe customer if customer lookup fails", async () => {
    const d = deps({ resolveCustomer: vi.fn(async () => Promise.reject(new Error("boom"))) });
    await createCheckout(d, { items: [{ variantId: V1, quantity: 1 }] }, { id: "u", email: "u@x.co" });
    expect(vi.mocked(d.createStripeSession).mock.calls[0]![0].stripeCustomerId).toBeNull();
  });
});

describe("fromReservationError", () => {
  it("maps database error codes", () => {
    expect(fromReservationError("PRICE_CHANGED").code).toBe("PRICE_CHANGED");
    expect(fromReservationError("DISCOUNT_INVALID").code).toBe("DISCOUNT_INVALID");
    expect(fromReservationError(`INSUFFICIENT_STOCK:${V1}`).issues[0]!.variantId).toBe(V1);
    expect(fromReservationError("something else").status).toBe(500);
  });
});

describe("unknown discount codes", () => {
  it("are reported as invalid in a quote rather than silently ignored", () => {
    const q = buildQuote([{ variantId: V1, quantity: 1 }], [variant()], null, new Date(), true);
    expect(q.ok && q.discountError).toMatch(/not valid/);
  });
});
