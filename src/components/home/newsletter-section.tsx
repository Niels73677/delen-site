import { NewsletterForm } from "@/components/shared/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="newsletter-heading">
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div data-fx="blob" className="anim-drift size-[60vmin] bg-[radial-gradient(circle,#d9ccb7,transparent_70%)] opacity-70 blur-2xl" />
      </div>
      <div className="container-page relative py-28 text-center lg:py-44">
        <p data-reveal className="eyebrow text-muted-foreground">
          The Atelier Letter
        </p>
        <h2 id="newsletter-heading" data-reveal style={{ ["--d" as string]: "80ms" }} className="mt-6 text-[clamp(3rem,10vw,9rem)] font-semibold uppercase leading-[0.85] tracking-[-0.055em]">
          First <span className="text-outline">to</span> know.
        </h2>
        <p data-reveal style={{ ["--d" as string]: "160ms" }} className="mx-auto mt-8 max-w-md text-muted-foreground">
          New collections, restocks and the occasional essay on making clothes well. Sent sparingly.
        </p>
        <div data-reveal style={{ ["--d" as string]: "240ms" }}>
          <NewsletterForm source="home" className="mx-auto mt-10 max-w-md text-left" />
        </div>
      </div>
    </section>
  );
}
