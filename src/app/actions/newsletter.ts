"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { newsletterSchema, type FormState } from "@/lib/validation/schemas";

export async function subscribeToNewsletter(_prev: FormState<"email">, formData: FormData): Promise<FormState<"email">> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? undefined,
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: { email: parsed.error.issues[0]?.message }, message: parsed.error.issues[0]?.message };
  }
  // Honeypot: bots fill every field.
  if (formData.get("company")) return { status: "success", message: "Thank you — you're on the list." };

  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Newsletter sign-up is not available right now." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.email, source: parsed.data.source });
  if (error) {
    if (error.code === "23505") {
      return { status: "success", message: "You're already subscribed — thank you." };
    }
    console.error("[newsletter] insert failed", error);
    return { status: "error", message: "Something went wrong. Please try again in a moment." };
  }
  return { status: "success", message: "Thank you — you're on the list. Expect a note from us soon." };
}
