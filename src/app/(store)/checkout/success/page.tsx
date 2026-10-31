import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatOrderNumber, formatPrice } from "@/lib/utils";
import { AutoRefresh } from "./auto-refresh";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ session_id?: string }> };

/**
 * The order status shown here comes from our database, which is updated only by
 * the verified Stripe webhook — never from the redirect itself.
 */
export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;
  const valid = typeof sessionId === "string" && /^cs_[A-Za-z0-9_]+$/.test(sessionId);

  const order = valid
    ? (
        await createServiceClient()
          .from("orders")
          .select(
            "id, order_number, status, payment_status, email, subtotal_cents, discount_cents, shipping_cents, total_cents, order_items(id, product_name, color_name, size, quantity, line_total_cents, image_url)",
          )
          .eq("stripe_checkout_session_id", sessionId)
          .maybeSingle()
      ).data
    : null;

  if (!order) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">We couldn&apos;t find that order</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          If you completed a payment, a confirmation email is on its way. Contact us if you need help.
        </p>
        <Button asChild className="mt-8">
          <Link href="/help">Contact us</Link>
        </Button>
      </div>
    );
  }

  const paid = order.payment_status === "paid";

  return (
    <div className="container-page grid gap-14 py-16 lg:grid-cols-12 lg:py-24">
      {paid && <ClearCartOnMount />}
      {!paid && <AutoRefresh />}
      <div className="lg:col-span-6">
        {paid ? (
          <CheckCircle2 className="size-8 text-success" strokeWidth={1.25} />
        ) : (
          <Clock className="size-8 text-muted-foreground" strokeWidth={1.25} />
        )}
        <p className="eyebrow mt-8 text-muted-foreground">Order {formatOrderNumber(order.order_number)}</p>
        <h1 className="text-headline mt-4 font-semibold uppercase">{paid ? "Thank you." : "Almost there."}</h1>
        <p className="mt-6 max-w-md text-muted-foreground" aria-live="polite">
          {paid
            ? `Your payment is confirmed. We've sent a receipt to ${order.email ?? "your email"} and will let you know as soon as your order ships.`
            : "We're waiting for confirmation from our payment provider. This usually takes a few seconds — this page will update automatically."}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/shop">Continue shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account/orders">View your orders</Link>
          </Button>
        </div>
      </div>
      <aside className="bg-surface p-6 sm:p-8 lg:col-span-5 lg:col-start-8" aria-label="Order summary">
        <h2 className="eyebrow">Summary</h2>
        <ul className="mt-6 divide-y divide-border">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-background">
                {item.image_url && <Image src={item.image_url} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{item.product_name}</p>
                <p className="text-muted-foreground">
                  {item.color_name} · {item.size} · ×{item.quantity}
                </p>
              </div>
              <p className="text-sm tabular-nums">{formatPrice(item.line_total_cents)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(order.subtotal_cents)}</dd>
          </div>
          {order.discount_cents > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd>−{formatPrice(order.discount_cents)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{order.shipping_cents === 0 ? "Complimentary" : formatPrice(order.shipping_cents)}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(order.total_cents)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
