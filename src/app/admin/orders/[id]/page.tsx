import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminPageContext } from "@/lib/auth/session";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { FulfillmentForm } from "@/components/admin/fulfillment-form";
import { AddressBlock } from "@/components/account/address-block";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/utils";

export const metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await adminPageContext();
  const { data: order } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!order) notFound();
  const { data: profile } = order.user_id
    ? await supabase.from("profiles").select("full_name, email, phone, created_at").eq("id", order.user_id).maybeSingle()
    : { data: null };
  const stripeUrl = order.stripe_payment_intent_id
    ? `https://dashboard.stripe.com/${process.env.STRIPE_SECRET_KEY?.startsWith("sk_test") ? "test/" : ""}payments/${order.stripe_payment_intent_id}`
    : null;

  return (
    <>
      <Link href="/admin/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Orders
      </Link>
      <AdminHeader
        title={formatOrderNumber(order.order_number)}
        description={`Placed ${formatDate(order.created_at, { dateStyle: "long", timeStyle: "short" })}`}
        action={
          <div className="flex gap-2">
            <Badge variant={order.payment_status === "paid" ? "success" : "muted"}>Payment: {order.payment_status}</Badge>
            <OrderStatusBadge order={order} />
          </div>
        }
      />
      {order.notes && <p className="mb-6 border-l-2 border-accent bg-card px-4 py-3 text-sm whitespace-pre-line">{order.notes}</p>}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title={`Items (${order.order_items.length})`}>
            <ul className="divide-y divide-border">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden bg-surface">
                    {item.image_url && <Image src={item.image_url} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-muted-foreground">
                      {item.color_name} · {item.size} · <span className="font-mono text-xs">{item.sku}</span>
                    </p>
                  </div>
                  <p className="text-sm tabular-nums text-muted-foreground">
                    {item.quantity} × {formatPrice(item.unit_price_cents)}
                  </p>
                  <p className="w-20 text-right text-sm tabular-nums">{formatPrice(item.line_total_cents)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-border px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(order.subtotal_cents)}</dd>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount ({order.discount_code})</dt>
                  <dd className="tabular-nums">−{formatPrice(order.discount_cents)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">{formatPrice(order.shipping_cents)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(order.total_cents)}</dd>
              </div>
            </dl>
          </Panel>
          <div className="grid gap-6 sm:grid-cols-2">
            <Panel title="Shipping address">
              <div className="p-5">
                <AddressBlock address={order.shipping_address} />
              </div>
            </Panel>
            <Panel title="Billing address">
              <div className="p-5">
                <AddressBlock address={order.billing_address} />
              </div>
            </Panel>
          </div>
        </div>
        <div className="space-y-6">
          <Panel title="Customer">
            <div className="space-y-1 p-5 text-sm">
              <p className="font-medium">{order.customer_name ?? profile?.full_name ?? "—"}</p>
              <p className="text-muted-foreground">{order.email ?? profile?.email ?? "—"}</p>
              {profile?.phone && <p className="text-muted-foreground">{profile.phone}</p>}
              <p className="pt-2 text-xs text-muted-foreground">
                {profile ? `Account since ${formatDate(profile.created_at)}` : "Guest checkout"}
              </p>
            </div>
          </Panel>
          <Panel title="Payment">
            <dl className="space-y-2 p-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>{order.payment_status}</dd>
              </div>
              {order.paid_at && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Paid</dt>
                  <dd>{formatDate(order.paid_at, { dateStyle: "medium", timeStyle: "short" })}</dd>
                </div>
              )}
              {stripeUrl && (
                <a href={stripeUrl} target="_blank" rel="noopener noreferrer" className="block pt-2 text-xs underline underline-offset-4">
                  View in Stripe dashboard
                </a>
              )}
            </dl>
          </Panel>
          <Panel title="Fulfilment">
            <FulfillmentForm
              orderId={order.id}
              fulfillmentStatus={order.fulfillment_status}
              trackingCarrier={order.tracking_carrier}
              trackingNumber={order.tracking_number}
              notes={order.notes}
              disabled={order.status !== "paid"}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
