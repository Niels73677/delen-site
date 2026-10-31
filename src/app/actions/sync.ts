"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { CartLine } from "@/lib/cart/lines";

/**
 * Account persistence for the bag and wishlist. Guests keep both in
 * localStorage; signed-in customers also get them saved to their account so
 * they follow them across devices. RLS restricts every row to its owner.
 */

async function authed() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, userId: data.user.id } : null;
}

export async function loadAccountCart(): Promise<CartLine[] | null> {
  const ctx = await authed();
  if (!ctx) return null;
  const { data, error } = await ctx.supabase
    .from("cart_items")
    .select(
      "quantity, variant:product_variants(id, color_name, size, price_override_cents, is_active, inventory(quantity), product:products(id, slug, name, status, price_cents, product_images(url, color_name, sort_order)))",
    )
    .eq("user_id", ctx.userId);
  if (error || !data) return null;
  return data.flatMap((row): CartLine[] => {
    const v = row.variant;
    const p = v?.product;
    if (!v || !p || p.status !== "active" || !v.is_active) return [];
    const images = [...p.product_images].sort(
      (a, b) => Number(b.color_name === v.color_name) - Number(a.color_name === v.color_name) || a.sort_order - b.sort_order,
    );
    return [
      {
        variantId: v.id,
        productId: p.id,
        slug: p.slug,
        name: p.name,
        colorName: v.color_name,
        size: v.size,
        imageUrl: images[0]?.url ?? null,
        unitPriceCents: v.price_override_cents ?? p.price_cents,
        quantity: row.quantity,
        maxQuantity: v.inventory?.quantity ?? 0,
      },
    ];
  });
}

const cartSchema = z.array(z.object({ variantId: z.uuid(), quantity: z.number().int().min(1).max(99) })).max(50);

export async function saveAccountCart(items: { variantId: string; quantity: number }[]) {
  const parsed = cartSchema.safeParse(items);
  const ctx = await authed();
  if (!ctx || !parsed.success) return { ok: false };
  const { supabase, userId } = ctx;
  const keep = parsed.data.map((i) => i.variantId);
  let del = supabase.from("cart_items").delete().eq("user_id", userId);
  if (keep.length) del = del.not("variant_id", "in", `(${keep.join(",")})`);
  const { error: delError } = await del;
  if (delError) return { ok: false };
  if (parsed.data.length) {
    const { error } = await supabase.from("cart_items").upsert(
      parsed.data.map((i) => ({ user_id: userId, variant_id: i.variantId, quantity: i.quantity, updated_at: new Date().toISOString() })),
      { onConflict: "user_id,variant_id" },
    );
    if (error) return { ok: false };
  }
  return { ok: true };
}

export async function loadAccountWishlist(): Promise<string[] | null> {
  const ctx = await authed();
  if (!ctx) return null;
  const { data } = await ctx.supabase.from("wishlist_items").select("product_id").eq("user_id", ctx.userId);
  return data?.map((r) => r.product_id) ?? null;
}

export async function saveAccountWishlist(ids: string[]) {
  const parsed = z.array(z.uuid()).max(100).safeParse(ids);
  const ctx = await authed();
  if (!ctx || !parsed.success) return { ok: false };
  const { supabase, userId } = ctx;
  let del = supabase.from("wishlist_items").delete().eq("user_id", userId);
  if (parsed.data.length) del = del.not("product_id", "in", `(${parsed.data.join(",")})`);
  await del;
  if (parsed.data.length) {
    await supabase
      .from("wishlist_items")
      .upsert(parsed.data.map((product_id) => ({ user_id: userId, product_id })), { onConflict: "user_id,product_id", ignoreDuplicates: true });
  }
  return { ok: true };
}
