import { NextResponse } from "next/server";
import { checkoutRequestSchema } from "@/lib/checkout/schema";
import { createCheckout } from "@/lib/checkout/create-checkout";
import { checkoutDeps } from "@/lib/checkout/deps";
import { CheckoutError } from "@/lib/checkout/errors";
import { getAuth } from "@/lib/auth/session";
import { isStripeConfigured, isSupabaseConfigured } from "@/lib/env";

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !isStripeConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Checkout is not configured yet. Add the Stripe and Supabase keys described in the README.", code: "NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request.", code: "INVALID_REQUEST" }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request.", code: "INVALID_REQUEST" },
      { status: 400 },
    );
  }

  try {
    const auth = await getAuth();
    const result = await createCheckout(
      checkoutDeps(),
      parsed.data,
      auth ? { id: auth.userId, email: auth.email } : null,
    );
    return NextResponse.json({ url: result.url });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message, code: error.code, issues: error.issues }, { status: error.status });
    }
    console.error("[checkout] unexpected error", error);
    return NextResponse.json({ error: "Something went wrong. Please try again.", code: "INTERNAL" }, { status: 500 });
  }
}
