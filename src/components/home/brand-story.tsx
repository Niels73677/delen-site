import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export function BrandStory() {
  return (
    <section className="bg-surface" aria-labelledby="story-heading">
      <div className="container-page grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-32">
        <Reveal className="relative aspect-[4/5] overflow-hidden lg:col-span-6">
          <Image
            src={brand.story.image}
            alt={brand.story.imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </Reveal>
        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal>
            <p className="eyebrow text-muted-foreground">{brand.story.eyebrow}</p>
            <h2 id="story-heading" className="text-headline mt-5 font-semibold uppercase">
              {brand.story.headline}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">{brand.story.copy}</p>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                ["260", "gsm cotton"],
                ["14", "core pieces"],
                ["30", "day returns"],
              ].map(([n, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block text-3xl font-semibold tracking-tight">{n}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{label}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <Button asChild variant="outline" className="mt-12">
              <Link href="/about">Our philosophy</Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
