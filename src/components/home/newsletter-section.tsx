import { NewsletterForm } from "@/components/shared/newsletter-form";
import { Reveal } from "@/components/shared/reveal";

export function NewsletterSection() {
  return (
    <section className="container-page py-24 lg:py-36" aria-labelledby="newsletter-heading">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow text-muted-foreground">The Atelier Letter</p>
        <h2 id="newsletter-heading" className="text-headline mt-5 font-semibold uppercase">
          First to know.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-muted-foreground">
          New collections, restocks and the occasional essay on making clothes well. Sent sparingly.
        </p>
        <NewsletterForm source="home" className="mx-auto mt-10 max-w-md text-left" />
      </Reveal>
    </section>
  );
}
