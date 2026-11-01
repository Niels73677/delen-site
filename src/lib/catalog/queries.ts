import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/env";
import type { Json } from "@/lib/supabase/database.types";
import { sortSizes } from "./sizes";
import { toSearchArgs, type CatalogFilters } from "./filters";
import type {
  CardImage,
  Category,
  Collection,
  ColorSwatch,
  Facets,
  ProductCardData,
  ProductDetail,
} from "./types";

export class CatalogUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("The catalog is temporarily unavailable.");
    this.name = "CatalogUnavailableError";
    this.cause = cause;
  }
}

function db() {
  if (!isSupabaseConfigured()) throw new CatalogUnavailableError("Supabase is not configured");
  return createPublicClient();
}

type CardRow = {
  id: string | null;
  slug: string | null;
  name: string | null;
  price_cents: number | null;
  compare_at_cents: number | null;
  is_new: boolean | null;
  total_stock: number | null;
  images: Json | null;
  colors: Json | null;
  sizes: string[] | null;
  category_slug: string | null;
};

export function mapCard(row: CardRow): ProductCardData {
  return {
    id: row.id!,
    slug: row.slug!,
    name: row.name!,
    priceCents: row.price_cents ?? 0,
    compareAtCents: row.compare_at_cents,
    isNew: Boolean(row.is_new),
    totalStock: row.total_stock ?? 0,
    images: (row.images as CardImage[] | null) ?? [],
    colors: (row.colors as ColorSwatch[] | null) ?? [],
    sizes: sortSizes(row.sizes ?? []),
    categorySlug: row.category_slug,
  };
}

const CARD_COLUMNS =
  "id, slug, name, price_cents, compare_at_cents, is_new, total_stock, images, colors, sizes, category_slug";

export async function searchProducts(filters: CatalogFilters, perPage?: number) {
  const { data, error } = await db().rpc("search_products", toSearchArgs(filters, perPage));
  if (error) throw new CatalogUnavailableError(error);
  return {
    products: (data ?? []).map(mapCard),
    total: Number(data?.[0]?.total_count ?? 0),
  };
}

export const getFacets = cache(async (): Promise<Facets> => {
  const { data, error } = await db().rpc("catalog_facets");
  if (error) throw new CatalogUnavailableError(error);
  const f = (data ?? {}) as unknown as Partial<Facets>;
  return {
    sizes: sortSizes(f.sizes ?? []),
    colors: f.colors ?? [],
    price: f.price ?? { min: 0, max: 0 },
  };
});

export async function getFeaturedProducts(limit = 8) {
  const { data, error } = await db()
    .from("product_cards")
    .select(CARD_COLUMNS)
    .eq("status", "active")
    .order("popularity", { ascending: false })
    .limit(limit);
  if (error) throw new CatalogUnavailableError(error);
  return (data ?? []).map(mapCard);
}

export async function getProductCardsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await db().from("product_cards").select(CARD_COLUMNS).eq("status", "active").in("id", ids);
  if (error) throw new CatalogUnavailableError(error);
  const byId = new Map((data ?? []).map((r) => [r.id, mapCard(r)]));
  return ids.map((id) => byId.get(id)).filter((p): p is ProductCardData => Boolean(p));
}

/** Same category first, then best sellers, excluding the current product. */
export async function getRelatedProducts(productId: string, categorySlug: string | null, limit = 4) {
  const client = db();
  const sameCategory = categorySlug
    ? await client
        .from("product_cards")
        .select(CARD_COLUMNS)
        .eq("status", "active")
        .eq("category_slug", categorySlug)
        .neq("id", productId)
        .order("popularity", { ascending: false })
        .limit(limit)
    : { data: [], error: null };
  if (sameCategory.error) throw new CatalogUnavailableError(sameCategory.error);
  const cards = (sameCategory.data ?? []).map(mapCard);
  if (cards.length >= limit) return cards;
  const { data, error } = await client
    .from("product_cards")
    .select(CARD_COLUMNS)
    .eq("status", "active")
    .not("id", "in", `(${[productId, ...cards.map((c) => c.id)].join(",")})`)
    .order("popularity", { ascending: false })
    .limit(limit - cards.length);
  if (error) throw new CatalogUnavailableError(error);
  return [...cards, ...(data ?? []).map(mapCard)];
}

export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  const { data, error } = await db()
    .from("products")
    .select(
      `id, slug, name, description, details, materials, care, fit, price_cents, compare_at_cents, is_new, updated_at,
       category:categories(slug, name),
       images:product_images(id, url, alt, color_name, sort_order),
       variants:product_variants(id, sku, color_name, color_hex, size, size_sort, price_override_cents, is_active, inventory(quantity))`,
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new CatalogUnavailableError(error);
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    details: data.details,
    materials: data.materials,
    care: data.care,
    fit: data.fit,
    priceCents: data.price_cents,
    compareAtCents: data.compare_at_cents,
    isNew: data.is_new,
    updatedAt: data.updated_at,
    category: data.category,
    images: data.images
      .map((i) => ({ id: i.id, url: i.url, alt: i.alt, colorName: i.color_name, sortOrder: i.sort_order }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    variants: data.variants.map((v) => ({
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
});

export const getCollections = cache(async (): Promise<Collection[]> => {
  const { data, error } = await db()
    .from("collections")
    .select("id, slug, name, description, image_url, image_alt")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new CatalogUnavailableError(error);
  return (data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    imageUrl: c.image_url,
    imageAlt: c.image_alt,
  }));
});

export const getCollectionBySlug = cache(async (slug: string) => {
  const all = await getCollections();
  return all.find((c) => c.slug === slug) ?? null;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const { data, error } = await db().from("categories").select("id, slug, name, description").order("sort_order");
  if (error) throw new CatalogUnavailableError(error);
  return data ?? [];
});

export async function getAllProductSlugs() {
  const { data, error } = await db().from("products").select("slug, updated_at").eq("status", "active");
  if (error) throw new CatalogUnavailableError(error);
  return data ?? [];
}

/** Categories with their active product count and a representative image. */
export const getCategoryHighlights = cache(async () => {
  const [categories, { data, error }] = await Promise.all([
    getCategories(),
    db().from("product_cards").select("category_slug, images, popularity").eq("status", "active").order("popularity", { ascending: false }),
  ]);
  if (error) throw new CatalogUnavailableError(error);
  return categories
    .map((c) => {
      const rows = (data ?? []).filter((r) => r.category_slug === c.slug);
      const image = (rows[0]?.images as CardImage[] | null)?.[0]?.url ?? null;
      return { slug: c.slug, name: c.name, count: rows.length, image };
    })
    .filter((c) => c.count > 0);
});
