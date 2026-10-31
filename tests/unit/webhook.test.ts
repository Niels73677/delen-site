import { describe, expect, it, vi } from "vitest";
import Stripe from "stripe";
import { handleStripeEvent, paidOrderFromSession, type WebhookDeps } from "@/lib/stripe/webhook";

const stripe = new Stripe("sk_test_dummy");
const SECRET = "whsec_test_secret";

function deps(processed = new Set<string>()): WebhookDeps & { processed: Set<string> } {
  return {
    processed,
    isProcessed: vi.fn(async (id: string) => processed.has(id)),
    markProcessed: vi.fn(async (id: string) => void processed.add(id)),
    markPaid: vi.fn(async () => undefined),
    releaseBySession: vi.fn(async () => undefined),
    markRefunded: vi.fn(async () => undefined),
  };
}

function session(over: Record<string, unknown> = {}) {
  return {
    id: "cs_test_1",
    object: "checkout.session",
    payment_status: "paid",
    payment_intent: "pi_1",
    amount_total: 18900,
    customer_email: null,
    customer_details: {
      email: "ann@example.com",
      name: "Ann Example",
      phone: "+31600000000",
      address: { line1: "Billing 1", line2: null, city: "Amsterdam", postal_code: "1011", state: null, country: "NL" },
    },
    collected_information: {
      shipping_details: {
        name: "Ann Example",
        address: { line1: "Keizersgracht 1", line2: null, city: "Amsterdam", postal_code: "1015", state: null, country: "NL" },
      },
    },
    shipping_cost: { amount_total: 0 },
    ...over,
  };
}

/** Builds an event exactly as Stripe would deliver it, then verifies the signature. */
function signedEvent(type: string, object: Record<string, unknown>, id = `evt_${Math.random().toString(36).slice(2)}`) {
  const payload = JSON.stringify({ id, object: "event", type, data: { object }, api_version: "2026-10-28", created: 1 });
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
  return stripe.webhooks.constructEvent(payload, header, SECRET);
}

describe("webhook signature verification", () => {
  it("rejects a tampered payload", () => {
    const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: session() } });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
    const tampered = payload.replace("18900", "1");
    expect(() => stripe.webhooks.constructEvent(tampered, header, SECRET)).toThrow();
  });

  it("rejects the wrong secret", () => {
    const payload = JSON.stringify({ id: "evt_1" });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_other" });
    expect(() => stripe.webhooks.constructEvent(payload, header, SECRET)).toThrow();
  });
});

describe("handleStripeEvent", () => {
  it("marks the order paid on a completed, paid session", async () => {
    const d = deps();
    const r = await handleStripeEvent(signedEvent("checkout.session.completed", session()), d);
    expect(r).toEqual({ status: "processed", action: "paid" });
    expect(d.markPaid).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "cs_test_1",
        paymentIntentId: "pi_1",
        amountTotal: 18900,
        email: "ann@example.com",
        shippingCents: 0,
        shippingAddress: expect.objectContaining({ line1: "Keizersgracht 1", country: "NL" }),
        billingAddress: expect.objectContaining({ line1: "Billing 1" }),
      }),
    );
  });

  it("does not mark unpaid (delayed) sessions as paid", async () => {
    const d = deps();
    const r = await handleStripeEvent(signedEvent("checkout.session.completed", session({ payment_status: "unpaid" })), d);
    expect(r.action).toBe("awaiting_async_payment");
    expect(d.markPaid).not.toHaveBeenCalled();
  });

  it("marks paid when a delayed payment succeeds", async () => {
    const d = deps();
    await handleStripeEvent(signedEvent("checkout.session.async_payment_succeeded", session()), d);
    expect(d.markPaid).toHaveBeenCalledTimes(1);
  });

  it("releases reserved stock when a session expires or payment fails", async () => {
    const d = deps();
    await handleStripeEvent(signedEvent("checkout.session.expired", session({ payment_status: "unpaid" })), d);
    await handleStripeEvent(signedEvent("checkout.session.async_payment_failed", session({ payment_status: "unpaid" })), d);
    expect(d.releaseBySession).toHaveBeenNthCalledWith(1, "cs_test_1", "expired");
    expect(d.releaseBySession).toHaveBeenNthCalledWith(2, "cs_test_1", "cancelled", true);
  });

  it("is idempotent: a redelivered event is not applied twice", async () => {
    const d = deps();
    const event = signedEvent("checkout.session.completed", session(), "evt_same");
    expect((await handleStripeEvent(event, d)).status).toBe("processed");
    expect((await handleStripeEvent(event, d)).status).toBe("duplicate");
    expect(d.markPaid).toHaveBeenCalledTimes(1);
  });

  it("does not record the event when processing fails, so Stripe can retry", async () => {
    const d = deps();
    vi.mocked(d.markPaid).mockRejectedValueOnce(new Error("db down"));
    const event = signedEvent("checkout.session.completed", session(), "evt_retry");
    await expect(handleStripeEvent(event, d)).rejects.toThrow("db down");
    expect(d.processed.has("evt_retry")).toBe(false);
    await handleStripeEvent(event, d);
    expect(d.markPaid).toHaveBeenCalledTimes(2);
  });

  it("records refunds", async () => {
    const d = deps();
    await handleStripeEvent(signedEvent("charge.refunded", { id: "ch_1", object: "charge", payment_intent: "pi_1", refunded: true }), d);
    expect(d.markRefunded).toHaveBeenCalledWith("pi_1", true);
  });

  it("acknowledges unrelated events without side effects", async () => {
    const d = deps();
    const r = await handleStripeEvent(signedEvent("customer.created", { id: "cus_1", object: "customer" }), d);
    expect(r.status).toBe("ignored");
    expect(d.markPaid).not.toHaveBeenCalled();
  });
});

describe("paidOrderFromSession", () => {
  it("handles expanded payment intents and missing shipping", () => {
    const s = session({ payment_intent: { id: "pi_obj" }, collected_information: null }) as unknown as Stripe.Checkout.Session;
    const r = paidOrderFromSession(s);
    expect(r.paymentIntentId).toBe("pi_obj");
    expect(r.shippingAddress).toBeNull();
  });
});
