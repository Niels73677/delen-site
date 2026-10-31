import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductView } from "@/components/product/product-view";
import { ProductGrid } from "@/components/product/product-grid";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { SetupNotice } from "@/components/shared/setup-notice";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts } from "@/lib/catalog/queries";
import { isSupabaseConfigured } from "@/lib/env";
import { brand, commerce, siteUrl } from "@/config/brand";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (!isSupabaseConfigured()) return [];
  try {
    return (await getAllProductSlugs()).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isSupabaseConfigured()) return {};
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const image = product.images[0];
  const description = product.description.slice(0, 155);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — ${brand.name}`,
      description,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
    other: {
      "product:price:amount": (product.priceCents / 100).toFixed(2),
      "product:price:currency": commerce.currency.toUpperCase(),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  if (!isSupabaseConfigured()) return <SetupNotice />;
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product.id, product.category?.slug ?? null, 4);

  const inStock = product.variants.some((v) => v.isActive && v.stock > 0);
  const url = `${siteUrl}/products/${product.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images.map((i) => i.url),
        sku: product.variants[0]?.sku,
        brand: { "@type": "Brand", name: brand.name },
        material: product.materials ?? undefined,
        color: [...new Set(product.variants.map((v) => v.colorName))].join(", "),
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: commerce.currency.toUpperCase(),
          price: (product.priceCents / 100).toFixed(2),
          availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@type": "Organization", name: brand.name },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Shop", item: `${siteUrl}/shop` },
          ...(product.category
            ? [{ "@type": "ListItem", position: 2, name: product.category.name, item: `${siteUrl}/shop?category=${product.category.slug}` }]
            : []),
          { "@type": "ListItem", position: product.category ? 3 : 2, name: product.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-page pb-20 pt-4 lg:pt-8">
        <nav aria-label="Breadcrumb" className="mb-4 hidden text-xs text-muted-foreground lg:block">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/shop" className="hover:text-foreground">
                Shop
              </Link>
            </li>
            {product.category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link href={`/shop?category=${product.category.slug}`} className="hover:text-foreground">
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-foreground">
              {product.name}
            </li>
          </ol>
        </nav>
        <Suspense>
          <ProductView product={product} />
        </Suspense>
      </div>

      {related.length > 0 && (
        <section className="container-page border-t border-border py-16 lg:py-24" aria-labelledby="related-heading">
          <h2 id="related-heading" className="eyebrow mb-8">
            You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
      <RecentlyViewed excludeId={product.id} />
    </>
  );
}
