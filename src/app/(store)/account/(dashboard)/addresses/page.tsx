import type { Metadata } from "next";
import { requireUserPage } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = { title: "Addresses", robots: { index: false } };

export default async function AddressesPage() {
  const auth = await requireUserPage("/account/addresses");
  const supabase = await createClient();
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", auth.userId)
    .order("is_default", { ascending: false })
    .order("created_at");
  return <AddressManager addresses={data ?? []} />;
}
