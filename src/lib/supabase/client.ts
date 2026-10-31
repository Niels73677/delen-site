import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import type { Database } from "./types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  client ??= createBrowserClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
  return client;
}
