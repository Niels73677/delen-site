import type { Metadata } from "next";
import { CatalogView } from "@/components/shop/catalog-view";
import { SetupNotice } from "@/components/shared/setup-notice";
import { parseFilters } from "@/lib/catalog/filters";
import { getCategories } from "@/lib/catalog/queries";
import { isSupabaseConfigured } from "@/lib/env";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filters = parseFilters(await searchParams);
  let title = "Shop all";
  if (filters.q) title = `Search: ${filters.q}`;
  else if (filters.category && isSupabaseConfigured()) {
    const category = (await getCategories()).find((c) => c.slug === filters.category);
    if (category) title = category.name;
  }
  const canonical = filters.category ? `/shop?category=${filters.category}` : "/shop";
  return {
    title,
    description: "Considered essentials, outerwear and accessories — the full ATELIER collection.",
    alternates: { canonical },
    // Faceted and search URLs should not compete with the canonical listing.
    robots: filters.q || filters.sizes.length || filters.colors.length ? { index: false, follow: true } : undefined,
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  if (!isSupabaseConfigured()) return <SetupNotice />;
  const category = filters.category ? (await getCategories()).find((c) => c.slug === filters.category) : null;

  return (
    <div className="container-page pb-24 pt-10 lg:pt-16">
      <header className="mb-10 lg:mb-14">
        <p className="eyebrow text-muted-foreground">{filters.q ? "Search results" : "Shop"}</p>
        <h1 className="text-headline mt-4 font-semibold uppercase">
          {filters.q ? `“${filters.q}”` : (category?.name ?? "All products")}
        </h1>
        {category?.description && !filters.q && <p className="mt-4 max-w-lg text-muted-foreground">{category.description}</p>}
      </header>
      <CatalogView filters={filters} basePath="/shop" />
    </div>
  );
}
