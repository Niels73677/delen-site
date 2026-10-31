import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCollections } from "@/lib/catalog/queries";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/shared/setup-notice";
import { Reveal } from "@/components/shared/reveal";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Collections",
  description: "Explore ATELIER collections — new arrivals, essentials, outerwear and accessories.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;
  const collections = await getCollections();
  return (
    <div className="container-page pb-24 pt-10 lg:pt-16">
      <header className="mb-12 max-w-2xl lg:mb-20">
        <p className="eyebrow text-muted-foreground">Collections</p>
        <h1 className="text-headline mt-4 font-semibold uppercase">Curated edits</h1>
        <p className="mt-5 text-muted-foreground">Four ways into the wardrobe. Each edit is built to work with the others.</p>
      </header>
      <ul className="grid gap-x-5 gap-y-14 sm:grid-cols-2">
        {collections.map((c, i) => (
          <li key={c.id}>
            <Reveal delay={(i % 2) * 0.1}>
              <Link href={`/collections/${c.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  {c.imageUrl && (
                    <Image
                      src={c.imageUrl}
                      alt={c.imageAlt ?? c.name}
                      fill
                      priority={i < 2}
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h2 className="text-2xl font-semibold uppercase tracking-[-0.02em]">{c.name}</h2>
                  <span className="eyebrow link-underline">Shop</span>
                </div>
                {c.description && <p className="mt-2 max-w-md text-sm text-muted-foreground">{c.description}</p>}
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
