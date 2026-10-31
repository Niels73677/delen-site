import "server-only";
import Stripe from "stripe";
import { stripeEnv } from "@/lib/env";

let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  stripe ??= new Stripe(stripeEnv().STRIPE_SECRET_KEY, {
    appInfo: { name: "atelier-store" },
    maxNetworkRetries: 2,
  });
  return stripe;
}
