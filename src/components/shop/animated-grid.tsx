"use client";

import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import { useCatalogTransition } from "./catalog-transition";

export function AnimatedProductGrid({ products }: { products: ProductCardData[] }) {
  const { pending } = useCatalogTransition();
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-10 transition-opacity duration-300 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-14",
        pending && "pointer-events-none opacity-40",
      )}
      aria-busy={pending}
      data-testid="product-grid"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {products.map((p, i) => (
          <motion.li
            key={p.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: Math.min(i, 8) * 0.03 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <ProductCard product={p} priority={i < 4} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
