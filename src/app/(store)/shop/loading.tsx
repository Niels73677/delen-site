import { ProductGridSkeleton } from "@/components/product/product-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page pb-24 pt-10 lg:pt-16">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-5 h-12 w-72 max-w-full" />
      <Skeleton className="mt-14 h-9 w-full" />
      <Skeleton className="mt-6 h-14 w-full" />
      <ProductGridSkeleton className="mt-8" />
    </div>
  );
}
