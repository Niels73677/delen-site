import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { AuthError, authorizeAdmin, resolveAuth } from "./guards";

/** Current user for this request (deduplicated across components). */
export const getAuth = cache(async () => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  return resolveAuth(supabase);
});

/** For pages: redirects anonymous visitors to the login page. */
export async function requireUserPage(next: string) {
  const auth = await getAuth();
  if (!auth) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return auth;
}

/** For admin pages: anonymous → login, non-admin → home. */
export async function requireAdminPage() {
  const auth = await getAuth();
  if (!auth) redirect("/account/login?next=/admin");
  if (auth.profile?.role !== "admin") redirect("/?denied=admin");
  return auth;
}

/** For server actions and route handlers. Throws AuthError. */
export async function requireAdmin() {
  const supabase = await createClient();
  const ctx = await authorizeAdmin(supabase);
  return { supabase, ...ctx };
}

export { AuthError };
