import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthError, authorizeAdmin, authorizeUser, isAdminProfile } from "@/lib/auth/guards";
import { safeNext } from "@/lib/auth/redirect";
import type { Database } from "@/lib/supabase/types";

function fakeClient(user: { id: string; email: string } | null, role: "customer" | "admin" | null) {
  return {
    auth: {
      getUser: async () => (user ? { data: { user }, error: null } : { data: { user: null }, error: new Error("no session") }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: role && user ? { id: user.id, email: user.email, role } : null }),
        }),
      }),
    }),
  } as unknown as SupabaseClient<Database>;
}

describe("authorization guards", () => {
  it("rejects anonymous users", async () => {
    await expect(authorizeUser(fakeClient(null, null))).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    await expect(authorizeAdmin(fakeClient(null, null))).rejects.toBeInstanceOf(AuthError);
  });

  it("allows signed-in customers into customer areas only", async () => {
    const client = fakeClient({ id: "u1", email: "c@x.co" }, "customer");
    await expect(authorizeUser(client)).resolves.toMatchObject({ userId: "u1" });
    await expect(authorizeAdmin(client)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows admins", async () => {
    const ctx = await authorizeAdmin(fakeClient({ id: "a1", email: "a@x.co" }, "admin"));
    expect(ctx.profile.role).toBe("admin");
  });

  it("treats a missing profile as non-admin", async () => {
    await expect(authorizeAdmin(fakeClient({ id: "u2", email: "x@x.co" }, null))).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(isAdminProfile(null)).toBe(false);
  });
});

describe("safeNext (open-redirect protection)", () => {
  it.each([
    ["/account/orders", "/account/orders"],
    ["/admin?tab=1", "/admin?tab=1"],
    ["https://evil.example", "/account"],
    ["//evil.example", "/account"],
    ["/\\evil.example", "/account"],
    ["/account/login", "/account"],
    [null, "/account"],
  ])("%s → %s", (input, expected) => {
    expect(safeNext(input)).toBe(expected);
  });
});
