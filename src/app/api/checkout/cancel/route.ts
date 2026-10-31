import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { isStripeConfigured } from "@/lib/env";

const schema = z.object({ orderId: z.uuid() });

/**
 * Called from the cancel page. Expires the Stripe session (so it can no longer
 * be paid) and returns the reserved stock immediately instead of waiting for
 * the session to time out. Only affects orders that are still pending.
 */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isStripeConfigured()) return NextResponse.json({ ok: false }, { status: 400 });

  const db = createServiceClient();
  const { data: order } = await db
    .from("orders")
    .select("id, status, stripe_checkout_session_id")
    .eq("id", parsed.data.orderId)
    .maybeSingle();
  if (!order || order.status !== "pending") return NextResponse.json({ ok: true });

  if (order.stripe_checkout_session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(order.stripe_checkout_session_id);
      if (session.status === "complete") return NextResponse.json({ ok: true });
      if (session.status === "open") await getStripe().checkout.sessions.expire(session.id);
    } catch (error) {
      console.error("[checkout/cancel] could not expire session", error);
      return NextResponse.json({ ok: false }, { status: 502 });
    }
  }
  await db.rpc("release_order", { p_order_id: order.id, p_status: "cancelled" });
  return NextResponse.json({ ok: true });
}
