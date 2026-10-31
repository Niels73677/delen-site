import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Service-role client. Bypasses RLS — use only in trusted server code
 * (checkout, Stripe webhook) and never pass its results to the client unfiltered.
 */
export function createServiceClient() {
  return createSupabaseClient<Database>(publicEnv.supabaseUrl, serverEnv().SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
