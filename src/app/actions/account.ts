"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { addressSchema, fieldErrors, profileSchema, type FormState } from "@/lib/validation/schemas";

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("UNAUTHENTICATED");
  return { supabase, userId: data.user.id };
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = profileSchema.safeParse({ fullName: formData.get("fullName"), phone: formData.get("phone") ?? undefined });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone })
    .eq("id", userId);
  if (error) return { status: "error", message: "Could not save your details. Please try again." };
  revalidatePath("/account");
  return { status: "success", message: "Your details have been saved." };
}

export async function saveAddress(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = addressSchema.safeParse({
    label: formData.get("label") ?? undefined,
    fullName: formData.get("fullName"),
    line1: formData.get("line1"),
    line2: formData.get("line2") ?? undefined,
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    region: formData.get("region") ?? undefined,
    country: formData.get("country"),
    phone: formData.get("phone") ?? undefined,
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), message: "Please check the highlighted fields." };
  const id = z.uuid().safeParse(formData.get("id")).data;
  const { supabase, userId } = await requireUser();
  const a = parsed.data;

  if (a.isDefault) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId).eq("is_default", true);
  }
  const row = {
    user_id: userId,
    label: a.label,
    full_name: a.fullName,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    postal_code: a.postalCode,
    region: a.region,
    country: a.country,
    phone: a.phone,
    is_default: a.isDefault,
  };
  const { error } = id
    ? await supabase.from("addresses").update(row).eq("id", id).eq("user_id", userId)
    : await supabase.from("addresses").insert(row);
  if (error) return { status: "error", message: "Could not save this address. Please try again." };
  revalidatePath("/account/addresses");
  return { status: "success", message: id ? "Address updated." : "Address added." };
}

export async function deleteAddress(id: string) {
  if (!z.uuid().safeParse(id).success) return { ok: false };
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/account/addresses");
  return { ok: !error };
}

export async function setDefaultAddress(id: string) {
  if (!z.uuid().safeParse(id).success) return { ok: false };
  const { supabase, userId } = await requireUser();
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId).eq("is_default", true);
  const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id).eq("user_id", userId);
  revalidatePath("/account/addresses");
  return { ok: !error };
}
