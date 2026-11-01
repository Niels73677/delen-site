import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Collection } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const shapes = ["shape-arch aspect-[3/4]", "shape-circle", "aspect-[4/5]", "shape-pill aspect-[3/5]"];

/**
 * Pinned horizontal gallery on desktop (scroll moves the row sideways);
 * a native swipeable row on touch screens.
 */
export function FeaturedCollections({ collections }: { collections: Collection[] }) {
  const items = collections.slice(0, 4);
  return (
    <section data-fx="hscroll" className="relative" aria-labelledby="collections-heading">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center lg:overflow-hidden">
        <div
          data-hscroll-track
          className="scrollbar-none flex snap-x snap-mandatory items-center gap-6 overflow-x-auto px-4 py-20 sm:px-6 lg:snap-none lg:gap-16 lg:overflow-visible lg:px-10 lg:py-0"
        >
          <div className="w-[78vw] shrink-0 snap-start sm:w-[50vw] lg:w-[34vw]">
            <p className="eyebrow text-muted-foreground">Collections · {String(items.length).padStart(2, "0")}</p>
            <h2 id="collections-heading" className="mt-5 text-[clamp(3rem,7vw,7.5rem)] font-semibold uppercase leading-[0.85] tracking-[-0.05em]">
              The <span className="text-outline">ward</span>robe
            </h2>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Four edits, built to work together. Keep scrolling to move through them.
            </p>
            <Link href="/collections" className="eyebrow link-underline mt-8 inline-flex items-center gap-1.5">
              All collections <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {items.map((c, i) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              data-cursor="Open"
              className={cn("group relative block shrink-0 snap-center", i % 2 ? "lg:mt-[18vh]" : "lg:-mt-[12vh]")}
            >
              <span className="text-outline pointer-events-none absolute -top-[0.45em] left-[-0.15em] z-10 text-[clamp(4rem,9vw,9rem)] font-semibold leading-none tracking-[-0.05em] text-foreground/80">
                0{i + 1}
              </span>
              <div
                className={cn(
                  "relative w-[72vw] overflow-hidden bg-surface sm:w-[44vw] lg:w-[26vw]",
                  shapes[i % shapes.length],
                  i === 1 && "lg:w-[30vw]",
                )}
              >
                {c.imageUrl && (
                  <Image
                    src={c.imageUrl}
                    alt={c.imageAlt ?? c.name}
                    fill
                    sizes="(min-width: 1024px) 30vw, 72vw"
                    className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-editorial)] group-hover:scale-[1.08]"
                  />
                )}
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-semibold uppercase tracking-[-0.03em] lg:text-3xl">{c.name}</h3>
                <ArrowUpRight className="size-5 shrink-0 transition-transform duration-500 group-hover:rotate-45" strokeWidth={1.5} />
              </div>
              {c.description && <p className="mt-1 max-w-[30ch] text-[13px] text-muted-foreground">{c.description}</p>}
            </Link>
          ))}
          <div aria-hidden className="w-4 shrink-0 lg:w-[8vw]" />
        </div>
        <div aria-hidden className="absolute bottom-10 left-10 right-10 hidden h-px bg-border lg:block">
          <div className="h-px origin-left bg-foreground" style={{ transform: "scaleX(var(--hp, 0))" }} />
        </div>
      </div>
    </section>
  );
}
