import { Client } from "pg";
import Stripe from "stripe";

export const hasDatabase = Boolean(process.env.TEST_DATABASE_URL);
export const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);

export async function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const db = new Client({ connectionString: process.env.TEST_DATABASE_URL });
  await db.connect();
  try {
    return (await db.query(sql, params)).rows as T[];
  } finally {
    await db.end();
  }
}

/** Builds a webhook request signed exactly like Stripe signs it. */
export function signedWebhook(type: string, object: Record<string, unknown>) {
  const payload = JSON.stringify({
    id: `evt_e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    object: "event",
    type,
    api_version: "2026-10-28",
    created: Math.floor(Date.now() / 1000),
    data: { object },
  });
  const signature = new Stripe("sk_test_signing_only").webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  return { payload, signature };
}
