import { z } from "zod";

/**
 * Environment access. Public values are inlined by Next at build time, so they
 * must be referenced as literal `process.env.NEXT_PUBLIC_*` expressions.
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
};

export function isSupabaseConfigured() {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, "SUPABASE_SERVICE_ROLE_KEY is missing"),
});

const stripeSchema = z.object({
  STRIPE_SECRET_KEY: z.string().startsWith("sk_", "STRIPE_SECRET_KEY must start with sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "STRIPE_WEBHOOK_SECRET must start with whsec_"),
});

/** Server-only secrets. Throws a descriptive error when misconfigured. */
export function serverEnv() {
  return serverSchema.parse(process.env);
}

export function stripeEnv() {
  return stripeSchema.parse(process.env);
}

export function isStripeConfigured() {
  return stripeSchema.safeParse(process.env).success;
}
