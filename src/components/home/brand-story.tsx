import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";

export function BrandStory() {
  return (
    <section className="outline-light relative overflow-hidden bg-foreground text-background" aria-labelledby="story-heading">
      <div className="container-page grid items-center gap-14 py-24 lg:grid-cols-12 lg:gap-16 lg:py-36">
        <div className="relative lg:col-span-6">
          <div data-reveal="mask" className="shape-circle relative mx-auto w-full max-w-[560px] overflow-hidden">
            <div data-parallax="0.1" className="absolute inset-[-10%]">
              <Image src={brand.story.image} alt={brand.story.imageAlt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </div>
          <svg data-fx="spin" viewBox="0 0 100 100" className="anim-spin absolute -right-2 -top-4 size-28 sm:size-36 lg:right-6" aria-hidden>
            <defs>
              <path id="story-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
            </defs>
            <text className="fill-background text-[8.4px] font-medium uppercase tracking-[0.3em]">
              <textPath href="#story-circle">Small runs · Honest fibres · Made to last · </textPath>
            </text>
          </svg>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <p data-reveal className="eyebrow text-background/50">
            {brand.story.eyebrow}
          </p>
          <h2 id="story-heading" data-reveal style={{ ["--d" as string]: "80ms" }} className="mt-5 text-[clamp(2.6rem,6vw,6rem)] font-semibold uppercase leading-[0.88] tracking-[-0.05em]">
            Fewer, <span className="text-outline">better</span> things.
          </h2>
          <p data-reveal style={{ ["--d" as string]: "160ms" }} className="mt-8 max-w-md text-[0.9375rem] leading-relaxed text-background/70 sm:text-base">
            {brand.story.copy}
          </p>
          <div data-reveal style={{ ["--d" as string]: "240ms" }}>
            <Button asChild variant="outline-light" className="mt-12" data-fx="magnetic">
              <Link href="/about">Our philosophy</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
