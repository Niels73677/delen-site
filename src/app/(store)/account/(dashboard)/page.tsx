import type { Metadata } from "next";
import Link from "next/link";
import { requireUserPage } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/profile-form";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountOverviewPage() {
  const auth = await requireUserPage("/account");
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, created_at, total_cents, status, payment_status, fulfillment_status")
    .eq("user_id", auth.userId)
    .neq("status", "expired")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="space-y-16">
      <section aria-labelledby="recent-orders">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 id="recent-orders" className="eyebrow">
            Recent orders
          </h2>
          <Link href="/account/orders" className="text-sm underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
        {orders && orders.length > 0 ? (
          <ul className="divide-y divide-border border-y border-border">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.id}`} className="flex items-center justify-between gap-4 py-5 hover:opacity-70">
                  <div>
                    <p className="text-sm font-medium">{formatOrderNumber(o.order_number)}</p>
                    <p className="text-[13px] text-muted-foreground">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge order={o} />
                    <span className="text-sm tabular-nums">{formatPrice(o.total_cents)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-surface p-8 text-sm text-muted-foreground">
            You haven&apos;t placed an order yet.{" "}
            <Link href="/shop" className="text-foreground underline underline-offset-4">
              Start shopping
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="eyebrow mb-6">
          Personal details
        </h2>
        <ProfileForm fullName={auth.profile?.full_name ?? ""} phone={auth.profile?.phone ?? ""} email={auth.email ?? ""} />
      </section>
    </div>
  );
}
