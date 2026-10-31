import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { handleStripeEvent } from "@/lib/stripe/webhook";
import { webhookDeps } from "@/lib/stripe/webhook-deps";
import { isStripeConfigured, stripeEnv } from "@/lib/env";

/**
 * Stripe webhook endpoint. The raw body is verified against the endpoint
 * secret before anything is trusted; payment state only ever changes here.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, signature, stripeEnv().STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const result = await handleStripeEvent(event, webhookDeps());
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    // Non-2xx makes Stripe retry with backoff; handlers are idempotent.
    console.error(`[stripe/webhook] failed to process ${event.type} ${event.id}`, error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
