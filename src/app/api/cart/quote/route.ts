import { NextResponse } from "next/server";
import { z } from "zod";
import { checkoutRequestSchema } from "@/lib/checkout/schema";
import { checkoutDeps } from "@/lib/checkout/deps";
import { buildQuote } from "@/lib/checkout/quote";
import { isSupabaseConfigured } from "@/lib/env";

const schema = checkoutRequestSchema.extend({
  items: z.array(z.object({ variantId: z.uuid(), quantity: z.number().int().min(1).max(99) })).max(50),
});

/**
 * Re-prices the bag on the server: current prices, stock and discount validity.
 * Used by the cart UI; checkout repeats the same calculation authoritatively.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Store is not configured." }, { status: 503 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { items, discountCode } = parsed.data;

  const deps = checkoutDeps();
  const [variants, discount] = await Promise.all([
    items.length ? deps.loadVariants(items.map((i) => i.variantId)) : Promise.resolve([]),
    discountCode ? deps.loadDiscount(discountCode) : Promise.resolve(null),
  ]);

  const lines = items.map((item) => {
    const v = variants.find((x) => x.id === item.variantId);
    return {
      variantId: item.variantId,
      unitPriceCents: v?.unitPriceCents ?? 0,
      stock: v?.stock ?? 0,
      available: Boolean(v && v.isActive && v.productStatus === "active"),
    };
  });

  // Quote only what can actually be bought, clamped to stock.
  const purchasable = items
    .map((i) => ({ ...i, quantity: Math.min(i.quantity, lines.find((l) => l.variantId === i.variantId)?.stock ?? 0) }))
    .filter((i) => i.quantity > 0 && lines.find((l) => l.variantId === i.variantId)?.available);
  const quote = buildQuote(purchasable, variants, discount, new Date(), Boolean(discountCode));

  return NextResponse.json({
    lines,
    totals: quote.ok ? quote.totals : null,
    discount:
      discountCode && quote.ok
        ? quote.discountError
          ? { code: discountCode, valid: false, message: quote.discountError }
          : { code: discountCode, valid: true, message: null }
        : null,
  });
}
