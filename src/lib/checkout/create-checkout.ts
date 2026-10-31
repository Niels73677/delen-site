import { commerce } from "@/config/brand";
import { CheckoutError, fromReservationError } from "./errors";
import { buildQuote, type CheckoutVariant, type DiscountRow, type QuoteLine } from "./quote";
import type { CheckoutRequest } from "./schema";

export type StripeSessionInput = {
  orderId: string;
  orderNumber: number;
  lines: QuoteLine[];
  shippingCents: number;
  discountCents: number;
  discountCode: string | null;
  customerEmail: string | null;
  expiresAt: Date;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutDeps = {
  loadVariants: (ids: string[]) => Promise<CheckoutVariant[]>;
  loadDiscount: (code: string) => Promise<DiscountRow | null>;
  reserveOrder: (args: {
    userId: string | null;
    email: string | null;
    items: { variant_id: string; quantity: number }[];
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    totalCents: number;
    discountCodeId: string | null;
    expiresAt: Date;
  }) => Promise<{ orderId: string; orderNumber: number }>;
  createStripeSession: (input: StripeSessionInput) => Promise<{ id: string; url: string | null }>;
  attachSession: (orderId: string, sessionId: string) => Promise<void>;
  releaseOrder: (orderId: string) => Promise<void>;
  siteUrl: string;
  now?: () => Date;
};

export type CheckoutUser = { id: string; email: string | null } | null;

/**
 * Starts a checkout:
 *  1. re-prices the bag from the database (never trusting client prices),
 *  2. atomically reserves stock and creates a pending order,
 *  3. creates a Stripe Checkout Session tied to that order.
 * If Stripe fails, the reservation is released immediately.
 */
export async function createCheckout(deps: CheckoutDeps, request: CheckoutRequest, user: CheckoutUser) {
  const now = deps.now?.() ?? new Date();
  const variantIds = [...new Set(request.items.map((i) => i.variantId))];
  const [variants, discount] = await Promise.all([
    deps.loadVariants(variantIds),
    request.discountCode ? deps.loadDiscount(request.discountCode) : Promise.resolve(null),
  ]);

  const quote = buildQuote(request.items, variants, discount, now);
  if (!quote.ok) {
    throw new CheckoutError("STOCK", "Some items in your bag are no longer available.", quote.issues, 409);
  }
  if (request.discountCode && quote.discountError) {
    throw new CheckoutError("DISCOUNT_INVALID", quote.discountError, [], 422);
  }

  const expiresAt = new Date(now.getTime() + commerce.reservationMinutes * 60_000 + 60_000);

  let order: { orderId: string; orderNumber: number };
  try {
    order = await deps.reserveOrder({
      userId: user?.id ?? null,
      email: user?.email ?? null,
      items: quote.lines.map((l) => ({ variant_id: l.id, quantity: l.quantity })),
      subtotalCents: quote.totals.subtotalCents,
      discountCents: quote.totals.discountCents,
      shippingCents: quote.totals.shippingCents,
      totalCents: quote.totals.totalCents,
      discountCodeId: quote.discount?.id ?? null,
      expiresAt,
    });
  } catch (error) {
    throw fromReservationError(error instanceof Error ? error.message : String(error));
  }

  try {
    const session = await deps.createStripeSession({
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      lines: quote.lines,
      shippingCents: quote.totals.shippingCents,
      discountCents: quote.totals.discountCents,
      discountCode: quote.discount?.code ?? null,
      customerEmail: user?.email ?? null,
      expiresAt,
      successUrl: `${deps.siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${deps.siteUrl}/checkout/cancelled?order=${order.orderId}`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    await deps.attachSession(order.orderId, session.id);
    return { url: session.url, orderId: order.orderId, totals: quote.totals };
  } catch (error) {
    await deps.releaseOrder(order.orderId).catch(() => undefined);
    if (error instanceof CheckoutError) throw error;
    console.error("[checkout] Stripe session creation failed", error);
    throw new CheckoutError("PAYMENT_PROVIDER", "Our payment provider is unavailable. Please try again shortly.", [], 502);
  }
}
