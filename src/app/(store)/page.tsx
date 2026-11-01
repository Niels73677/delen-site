import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { Manifesto } from "@/components/home/manifesto";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { CategoryIndex } from "@/components/home/category-index";
import { BrandStory } from "@/components/home/brand-story";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ProductGrid } from "@/components/product/product-grid";
import { SetupNotice } from "@/components/shared/setup-notice";
import { getCategoryHighlights, getCollections, getFeaturedProducts } from "@/lib/catalog/queries";
import { isSupabaseConfigured } from "@/lib/env";
import { brand, siteUrl } from "@/config/brand";
import Link from "next/link";

export const revalidate = 300;

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const [collections, bestSellers, categories] = configured
    ? await Promise.all([getCollections(), getFeaturedProducts(8), getCategoryHighlights()])
    : [[], [], []];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: siteUrl,
    description: brand.positioning,
    sameAs: Object.values(brand.social),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <Marquee />
      {!configured ? (
        <SetupNotice />
      ) : (
        <>
          <Manifesto />
          <FeaturedCollections collections={collections} />
          <section className="container-page py-24 lg:py-36" aria-labelledby="bestsellers-heading">
            <div className="mb-12 grid items-end gap-6 lg:mb-16 lg:grid-cols-12">
              <h2
                id="bestsellers-heading"
                data-reveal
                className="text-[clamp(3rem,8vw,8rem)] font-semibold uppercase leading-[0.85] tracking-[-0.055em] lg:col-span-8"
              >
                Best <span className="text-outline">sellers</span>
              </h2>
              <div data-reveal style={{ ["--d" as string]: "120ms" }} className="flex items-end justify-between gap-6 lg:col-span-4 lg:flex-col lg:items-end">
                <p className="max-w-[28ch] text-sm text-muted-foreground lg:text-right">The pieces our customers come back for, season after season.</p>
                <Link href="/shop?sort=popular" className="eyebrow link-underline shrink-0">
                  Shop all
                </Link>
              </div>
            </div>
            <ProductGrid products={bestSellers} />
          </section>
          <Marquee direction={-1} />
          <CategoryIndex categories={categories} />
        </>
      )}
      <BrandStory />
      <NewsletterSection />
    </>
  );
}
