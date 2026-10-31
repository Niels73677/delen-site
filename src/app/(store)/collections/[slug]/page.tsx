import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/shop/catalog-view";
import { parseFilters } from "@/lib/catalog/filters";
import { getCollectionBySlug } from "@/lib/catalog/queries";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/shared/setup-notice";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isSupabaseConfigured()) return {};
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.name,
    description: collection.description ?? undefined,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: { images: collection.imageUrl ? [{ url: collection.imageUrl, alt: collection.imageAlt ?? collection.name }] : undefined },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  if (!isSupabaseConfigured()) return <SetupNotice />;
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();
  const filters = parseFilters(sp);

  return (
    <>
      <section className="relative h-[46vh] min-h-[340px] overflow-hidden bg-foreground text-background lg:h-[58vh]">
        {collection.imageUrl && (
          <Image src={collection.imageUrl} alt={collection.imageAlt ?? ""} fill priority sizes="100vw" className="object-cover opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" aria-hidden />
        <div className="container-page relative flex h-full flex-col justify-end pb-10 lg:pb-14">
          <p className="eyebrow text-background/75">Collection</p>
          <h1 className="text-headline mt-4 font-semibold uppercase">{collection.name}</h1>
          {collection.description && <p className="mt-4 max-w-md text-background/80">{collection.description}</p>}
        </div>
      </section>
      <div className="container-page pb-24 pt-10 lg:pt-14">
        <CatalogView filters={filters} basePath={`/collections/${collection.slug}`} fixed={{ collection: collection.slug }} />
      </div>
    </>
  );
}
