import { adminPageContext } from "@/lib/auth/session";
import { AdminHeader, EmptyRow, Panel, Table, Th } from "@/components/admin/ui";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { supabase } = await adminPageContext();
  const q = (await searchParams).q?.trim().slice(0, 80).replace(/[%_,()]/g, "") ?? "";
  let query = supabase.from("profiles").select("id, email, full_name, role, created_at").order("created_at", { ascending: false }).limit(100);
  if (q) query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  const [{ data: customers }, { data: orders }, { count: subscribers }] = await Promise.all([
    query,
    supabase.from("orders").select("user_id, total_cents").eq("payment_status", "paid"),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
  ]);
  const totals = new Map<string, { n: number; sum: number }>();
  for (const o of orders ?? []) {
    if (!o.user_id) continue;
    const t = totals.get(o.user_id) ?? { n: 0, sum: 0 };
    totals.set(o.user_id, { n: t.n + 1, sum: t.sum + o.total_cents });
  }
  return (
    <>
      <AdminHeader title="Customers" description={`${customers?.length ?? 0} shown · ${subscribers ?? 0} newsletter subscribers`} />
      <Panel>
        <form className="flex gap-3 border-b border-border p-4" role="search">
          <input name="q" defaultValue={q} placeholder="Search by name or email" className="h-10 flex-1 border border-border bg-background px-3 text-sm" />
        </form>
        <Table>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Joined</Th>
              <Th>Role</Th>
              <Th className="text-right">Orders</Th>
              <Th className="text-right">Spent</Th>
            </tr>
          </thead>
          <tbody>
            {customers?.length ? (
              customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <p className="font-medium">{c.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="text-muted-foreground">{formatDate(c.created_at)}</td>
                  <td className="text-muted-foreground">{c.role}</td>
                  <td className="text-right tabular-nums">{totals.get(c.id)?.n ?? 0}</td>
                  <td className="text-right tabular-nums">{formatPrice(totals.get(c.id)?.sum ?? 0)}</td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={5}>No customers found.</EmptyRow>
            )}
          </tbody>
        </Table>
      </Panel>
    </>
  );
}
