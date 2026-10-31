import type Stripe from "stripe";

export type PaidOrderInput = {
  sessionId: string;
  paymentIntentId: string | null;
  amountTotal: number | null;
  shippingCents: number | null;
  email: string | null;
  customerName: string | null;
  shippingAddress: Record<string, unknown> | null;
  billingAddress: Record<string, unknown> | null;
};

export type WebhookDeps = {
  isProcessed: (eventId: string) => Promise<boolean>;
  markProcessed: (eventId: string, type: string) => Promise<void>;
  markPaid: (input: PaidOrderInput) => Promise<void>;
  releaseBySession: (sessionId: string, status: "expired" | "cancelled", failed?: boolean) => Promise<void>;
  markRefunded: (paymentIntentId: string, fullyRefunded: boolean) => Promise<void>;
};

export type WebhookResult = { status: "processed" | "duplicate" | "ignored"; action?: string };

function addressToJson(
  name: string | null | undefined,
  address: Stripe.Address | null | undefined,
  phone?: string | null,
): Record<string, unknown> | null {
  if (!address) return null;
  return {
    name: name ?? null,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    postal_code: address.postal_code,
    state: address.state,
    country: address.country,
    phone: phone ?? null,
  };
}

export function paidOrderFromSession(session: Stripe.Checkout.Session): PaidOrderInput {
  const shipping = session.collected_information?.shipping_details ?? null;
  const customer = session.customer_details;
  return {
    sessionId: session.id,
    paymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null),
    amountTotal: session.amount_total,
    shippingCents: session.shipping_cost?.amount_total ?? null,
    email: customer?.email ?? session.customer_email ?? null,
    customerName: customer?.name ?? shipping?.name ?? null,
    shippingAddress: addressToJson(shipping?.name, shipping?.address, customer?.phone),
    billingAddress: addressToJson(customer?.name, customer?.address, customer?.phone),
  };
}

/**
 * Applies a verified Stripe event to our order state. Every branch is
 * idempotent at the database level, and processed event ids are recorded so
 * Stripe's at-least-once delivery never double-applies an event.
 */
export async function handleStripeEvent(event: Stripe.Event, deps: WebhookDeps): Promise<WebhookResult> {
  if (await deps.isProcessed(event.id)) return { status: "duplicate" };

  let action: string | undefined;
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // Card payments are "paid" immediately; delayed methods (e.g. SEPA)
      // arrive later via async_payment_succeeded.
      if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
        await deps.markPaid(paidOrderFromSession(session));
        action = "paid";
      } else {
        action = "awaiting_async_payment";
      }
      break;
    }
    case "checkout.session.async_payment_succeeded": {
      await deps.markPaid(paidOrderFromSession(event.data.object));
      action = "paid";
      break;
    }
    case "checkout.session.async_payment_failed": {
      await deps.releaseBySession(event.data.object.id, "cancelled", true);
      action = "released";
      break;
    }
    case "checkout.session.expired": {
      await deps.releaseBySession(event.data.object.id, "expired");
      action = "released";
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (pi) {
        await deps.markRefunded(pi, charge.refunded);
        action = "refunded";
      }
      break;
    }
    default:
      await deps.markProcessed(event.id, event.type);
      return { status: "ignored" };
  }

  await deps.markProcessed(event.id, event.type);
  return { status: "processed", action };
}
