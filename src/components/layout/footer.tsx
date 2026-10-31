import Link from "next/link";
import { brand } from "@/config/brand";
import { legalLinks, serviceLinks, shopLinks } from "@/config/navigation";
import { NewsletterForm } from "@/components/shared/newsletter-form";

function Column({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="eyebrow text-background/50">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="link-underline text-sm text-background/85 hover:text-background">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const socials = [
    { label: "Instagram", href: brand.social.instagram },
    { label: "TikTok", href: brand.social.tiktok },
    { label: "Pinterest", href: brand.social.pinterest },
  ];
  return (
    <footer className="bg-foreground text-background">
      <div className="container-page pb-10 pt-20 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-[1.0625rem] font-semibold tracking-[0.42em]">{brand.name}</p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-background/60">{brand.positioning}</p>
            <div className="mt-10 max-w-sm">
              <h3 className="eyebrow mb-1 text-background/50">The Atelier Letter</h3>
              <NewsletterForm tone="dark" source="footer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <Column title="Shop" links={shopLinks} />
            <Column title="Customer service" links={serviceLinks} />
            <div className="space-y-10">
              <Column title="Legal" links={legalLinks} />
              <div>
                <h3 className="eyebrow text-background/50">Follow</h3>
                <ul className="mt-5 space-y-3">
                  {socials.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline text-sm text-background/85 hover:text-background"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <p
          aria-hidden
          className="mt-24 select-none text-[clamp(4rem,19vw,19rem)] font-semibold leading-[0.8] tracking-[-0.06em] text-background/[0.06]"
        >
          {brand.name}
        </p>

        <div className="mt-8 flex flex-col gap-3 border-t border-background/15 pt-6 text-xs text-background/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name} — {brand.tagline}. All rights reserved.
          </p>
          <p>Prices include VAT · Secure payments by Stripe</p>
        </div>
      </div>
    </footer>
  );
}
