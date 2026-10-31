import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { BrandStory } from "@/components/home/brand-story";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { SetupNotice } from "@/components/shared/setup-notice";
import { getCollections, getFeaturedProducts } from "@/lib/catalog/queries";
import { isSupabaseConfigured } from "@/lib/env";
import { brand, siteUrl } from "@/config/brand";

export const revalidate = 300;

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const [collections, bestSellers] = configured
    ? await Promise.all([getCollections(), getFeaturedProducts(8)])
    : [[], []];

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
          <FeaturedCollections collections={collections} />
          <section className="container-page pb-24 lg:pb-36" aria-labelledby="bestsellers-heading">
            <SectionHeading id="bestsellers-heading" eyebrow="Most wanted" title="Best sellers" href="/shop?sort=popular" linkLabel="Shop all" />
            <ProductGrid products={bestSellers} />
          </section>
        </>
      )}
      <BrandStory />
      <NewsletterSection />
    </>
  );
}
