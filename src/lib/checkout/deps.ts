import "server-only";
import type Stripe from "stripe";
import { commerce } from "@/config/brand";
import { publicEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import type { CheckoutDeps, StripeSessionInput } from "./create-checkout";
import type { CheckoutVariant, DiscountRow } from "./quote";

/** Production wiring for createCheckout(): Supabase (service role) + Stripe. */
export function checkoutDeps(): CheckoutDeps {
  const db = createServiceClient();
  const stripe = getStripe();

  return {
    siteUrl: publicEnv.siteUrl,

    async loadVariants(ids) {
      const { data, error } = await db
        .from("product_variants")
        .select(
          "id, color_name, size, is_active, price_override_cents, inventory(quantity), product:products(id, name, slug, status, price_cents, product_images(url, color_name, sort_order))",
        )
        .in("id", ids);
      if (error) throw error;
      return (data ?? []).map((v): CheckoutVariant => {
        const images = [...(v.product?.product_images ?? [])].sort(
          (a, b) =>
            Number(b.color_name === v.color_name) - Number(a.color_name === v.color_name) || a.sort_order - b.sort_order,
        );
        return {
          id: v.id,
          productId: v.product!.id,
          productName: v.product!.name,
          productSlug: v.product!.slug,
          productStatus: v.product!.status,
          isActive: v.is_active,
          colorName: v.color_name,
          size: v.size,
          unitPriceCents: v.price_override_cents ?? v.product!.price_cents,
          stock: v.inventory?.quantity ?? 0,
          imageUrl: images[0]?.url ?? null,
        };
      });
    },

    async loadDiscount(code) {
      const { data, error } = await db.from("discount_codes").select("*").eq("code", code).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        code: data.code,
        kind: data.kind as DiscountRow["kind"],
        value: data.value,
        minSubtotalCents: data.min_subtotal_cents,
        maxRedemptions: data.max_redemptions,
        redemptionCount: data.redemption_count,
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        isActive: data.is_active,
      };
    },

    async reserveOrder(args) {
      const { data, error } = await db.rpc("create_pending_order", {
        p_user_id: args.userId as string,
        p_email: args.email as string,
        p_items: args.items,
        p_subtotal_cents: args.subtotalCents,
        p_discount_cents: args.discountCents,
        p_shipping_cents: args.shippingCents,
        p_total_cents: args.totalCents,
        p_discount_code_id: args.discountCodeId as string,
        p_expires_at: args.expiresAt.toISOString(),
      });
      if (error) throw new Error(error.message);
      const row = data?.[0];
      if (!row) throw new Error("RESERVATION_FAILED");
      return { orderId: row.order_id, orderNumber: Number(row.order_number) };
    },

    async resolveCustomer(user) {
      const [{ data: profile }, { data: address }] = await Promise.all([
        db.from("profiles").select("full_name, phone, stripe_customer_id").eq("id", user.id).maybeSingle(),
        db.from("addresses").select("*").eq("user_id", user.id).eq("is_default", true).maybeSingle(),
      ]);
      if (!profile) return null;
      const shipping = address
        ? {
            name: address.full_name,
            phone: address.phone ?? profile.phone ?? undefined,
            address: {
              line1: address.line1,
              line2: address.line2 ?? undefined,
              city: address.city,
              postal_code: address.postal_code,
              state: address.region ?? undefined,
              country: address.country,
            },
          }
        : undefined;
      const details = {
        email: user.email ?? undefined,
        name: profile.full_name ?? undefined,
        phone: profile.phone ?? undefined,
        shipping,
        address: shipping?.address,
      };
      if (profile.stripe_customer_id) {
        await stripe.customers.update(profile.stripe_customer_id, details);
        return profile.stripe_customer_id;
      }
      const customer = await stripe.customers.create(
        { ...details, metadata: { user_id: user.id } },
        { idempotencyKey: `customer-${user.id}` },
      );
      await db.from("profiles").update({ stripe_customer_id: customer.id }).eq("id", user.id);
      return customer.id;
    },

    async createStripeSession(input) {
      return stripe.checkout.sessions.create(await sessionParams(stripe, input), {
        idempotencyKey: `checkout-session-${input.orderId}`,
      });
    },

    async attachSession(orderId, sessionId) {
      const { error } = await db.rpc("attach_checkout_session", { p_order_id: orderId, p_session_id: sessionId });
      if (error) throw error;
    },

    async releaseOrder(orderId) {
      const { error } = await db.rpc("release_order", { p_order_id: orderId, p_status: "cancelled" });
      if (error) throw error;
    },
  };
}

async function sessionParams(stripe: Stripe, input: StripeSessionInput): Promise<Stripe.Checkout.SessionCreateParams> {
  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (input.discountCents > 0) {
    // A single-use coupon for the exact amount the server calculated keeps
    // Stripe's total identical to ours, whatever the code's rules are.
    const coupon = await stripe.coupons.create(
      {
        amount_off: input.discountCents,
        currency: commerce.currency,
        duration: "once",
        max_redemptions: 1,
        name: input.discountCode ?? "Discount",
        metadata: { order_id: input.orderId },
      },
      { idempotencyKey: `checkout-coupon-${input.orderId}` },
    );
    discounts = [{ coupon: coupon.id }];
  }

  return {
    mode: "payment",
    client_reference_id: input.orderId,
    ...(input.stripeCustomerId
      ? { customer: input.stripeCustomerId, customer_update: { shipping: "auto", address: "auto", name: "auto" } }
      : { customer_email: input.customerEmail ?? undefined, customer_creation: "if_required" }),
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: [...commerce.shippingCountries],
    },
    phone_number_collection: { enabled: true },
    line_items: input.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: commerce.currency,
        unit_amount: line.unitPriceCents,
        product_data: {
          name: line.productName,
          description: `${line.colorName} / ${line.size}`,
          images: line.imageUrl?.startsWith("https://") ? [line.imageUrl] : undefined,
          metadata: { variant_id: line.id, product_id: line.productId },
        },
      },
    })),
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: input.shippingCents === 0 ? "Complimentary standard shipping" : "Standard shipping",
          fixed_amount: { amount: input.shippingCents, currency: commerce.currency },
          delivery_estimate: {
            minimum: { unit: "business_day", value: 2 },
            maximum: { unit: "business_day", value: 5 },
          },
        },
      },
    ],
    discounts,
    expires_at: Math.floor(input.expiresAt.getTime() / 1000),
    metadata: { order_id: input.orderId, order_number: String(input.orderNumber) },
    payment_intent_data: { metadata: { order_id: input.orderId, order_number: String(input.orderNumber) } },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };
}
