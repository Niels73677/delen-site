import Link from "next/link";

export function Manifesto() {
  return (
    <section className="container-page grid gap-10 py-24 lg:grid-cols-12 lg:py-40" aria-labelledby="manifesto-heading">
      <div className="lg:col-span-3">
        <h2 id="manifesto-heading" className="eyebrow sticky top-28 flex items-center gap-3 text-muted-foreground">
          <span className="inline-block size-2 rounded-full bg-accent" /> Manifesto
        </h2>
      </div>
      <div className="lg:col-span-9">
        <p data-fx="words" className="text-[clamp(1.9rem,4.6vw,4.4rem)] font-medium leading-[1.05] tracking-[-0.035em]">
          We make fewer things and make them properly. Heavyweight cotton, honest wool and silhouettes refined until nothing is
          left to remove — clothing that outlasts the season it was bought in.
        </p>
        <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm text-muted-foreground">
          <span>
            <span data-fx="count" data-to="260" className="text-2xl font-semibold tabular-nums text-foreground">
              260
            </span>{" "}
            gsm cotton
          </span>
          <span>
            <span data-fx="count" data-to="14" className="text-2xl font-semibold tabular-nums text-foreground">
              14
            </span>{" "}
            core pieces
          </span>
          <span>
            <span data-fx="count" data-to="30" className="text-2xl font-semibold tabular-nums text-foreground">
              30
            </span>{" "}
            day returns
          </span>
          <Link href="/about" className="link-underline ml-auto text-foreground">
            Read our philosophy
          </Link>
        </div>
      </div>
    </section>
  );
}
