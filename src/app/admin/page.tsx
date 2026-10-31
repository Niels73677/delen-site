import Image from "next/image";
import Link from "next/link";
import { adminPageContext } from "@/lib/auth/session";
import { AdminHeader, EmptyRow, Panel, StatCard, Table, Th } from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/utils";

export const metadata = { title: "Overview" };

type Stats = {
  revenue_cents: number;
  orders: number;
  customers: number;
  average_order_cents: number;
  pending_fulfillment: number;
  revenue_30d_cents: number;
};

export default async function AdminOverviewPage() {
  const { supabase } = await adminPageContext();
  const [{ data: statsData }, { data: recent }, { data: best }, { data: lowStock }] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase
      .from("orders")
      .select("id, order_number, email, customer_name, total_cents, created_at, status, payment_status, fulfillment_status")
      .in("status", ["paid", "refunded"])
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.rpc("admin_best_sellers", { p_limit: 5 }),
    supabase
      .from("inventory")
      .select("quantity, variant:product_variants!inner(id, sku, color_name, size, is_active, product:products!inner(id, name, status))")
      .lte("quantity", 2)
      .eq("variant.is_active", true)
      .eq("variant.product.status", "active")
      .order("quantity")
      .limit(8),
  ]);
  const stats = (statsData ?? {}) as Partial<Stats>;

  return (
    <>
      <AdminHeader title="Overview" description="How the store is performing." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Total revenue" value={formatPrice(stats.revenue_cents ?? 0)} hint={`${formatPrice(stats.revenue_30d_cents ?? 0)} last 30 days`} />
        <StatCard label="Orders" value={String(stats.orders ?? 0)} hint={`${stats.pending_fulfillment ?? 0} awaiting fulfilment`} />
        <StatCard label="Customers" value={String(stats.customers ?? 0)} hint="Registered accounts" />
        <StatCard label="Avg. order value" value={formatPrice(stats.average_order_cents ?? 0)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          title="Recent orders"
          className="xl:col-span-2"
          action={
            <Link href="/admin/orders" className="text-xs underline underline-offset-4">
              View all
            </Link>
          }
        >
          <Table>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {recent?.length ? (
                recent.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-4 hover:underline">
                        {formatOrderNumber(o.order_number)}
                      </Link>
                    </td>
                    <td className="max-w-48 truncate text-muted-foreground">{o.customer_name ?? o.email ?? "—"}</td>
                    <td className="text-muted-foreground">{formatDate(o.created_at)}</td>
                    <td>
                      <OrderStatusBadge order={o} />
                    </td>
                    <td className="text-right tabular-nums">{formatPrice(o.total_cents)}</td>
                  </tr>
                ))
              ) : (
                <EmptyRow colSpan={5}>No orders yet.</EmptyRow>
              )}
            </tbody>
          </Table>
        </Panel>

        <div className="space-y-6">
          <Panel title="Best sellers">
            <ul className="divide-y divide-border">
              {best?.length ? (
                best.map((p, i) => (
                  <li key={p.product_id ?? i} className="flex items-center gap-4 px-5 py-3">
                    <span className="w-4 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                    <div className="relative aspect-[4/5] w-10 shrink-0 overflow-hidden bg-surface">
                      {p.image_url && <Image src={p.image_url} alt="" fill sizes="40px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.units} sold</p>
                    </div>
                    <span className="text-sm tabular-nums">{formatPrice(Number(p.revenue_cents))}</span>
                  </li>
                ))
              ) : (
                <li className="px-5 py-10 text-center text-sm text-muted-foreground">Sales will appear here.</li>
              )}
            </ul>
          </Panel>
          <Panel title="Low stock">
            <ul className="divide-y divide-border">
              {lowStock?.length ? (
                lowStock.map((row) => (
                  <li key={row.variant.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <Link href={`/admin/products/${row.variant.product.id}`} className="min-w-0 truncate hover:underline">
                      {row.variant.product.name}{" "}
                      <span className="text-muted-foreground">
                        · {row.variant.color_name} / {row.variant.size}
                      </span>
                    </Link>
                    <span className={row.quantity === 0 ? "text-destructive" : "text-foreground"}>{row.quantity}</span>
                  </li>
                ))
              ) : (
                <li className="px-5 py-10 text-center text-sm text-muted-foreground">Stock levels look healthy.</li>
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
