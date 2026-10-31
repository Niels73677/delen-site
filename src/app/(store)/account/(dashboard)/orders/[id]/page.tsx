import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUserPage } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { AddressBlock } from "@/components/account/address-block";
import { cn, formatDate, formatOrderNumber, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

const steps = ["Confirmed", "Processing", "Shipped", "Delivered"] as const;
const stepIndex: Record<string, number> = { unfulfilled: 0, processing: 1, shipped: 2, delivered: 3 };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUserPage(`/account/orders/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  // RLS guarantees a customer can only read their own order.
  const { data: order } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!order) notFound();

  const current = stepIndex[order.fulfillment_status] ?? -1;
  const active = order.status === "paid";

  return (
    <div>
      <Link href="/account/orders" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All orders
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">{formatOrderNumber(order.order_number)}</h2>
        <OrderStatusBadge order={order} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Placed on {formatDate(order.created_at, { dateStyle: "long" })}</p>

      {active && (
        <ol className="mt-10 grid grid-cols-4 gap-2" aria-label="Order progress">
          {steps.map((s, i) => (
            <li key={s} aria-current={i === current ? "step" : undefined}>
              <div className={cn("h-0.5", i <= current ? "bg-foreground" : "bg-border")} />
              <p className={cn("mt-3 text-[12px]", i <= current ? "text-foreground" : "text-muted-foreground")}>{s}</p>
            </li>
          ))}
        </ol>
      )}

      {order.tracking_number && (
        <div className="mt-8 bg-surface p-5 text-sm">
          <span className="eyebrow mr-3">Tracking</span>
          {order.tracking_carrier && <span className="mr-2">{order.tracking_carrier}</span>}
          <span className="font-mono">{order.tracking_number}</span>
        </div>
      )}

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {order.order_items.map((item) => (
          <li key={item.id} className="flex gap-4 py-5">
            <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-surface">
              {item.image_url && <Image src={item.image_url} alt={item.product_name} fill sizes="80px" className="object-cover" />}
            </div>
            <div className="flex-1">
              {item.product_slug ? (
                <Link href={`/products/${item.product_slug}`} className="text-sm font-medium hover:opacity-70">
                  {item.product_name}
                </Link>
              ) : (
                <p className="text-sm font-medium">{item.product_name}</p>
              )}
              <p className="mt-1 text-[13px] text-muted-foreground">
                {item.color_name} · {item.size} · Qty {item.quantity}
              </p>
            </div>
            <p className="text-sm tabular-nums">{formatPrice(item.line_total_cents)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-10 sm:grid-cols-3">
        <div>
          <h3 className="eyebrow mb-3">Shipping address</h3>
          <AddressBlock address={order.shipping_address} />
        </div>
        <div>
          <h3 className="eyebrow mb-3">Billing address</h3>
          <AddressBlock address={order.billing_address} />
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotal_cents)}</dd>
          </div>
          {order.discount_cents > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount {order.discount_code && `(${order.discount_code})`}</dt>
              <dd className="tabular-nums">−{formatPrice(order.discount_cents)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="tabular-nums">{order.shipping_cents === 0 ? "Complimentary" : formatPrice(order.shipping_cents)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-medium">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(order.total_cents)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
