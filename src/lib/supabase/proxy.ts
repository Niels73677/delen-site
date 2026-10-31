import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "./types";

/**
 * Refreshes the Supabase session on every request and gates protected areas.
 * This is a coarse first line of defence for UX; every protected page, server
 * action and route handler re-checks authorization on the server.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/account") &&
      !["/account/login", "/account/register", "/account/forgot-password"].includes(pathname));

  if (isProtected && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/account/login";
    url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  return response;
}
