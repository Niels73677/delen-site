import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireUserPage } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders", robots: { index: false } };

export default async function OrdersPage() {
  const auth = await requireUserPage("/account/orders");
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, created_at, total_cents, status, payment_status, fulfillment_status, order_items(id, image_url, product_name)")
    .eq("user_id", auth.userId)
    .in("status", ["paid", "refunded", "cancelled"])
    .order("created_at", { ascending: false });

  if (!orders?.length) {
    return (
      <div className="bg-surface p-10 text-center">
        <p className="text-lg font-medium">No orders yet</p>
        <p className="mt-2 text-sm text-muted-foreground">When you place an order, it will appear here with its status and tracking.</p>
        <Link href="/shop" className="eyebrow mt-6 inline-block underline underline-offset-4">
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/account/orders/${o.id}`} className="grid gap-4 py-6 transition-opacity hover:opacity-75 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <p className="font-medium">{formatOrderNumber(o.order_number)}</p>
                <OrderStatusBadge order={o} />
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {formatDate(o.created_at)} · {o.order_items.length} {o.order_items.length === 1 ? "item" : "items"} · {formatPrice(o.total_cents)}
              </p>
            </div>
            <div className="flex gap-2">
              {o.order_items.slice(0, 4).map((i) => (
                <div key={i.id} className="relative aspect-[4/5] w-12 overflow-hidden bg-surface">
                  {i.image_url && <Image src={i.image_url} alt={i.product_name} fill sizes="48px" className="object-cover" />}
                </div>
              ))}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
