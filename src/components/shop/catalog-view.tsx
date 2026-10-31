import Link from "next/link";
import { commerce } from "@/config/brand";
import { searchProducts, getFacets, getCategories } from "@/lib/catalog/queries";
import type { CatalogFilters } from "@/lib/catalog/filters";
import { Button } from "@/components/ui/button";
import { CatalogTransitionProvider } from "./catalog-transition";
import { FilterBar } from "./filter-bar";
import { AnimatedProductGrid } from "./animated-grid";
import { Pagination } from "./pagination";

/** Shared catalog UI for /shop and /collections/[slug]. */
export async function CatalogView({
  filters,
  basePath,
  fixed = {},
}: {
  filters: CatalogFilters;
  basePath: string;
  fixed?: Partial<CatalogFilters>;
}) {
  const effective = { ...filters, ...fixed };
  const [{ products, total }, facets, categories] = await Promise.all([
    searchProducts(effective),
    getFacets(),
    getCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / commerce.productsPerPage));

  return (
    <CatalogTransitionProvider>
      <FilterBar filters={filters} facets={facets} categories={categories} total={total} basePath={basePath} fixed={fixed} />
      {products.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <p className="text-2xl font-medium tracking-tight">No products found</p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {filters.q
              ? `Nothing matches “${filters.q}”. Check the spelling or try a broader term.`
              : "No products match these filters. Try removing one or two."}
          </p>
          <Button asChild variant="outline" className="mt-8">
            <Link href={basePath}>Clear filters</Link>
          </Button>
        </div>
      ) : (
        <AnimatedProductGrid products={products} />
      )}
      <Pagination filters={filters} totalPages={totalPages} basePath={basePath} omit={Object.keys(fixed) as (keyof CatalogFilters)[]} />
    </CatalogTransitionProvider>
  );
}
