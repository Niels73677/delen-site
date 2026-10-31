import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/cart", "/checkout", "/api", "/wishlist"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
