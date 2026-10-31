import type { Metadata } from "next";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { brand, commerce } from "@/config/brand";
import { sizeGuide } from "@/config/size-guide";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Help & Contact",
  description: "Answers about orders, shipping, returns, sizing and care.",
  alternates: { canonical: "/help" },
};

const faqs = [
  {
    q: "How long does delivery take?",
    a: `Orders ship from our studio within one business day and arrive in 2–5 business days across the EU and UK. Shipping is ${formatPrice(commerce.standardShippingCents)}, or complimentary over ${formatPrice(commerce.freeShippingThresholdCents)}.`,
  },
  {
    q: "Can I return or exchange an item?",
    a: `Yes. Unworn items with tags attached can be returned within ${commerce.returnsWindowDays} days of delivery for a full refund. Returns are free.`,
  },
  {
    q: "Do I need an account to order?",
    a: "No — guest checkout is always available. An account lets you track orders, save addresses and keep your bag and wishlist across devices.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "All major credit and debit cards, Apple Pay, Google Pay and local methods such as iDEAL and Bancontact, processed securely by Stripe. We never see or store your card details.",
  },
  {
    q: "How do I use a discount code?",
    a: "Enter your code in the order summary on the bag page before checking out. One code can be used per order.",
  },
  {
    q: "How should I care for my garments?",
    a: "Wash less, wash cold, and dry flat or on a line. Every product page lists specific care instructions under Materials & care.",
  },
];

export default function HelpPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div className="container-page pb-24 pt-10 lg:pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="eyebrow text-muted-foreground">Customer care</p>
      <h1 className="text-headline mt-4 font-semibold uppercase">How can we help?</h1>

      <div className="mt-14 grid gap-14 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="eyebrow mb-2">
            Frequently asked
          </h2>
          <Accordion type="single" collapsible className="border-t border-border">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="normal-case tracking-normal text-[0.9375rem]">{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <h2 id="size-guide" className="eyebrow mb-6 mt-16 scroll-mt-28">
            Size guide
          </h2>
          {Object.values(sizeGuide).map((g) => (
            <div key={g.title} className="mb-10 overflow-x-auto">
              <h3 className="mb-3 text-sm font-medium">{g.title} (cm)</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground">
                    {g.columns.map((c) => (
                      <th key={c} scope="col" className="py-2 pr-4 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r[0]} className="border-b border-border">
                      {r.map((cell, i) => (
                        <td key={i} className="py-2 pr-4 tabular-nums text-muted-foreground first:text-foreground">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-muted-foreground">{g.note}</p>
            </div>
          ))}
        </section>

        <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="contact-heading">
          <div className="bg-surface p-8">
            <h2 id="contact-heading" className="eyebrow">
              Contact us
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">Our care team replies within one business day, Monday to Friday, 9:00–17:00 CET.</p>
            <a href={`mailto:${brand.email}`} className="link-underline mt-6 inline-block text-lg font-medium">
              {brand.email}
            </a>
            <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
              <li>
                <Link href="/shipping" className="link-underline">
                  Shipping information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="link-underline">
                  Returns policy
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="link-underline">
                  Track an order
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
