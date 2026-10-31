import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import type { Collection } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const layout = [
  "lg:col-span-7 aspect-[4/5] sm:aspect-[5/4] lg:aspect-[7/6]",
  "lg:col-span-5 aspect-[4/5] lg:aspect-[5/6] lg:mt-24",
  "lg:col-span-5 aspect-[4/5] lg:aspect-[5/6] lg:-mt-24",
  "lg:col-span-7 aspect-[4/5] sm:aspect-[5/4] lg:aspect-[7/6]",
];

export function FeaturedCollections({ collections }: { collections: Collection[] }) {
  return (
    <section className="container-page py-20 lg:py-32" aria-labelledby="collections-heading">
      <div className="mb-10 flex items-end justify-between gap-6 lg:mb-16">
        <div>
          <p className="eyebrow text-muted-foreground">Collections</p>
          <h2 id="collections-heading" className="text-headline mt-4 font-semibold uppercase">
            The wardrobe
          </h2>
        </div>
        <Link href="/collections" className="eyebrow link-underline hidden sm:inline-block">
          All collections
        </Link>
      </div>
      <ul className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        {collections.slice(0, 4).map((c, i) => (
          <li key={c.id} className={cn("relative", layout[i])}>
            <Reveal delay={(i % 2) * 0.1} className="h-full">
              <Link href={`/collections/${c.slug}`} className="group relative block h-full overflow-hidden bg-surface">
                {c.imageUrl && (
                  <Image
                    src={c.imageUrl}
                    alt={c.imageAlt ?? c.name}
                    fill
                    sizes="(min-width: 1024px) 58vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-editorial)] group-hover:scale-[1.05]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-background sm:p-8">
                  <div>
                    <p className="eyebrow text-background/75">0{i + 1}</p>
                    <h3 className="mt-2 text-3xl font-semibold uppercase tracking-[-0.03em] sm:text-4xl">{c.name}</h3>
                  </div>
                  <span className="eyebrow flex items-center gap-1.5 border-b border-background/60 pb-1 transition-[gap] duration-500 group-hover:gap-3">
                    Discover <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
