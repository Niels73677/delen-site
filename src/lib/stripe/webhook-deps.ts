import "server-only";
import { createServiceClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import type { WebhookDeps } from "./webhook";

export function webhookDeps(): WebhookDeps {
  const db = createServiceClient();
  return {
    async isProcessed(eventId) {
      const { data, error } = await db.from("stripe_events").select("id").eq("id", eventId).maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
    async markProcessed(eventId, type) {
      const { error } = await db.from("stripe_events").upsert({ id: eventId, type }, { onConflict: "id", ignoreDuplicates: true });
      if (error) throw error;
    },
    async markPaid(input) {
      const { error } = await db.rpc("mark_order_paid", {
        p_session_id: input.sessionId,
        p_payment_intent_id: input.paymentIntentId as string,
        p_amount_total: input.amountTotal as number,
        p_email: input.email as string,
        p_customer_name: input.customerName as string,
        p_shipping_address: input.shippingAddress as Json,
        p_billing_address: input.billingAddress as Json,
        p_shipping_cents: input.shippingCents as number,
      });
      if (error) throw new Error(error.message);
    },
    async releaseBySession(sessionId, status, failed) {
      const { data: order, error } = await db
        .from("orders")
        .select("id")
        .eq("stripe_checkout_session_id", sessionId)
        .maybeSingle();
      if (error) throw error;
      if (!order) return;
      const { error: releaseError } = await db.rpc("release_order", { p_order_id: order.id, p_status: status });
      if (releaseError) throw releaseError;
      if (failed) {
        await db.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
      }
    },
    async markRefunded(paymentIntentId, fullyRefunded) {
      const { error } = await db
        .from("orders")
        .update(
          fullyRefunded
            ? { status: "refunded", payment_status: "refunded" }
            : { notes: "Partial refund issued in Stripe." },
        )
        .eq("stripe_payment_intent_id", paymentIntentId);
      if (error) throw error;
    },
  };
}
