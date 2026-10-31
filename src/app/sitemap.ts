import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/brand";
import { isSupabaseConfigured } from "@/lib/env";
import { getAllProductSlugs, getCategories, getCollections } from "@/lib/catalog/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/shop", "/collections", "/about", "/help", "/shipping", "/returns", "/privacy", "/terms"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" || path === "/shop" ? ("daily" as const) : ("monthly" as const),
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.5,
  }));
  if (!isSupabaseConfigured()) return staticRoutes;
  try {
    const [products, collections, categories] = await Promise.all([getAllProductSlugs(), getCollections(), getCategories()]);
    return [
      ...staticRoutes,
      ...collections.map((c) => ({ url: `${siteUrl}/collections/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...categories.map((c) => ({ url: `${siteUrl}/shop?category=${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
      ...products.map((p) => ({
        url: `${siteUrl}/products/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
