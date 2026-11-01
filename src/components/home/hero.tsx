import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { brand } from "@/config/brand";
import { CircleBadge } from "@/components/shared/circle-badge";

/**
 * Abstract editorial hero: stacked display type with one outlined word,
 * an arch-masked photograph, a drifting accent shape and a spinning badge.
 * Entrance motion is pure CSS; pointer/scroll effects come from the fx runtime.
 */
export function Hero() {
  const [first, second, ...rest] = brand.hero.headline.split(" ");
  const lines = [first, second, rest.join(" ")];
  return (
    <section className="relative overflow-hidden" aria-label="Introduction">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          data-fx="blob"
          className="anim-drift absolute right-[8%] top-[18%] size-[46vmax] bg-[radial-gradient(circle_at_30%_30%,#d9ccb7,#b5a48b_55%,transparent_72%)] opacity-60 blur-3xl lg:size-[38vmax]"
        />
      </div>

      <div className="container-page relative grid min-h-[100svh] items-end gap-10 pb-12 pt-28 lg:grid-cols-12 lg:items-center lg:gap-6 lg:pb-16 lg:pt-32">
        <div className="relative z-10 lg:col-span-7">
          <p className="eyebrow anim-fade-up flex items-center gap-3 text-muted-foreground" style={{ ["--d" as string]: "200ms" }}>
            <span className="inline-block h-px w-10 bg-foreground/40" />
            Autumn / Winter 2026 — Collection 04
          </p>
          <h1 className="mt-6 text-[clamp(3.4rem,13vw,12.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">
            {lines.map((line, i) => (
              <span key={line} className={`block overflow-hidden pb-[0.04em] ${i === 1 ? "pl-[12%]" : ""}`}>
                <span className={`anim-rise ${i === 1 ? "text-outline" : ""}`} style={{ ["--d" as string]: `${250 + i * 120}ms` }}>
                  {line}
                </span>{" "}
              </span>
            ))}
          </h1>
          <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:gap-12">
            <p className="anim-fade-up max-w-xs text-[0.9375rem] leading-relaxed text-muted-foreground" style={{ ["--d" as string]: "700ms" }}>
              {brand.hero.copy}
            </p>
            <div className="anim-fade-up flex items-center gap-8" style={{ ["--d" as string]: "850ms" }}>
              <CircleBadge href="/shop" label="Shop Collection" />
              <Link href="/about" className="eyebrow link-underline flex items-center gap-1.5 py-2">
                Explore Brand <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="anim-arch shape-arch relative mx-auto aspect-[4/5] w-full max-w-[520px] overflow-hidden bg-surface lg:aspect-[3/4.2]">
            <div data-parallax="0.08" className="absolute inset-[-8%]">
              <Image
                src={brand.hero.image}
                alt={brand.hero.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                quality={85}
                className="object-cover object-[50%_35%]"
              />
            </div>
          </div>
          <div
            data-parallax="-0.12"
            className="anim-fade-up shape-circle absolute -bottom-6 -left-2 w-28 overflow-hidden border-[6px] border-background sm:w-36 lg:-left-16 lg:bottom-10 lg:w-44"
            style={{ ["--d" as string]: "1100ms" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80"
              alt=""
              fill
              sizes="180px"
              className="object-cover"
            />
          </div>
          <p className="text-vertical eyebrow absolute -right-1 top-6 hidden text-muted-foreground lg:block">
            Modern essentials · Est. 2026
          </p>
        </div>
      </div>
    </section>
  );
}
