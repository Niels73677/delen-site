import Link from "next/link";
import { adminPageContext } from "@/lib/auth/session";
import { AdminHeader, AdminPagination, EmptyRow, Panel, Table, Th } from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/utils";

export const metadata = { title: "Orders" };
const PER_PAGE = 25;

type Props = { searchParams: Promise<{ q?: string; status?: string; fulfillment?: string; page?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { supabase } = await adminPageContext();
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80) ?? "";
  const status = ["pending", "paid", "cancelled", "expired", "refunded"].includes(sp.status ?? "") ? sp.status! : "";
  const fulfillment = ["unfulfilled", "processing", "shipped", "delivered", "cancelled"].includes(sp.fulfillment ?? "") ? sp.fulfillment! : "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  let query = supabase
    .from("orders")
    .select("id, order_number, email, customer_name, total_cents, created_at, status, payment_status, fulfillment_status, user_id", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  if (status) query = query.eq("status", status);
  else query = query.neq("status", "expired");
  if (fulfillment) query = query.eq("fulfillment_status", fulfillment);
  if (q) {
    const num = Number.parseInt(q.replace(/^AT-/i, ""), 10);
    const safe = q.replace(/[%_,()]/g, "");
    query = Number.isInteger(num) && /^\s*(AT-)?\d+\s*$/i.test(q)
      ? query.eq("order_number", num)
      : query.or(`email.ilike.%${safe}%,customer_name.ilike.%${safe}%`);
  }
  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PER_PAGE);
  const href = (p: number) =>
    `/admin/orders?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), ...(fulfillment && { fulfillment }), page: String(p) })}`;

  return (
    <>
      <AdminHeader title="Orders" description={`${count ?? 0} orders`} />
      <Panel>
        <form className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row" role="search">
          <input
            name="q"
            defaultValue={q}
            placeholder="Order number, email or name"
            className="h-10 flex-1 border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none"
          />
          <select name="status" defaultValue={status} className="h-10 border border-border bg-background px-3 text-sm" aria-label="Payment status">
            <option value="">All (excl. expired)</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending payment</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired checkouts</option>
          </select>
          <select name="fulfillment" defaultValue={fulfillment} className="h-10 border border-border bg-background px-3 text-sm" aria-label="Fulfilment">
            <option value="">Any fulfilment</option>
            <option value="unfulfilled">Unfulfilled</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          <Button type="submit" variant="outline" size="sm" className="h-10">
            Apply
          </Button>
        </form>
        <Table>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Payment</Th>
              <Th>Status</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {orders?.length ? (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-4 hover:underline">
                      {formatOrderNumber(o.order_number)}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap text-muted-foreground">{formatDate(o.created_at, { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="max-w-56">
                    <span className="block truncate">{o.customer_name ?? "—"}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {o.email ?? "—"} {o.user_id ? "" : "· guest"}
                    </span>
                  </td>
                  <td>
                    <Badge variant={o.payment_status === "paid" ? "success" : o.payment_status === "failed" ? "destructive" : "muted"}>
                      {o.payment_status}
                    </Badge>
                  </td>
                  <td>
                    <OrderStatusBadge order={o} />
                  </td>
                  <td className="text-right tabular-nums">{formatPrice(o.total_cents)}</td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={6}>No orders match these filters.</EmptyRow>
            )}
          </tbody>
        </Table>
        <AdminPagination page={page} totalPages={totalPages} href={href} />
      </Panel>
    </>
  );
}
