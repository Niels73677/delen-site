"use server";

import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { getProductCardsByIds } from "@/lib/catalog/queries";
import { isSupabaseConfigured } from "@/lib/env";
import type { ProductCardData, Variant } from "@/lib/catalog/types";

const ids = z.array(z.uuid()).max(48);

/** Product cards for client-side lists (wishlist, recently viewed). */
export async function getCardsByIds(input: string[]): Promise<ProductCardData[]> {
  const parsed = ids.safeParse(input);
  if (!parsed.success || !isSupabaseConfigured()) return [];
  try {
    return await getProductCardsByIds(parsed.data);
  } catch {
    return [];
  }
}

export type QuickAddData = {
  variants: Variant[];
  imagesByColor: Record<string, string>;
};

/** Variant + stock data for the quick-add panel on product cards. */
export async function getQuickAddData(productId: string): Promise<QuickAddData | null> {
  if (!z.uuid().safeParse(productId).success || !isSupabaseConfigured()) return null;
  const { data } = await createPublicClient()
    .from("products")
    .select(
      "price_cents, product_images(url, color_name, sort_order), product_variants(id, sku, color_name, color_hex, size, size_sort, price_override_cents, is_active, inventory(quantity))",
    )
    .eq("id", productId)
    .eq("status", "active")
    .maybeSingle();
  if (!data) return null;
  const imagesByColor: Record<string, string> = {};
  for (const img of [...data.product_images].sort((a, b) => a.sort_order - b.sort_order)) {
    const key = img.color_name ?? "*";
    imagesByColor[key] ??= img.url;
  }
  return {
    imagesByColor,
    variants: data.product_variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      colorName: v.color_name,
      colorHex: v.color_hex,
      size: v.size,
      sizeSort: v.size_sort,
      priceCents: v.price_override_cents ?? data.price_cents,
      stock: v.inventory?.quantity ?? 0,
      isActive: v.is_active,
    })),
  };
}
