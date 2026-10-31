"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { safeNext } from "@/lib/auth/redirect";
import { emailSchema, fieldErrors, passwordSchema, signInSchema, signUpSchema, type FormState } from "@/lib/validation/schemas";

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : publicEnv.siteUrl;
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      status: "error",
      message:
        error.code === "email_not_confirmed"
          ? "Please confirm your email address first — check your inbox for the link."
          : "That email and password combination is not correct.",
    };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${await origin()}/auth/callback?next=/account`,
    },
  });
  if (error) {
    return {
      status: "error",
      message: error.code === "weak_password" ? "Please choose a stronger password." : "We could not create your account. Please try again.",
    };
  }
  // With email confirmation enabled there is no session yet.
  if (!data.session) {
    return { status: "success", message: "Almost done — we've sent a confirmation link to your email." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { status: "error", fieldErrors: { email: parsed.error.issues[0]?.message } };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${await origin()}/auth/callback?next=/account/reset-password`,
  });
  // Same response whether or not the account exists (no account enumeration).
  return { status: "success", message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = formData.get("password");
  const confirm = formData.get("confirm");
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) return { status: "error", fieldErrors: { password: parsed.error.issues[0]?.message } };
  if (password !== confirm) return { status: "error", fieldErrors: { confirm: "Passwords do not match." } };

  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { status: "error", message: "Your reset link has expired. Please request a new one." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) {
    return {
      status: "error",
      message: error.code === "same_password" ? "Choose a password you haven't used before." : "Could not update your password.",
    };
  }
  return { status: "success", message: "Your password has been updated." };
}
