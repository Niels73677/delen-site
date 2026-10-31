"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCardsByIds } from "@/app/actions/catalog";
import { useWishlist } from "@/stores/wishlist";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import type { ProductCardData } from "@/lib/catalog/types";
import { ProductCard } from "./product-card";
import { ProductGridSkeleton } from "./product-grid";

export function WishlistView() {
  const mounted = useMounted();
  const ids = useWishlist((s) => s.ids);
  const [loaded, setLoaded] = useState<{ key: string; cards: ProductCardData[] } | null>(null);
  const key = ids.slice(0, 48).join(",");

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    getCardsByIds(key.split(",")).then((cards) => !cancelled && setLoaded({ key, cards }));
    return () => {
      cancelled = true;
    };
  }, [key]);

  // Keep showing the previous list while a changed wishlist reloads.
  const products = !key ? [] : (loaded?.cards ?? null);
  if (!mounted || products === null) return <ProductGridSkeleton count={4} />;

  const visible = products.filter((p) => ids.includes(p.id));
  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="text-2xl font-medium tracking-tight">Nothing saved yet</p>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          Tap the heart on any product to keep it here. Sign in to keep your wishlist across devices.
        </p>
        <Button asChild className="mt-8">
          <Link href="/shop">Discover the collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-14">
      {visible.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
