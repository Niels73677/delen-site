import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { adminPageContext } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { ImageManager } from "@/components/admin/image-manager";
import { VariantManager } from "@/components/admin/variant-manager";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await adminPageContext();
  const [{ data: product }, { data: categories }, { data: collections }, { data: links }, { data: images }, { data: variants }] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase.from("categories").select("id, name").order("sort_order"),
      supabase.from("collections").select("id, name").order("sort_order"),
      supabase.from("product_collections").select("collection_id").eq("product_id", id),
      supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
      supabase
        .from("product_variants")
        .select("id, sku, color_name, color_hex, size, size_sort, price_override_cents, is_active, inventory(quantity)")
        .eq("product_id", id),
    ]);
  if (!product) notFound();
  const variantRows = (variants ?? []).map(({ inventory, ...v }) => ({ ...v, stock: inventory?.quantity ?? 0 }));
  const colors = [...new Set(variantRows.map((v) => v.color_name))];

  return (
    <>
      <Link href="/admin/products" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Products
      </Link>
      <AdminHeader
        title={product.name}
        action={
          product.status === "active" ? (
            <Link href={`/products/${product.slug}`} target="_blank" className="flex items-center gap-2 text-sm underline underline-offset-4">
              View in store <ExternalLink className="size-3.5" />
            </Link>
          ) : undefined
        }
      />
      <div className="space-y-6">
        <ProductForm
          product={product}
          categories={categories ?? []}
          collections={collections ?? []}
          selectedCollections={(links ?? []).map((l) => l.collection_id)}
        />
        <VariantManager productId={product.id} productSlug={product.slug} variants={variantRows} />
        <ImageManager productId={product.id} images={images ?? []} colors={colors} />
      </div>
    </>
  );
}
