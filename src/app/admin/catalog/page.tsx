import { adminPageContext } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/ui";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

export const metadata = { title: "Categories & collections" };

export default async function CatalogPage() {
  const { supabase } = await adminPageContext();
  const [{ data: categories }, { data: collections }, { data: products }, { data: links }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, description, sort_order").order("sort_order"),
    supabase.from("collections").select("id, name, slug, description, sort_order, image_url, is_active").order("sort_order"),
    supabase.from("products").select("category_id"),
    supabase.from("product_collections").select("collection_id"),
  ]);
  const catCount = (id: string) => (products ?? []).filter((p) => p.category_id === id).length;
  const colCount = (id: string) => (links ?? []).filter((l) => l.collection_id === id).length;
  return (
    <>
      <AdminHeader title="Categories & collections" description="Categories organise the catalogue; collections are curated edits shown on the homepage." />
      <div className="grid gap-6 xl:grid-cols-2">
        <TaxonomyManager kind="category" items={(categories ?? []).map((c) => ({ ...c, count: catCount(c.id) }))} />
        <TaxonomyManager kind="collection" items={(collections ?? []).map((c) => ({ ...c, count: colCount(c.id) }))} />
      </div>
    </>
  );
}
