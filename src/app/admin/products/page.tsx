import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { adminPageContext } from "@/lib/auth/session";
import { AdminHeader, AdminPagination, EmptyRow, Panel, Table, Th } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Products" };
const PER_PAGE = 20;

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  const { supabase } = await adminPageContext();
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80) ?? "";
  const status = ["draft", "active", "archived"].includes(sp.status ?? "") ? sp.status! : "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  let query = supabase
    .from("product_cards")
    .select("id, slug, name, price_cents, status, total_stock, images, category_name, is_featured", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  if (q) query = query.ilike("name", `%${q.replace(/[%_]/g, "")}%`);
  if (status) query = query.eq("status", status);
  const { data: products, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PER_PAGE);
  const href = (p: number) => `/admin/products?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), page: String(p) })}`;

  return (
    <>
      <AdminHeader
        title="Products"
        description={`${count ?? 0} products`}
        action={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus /> New product
            </Link>
          </Button>
        }
      />
      <Panel>
        <form className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row" role="search">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search products"
            className="h-10 flex-1 border border-border bg-background px-3 text-sm focus:border-foreground focus:outline-none"
          />
          <select name="status" defaultValue={status} className="h-10 border border-border bg-background px-3 text-sm">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <Button type="submit" variant="outline" size="sm" className="h-10">
            Filter
          </Button>
        </form>
        <Table>
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th className="text-right">Stock</Th>
              <Th className="text-right">Price</Th>
            </tr>
          </thead>
          <tbody>
            {products?.length ? (
              products.map((p) => {
                const img = (p.images as { url: string }[] | null)?.[0];
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:underline">
                        <span className="relative aspect-[4/5] w-10 shrink-0 overflow-hidden bg-surface">
                          {img && <Image src={img.url} alt="" fill sizes="40px" className="object-cover" />}
                        </span>
                        <span className="font-medium">{p.name}</span>
                        {p.is_featured && <Badge variant="accent">Featured</Badge>}
                      </Link>
                    </td>
                    <td className="text-muted-foreground">{p.category_name ?? "—"}</td>
                    <td>
                      <Badge variant={p.status === "active" ? "success" : p.status === "draft" ? "warning" : "muted"}>{p.status}</Badge>
                    </td>
                    <td className={`text-right tabular-nums ${p.total_stock === 0 ? "text-destructive" : ""}`}>{p.total_stock}</td>
                    <td className="text-right tabular-nums">{formatPrice(p.price_cents ?? 0)}</td>
                  </tr>
                );
              })
            ) : (
              <EmptyRow colSpan={5}>No products found.</EmptyRow>
            )}
          </tbody>
        </Table>
        <AdminPagination page={page} totalPages={totalPages} href={href} />
      </Panel>
    </>
  );
}
