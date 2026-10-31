import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Cookie-less anon client for public catalog reads. Because it does not touch
 * request cookies, pages using it can be statically rendered and revalidated.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
