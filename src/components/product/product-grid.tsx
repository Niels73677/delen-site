import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/lib/catalog/types";
import { ProductCard, ProductCardSkeleton } from "./product-card";

const gridClass = "grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-14";

export function ProductGrid({ products, className, priorityCount = 0 }: { products: ProductCardData[]; className?: string; priorityCount?: number }) {
  return (
    <ul className={cn(gridClass, className)}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn(gridClass, className)} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
