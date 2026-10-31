import { adminPageContext } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const { supabase } = await adminPageContext();
  const [{ data: categories }, { data: collections }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("collections").select("id, name").order("sort_order"),
  ]);
  return (
    <>
      <AdminHeader title="New product" description="Save the details first — then add images, colours, sizes and stock." />
      <ProductForm product={null} categories={categories ?? []} collections={collections ?? []} selectedCollections={[]} />
    </>
  );
}
