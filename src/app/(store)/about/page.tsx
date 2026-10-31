import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "About",
  description: brand.positioning,
  alternates: { canonical: "/about" },
};

const principles = [
  {
    title: "Material first",
    copy: "We start with the cloth. Organic cotton, responsibly sourced wool, recycled technical fibres — chosen for how they wear in year three, not week one.",
  },
  {
    title: "Fewer, better",
    copy: "A focused wardrobe of pieces designed to work together. We refine what exists rather than chase what is next.",
  },
  {
    title: "Made in small runs",
    copy: "We produce in limited quantities with family-run workshops in Portugal and Italy, so less goes to waste and every piece gets proper attention.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="container-page pb-16 pt-10 lg:pb-28 lg:pt-16">
        <p className="eyebrow text-muted-foreground">About {brand.name}</p>
        <h1 className="text-display mt-6 max-w-[12ch] font-semibold uppercase">Quiet by design.</h1>
        <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted-foreground lg:ml-[33%]">{brand.positioning}</p>
      </section>

      <section className="relative h-[70vh] min-h-[420px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2400&q=80"
          alt="A rail of garments in warm, natural tones"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      <section className="container-page grid gap-12 py-20 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-4">
          <p className="eyebrow text-muted-foreground">Our philosophy</p>
          <h2 className="text-headline mt-4 font-semibold uppercase">Everyday, elevated.</h2>
        </div>
        <div className="space-y-6 text-[0.9375rem] leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-6 sm:text-base">
          <p>
            {brand.name} began with a simple frustration: the clothes we wore most were rarely the ones made best. So we set out to make
            the everyday pieces — the tee, the sweatshirt, the coat you reach for without thinking — with the care usually reserved for
            occasion wear.
          </p>
          <p>
            Every silhouette is developed in our studio and refined over many fittings. We obsess over the weight of a jersey, the depth of
            a pocket, the way a collar sits after the hundredth wash. The result is clothing that feels considered without asking for
            attention.
          </p>
        </div>
      </section>

      <section className="bg-surface">
        <ul className="container-page grid gap-12 py-20 md:grid-cols-3 lg:py-28">
          {principles.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={i * 0.1}>
                <p className="text-sm tabular-nums text-accent">0{i + 1}</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.copy}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-12 lg:py-32">
        <div className="relative aspect-[4/5] overflow-hidden lg:col-span-5">
          <Image
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80"
            alt="Close-up of sage green cotton tees on wooden hangers"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <h2 className="text-headline font-semibold uppercase">Built to be worn.</h2>
          <p className="mt-6 text-muted-foreground">
            We would rather you buy one piece and wear it for a decade. That is why every garment comes with a {30}-day return window and
            free repairs on seams for the first two years.
          </p>
          <Button asChild className="mt-10">
            <Link href="/shop">Shop the collection</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
