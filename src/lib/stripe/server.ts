import "server-only";
import Stripe from "stripe";
import { stripeEnv } from "@/lib/env";

let stripe: Stripe | undefined;

/**
 * Server-side Stripe client. `STRIPE_API_BASE_URL` is only for automated tests
 * against stripe-mock (https://github.com/stripe/stripe-mock) — never set it in production.
 */
export function getStripe(): Stripe {
  if (stripe) return stripe;
  const { STRIPE_SECRET_KEY } = stripeEnv();
  // The override is honoured only with test-mode keys, so it can never redirect live payments.
  const base =
    process.env.STRIPE_API_BASE_URL && STRIPE_SECRET_KEY.startsWith("sk_test_") ? new URL(process.env.STRIPE_API_BASE_URL) : null;
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    appInfo: { name: "atelier-store" },
    maxNetworkRetries: 2,
    ...(base
      ? { host: base.hostname, port: Number(base.port), protocol: base.protocol.replace(":", "") as "http" | "https" }
      : {}),
  });
  return stripe;
}
