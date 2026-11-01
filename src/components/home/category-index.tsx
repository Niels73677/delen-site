import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type CategoryHighlight = { slug: string; name: string; count: number; image: string | null };

/** Editorial index of categories; on desktop a photo follows the cursor across rows. */
export function CategoryIndex({ categories }: { categories: CategoryHighlight[] }) {
  return (
    <section className="container-page py-24 lg:py-36" aria-labelledby="index-heading">
      <div className="mb-10 flex items-end justify-between gap-6 lg:mb-14">
        <h2 id="index-heading" className="text-headline font-semibold uppercase">
          Index
        </h2>
        <p className="eyebrow text-muted-foreground">{categories.reduce((n, c) => n + c.count, 0)} pieces</p>
      </div>
      <ul data-fx="preview" className="group/list border-t border-foreground">
        {categories.map((c, i) => (
          <li key={c.slug} data-preview-src={c.image ?? undefined}>
            <Link
              href={`/shop?category=${c.slug}`}
              data-cursor="Shop"
              className="group flex items-center gap-4 border-b border-border py-5 transition-[opacity,padding] duration-500 ease-[var(--ease-editorial)] hover:pl-4 group-hover/list:opacity-35 hover:!opacity-100 lg:gap-8 lg:py-7"
            >
              <span className="w-8 text-xs tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              {c.image && (
                <span className="shape-arch relative aspect-[4/5] w-12 shrink-0 overflow-hidden bg-surface lg:hidden">
                  <Image src={c.image} alt="" fill sizes="48px" className="object-cover" />
                </span>
              )}
              <span className="flex-1 text-[clamp(1.6rem,5vw,4.6rem)] font-semibold uppercase leading-none tracking-[-0.045em] transition-colors">
                {c.name}
              </span>
              <span className="hidden text-sm tabular-nums text-muted-foreground sm:inline">{c.count} pieces</span>
              <ArrowRight
                className="size-5 shrink-0 -translate-x-3 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                strokeWidth={1.5}
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
