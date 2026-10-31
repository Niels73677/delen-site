"use client";

import { useEffect, useState } from "react";
import { getCardsByIds } from "@/app/actions/catalog";
import { useRecentlyViewed } from "@/stores/recently-viewed";
import { useMounted } from "@/hooks/use-mounted";
import type { ProductCardData } from "@/lib/catalog/types";
import { ProductCard } from "./product-card";

export function RecentlyViewed({ excludeId, title = "Recently viewed" }: { excludeId?: string; title?: string }) {
  const mounted = useMounted();
  const ids = useRecentlyViewed((s) => s.ids);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const wanted = ids.filter((id) => id !== excludeId).slice(0, 4);
  const key = wanted.join(",");

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    getCardsByIds(key.split(",")).then((cards) => {
      if (!cancelled) setProducts(cards);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!mounted || !key || products.length === 0) return null;

  return (
    <section className="container-page border-t border-border py-16 lg:py-24" aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="eyebrow mb-8">
        {title}
      </h2>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-5">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
