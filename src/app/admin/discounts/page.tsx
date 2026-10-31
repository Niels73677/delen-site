import { adminPageContext } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/ui";
import { DiscountManager } from "@/components/admin/discount-manager";

export const metadata = { title: "Discounts" };

export default async function DiscountsPage() {
  const { supabase } = await adminPageContext();
  const { data } = await supabase.from("discount_codes").select("*").order("created_at", { ascending: false });
  return (
    <>
      <AdminHeader title="Discounts" description="Codes are validated and applied on the server at checkout." />
      <DiscountManager discounts={data ?? []} />
    </>
  );
}
