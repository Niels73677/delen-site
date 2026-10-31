import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/supabase/types";

export type Profile = Tables<"profiles">;
export type AuthContext = { userId: string; email: string | null; profile: Profile | null };

export class AuthError extends Error {
  constructor(
    public readonly code: "UNAUTHENTICATED" | "FORBIDDEN",
    message = code === "UNAUTHENTICATED" ? "Please sign in to continue." : "You do not have access to this area.",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Resolves the authenticated user from a request-scoped client. `getUser()`
 * validates the session with Supabase Auth, so a forged cookie cannot pass.
 */
export async function resolveAuth(supabase: SupabaseClient<Database>): Promise<AuthContext | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  return { userId: data.user.id, email: data.user.email ?? null, profile: profile ?? null };
}

export async function authorizeUser(supabase: SupabaseClient<Database>): Promise<AuthContext> {
  const ctx = await resolveAuth(supabase);
  if (!ctx) throw new AuthError("UNAUTHENTICATED");
  return ctx;
}

export async function authorizeAdmin(supabase: SupabaseClient<Database>): Promise<AuthContext & { profile: Profile }> {
  const ctx = await authorizeUser(supabase);
  if (!isAdminProfile(ctx.profile)) throw new AuthError("FORBIDDEN");
  return ctx as AuthContext & { profile: Profile };
}

export function isAdminProfile(profile: Pick<Profile, "role"> | null | undefined): boolean {
  return profile?.role === "admin";
}
