/**
 * Brand configuration. Everything brand-specific lives here so the store can be
 * re-branded without touching components. Colours live in `src/app/globals.css`.
 */
export const brand = {
  name: "ATELIER",
  tagline: "Modern Essentials",
  positioning:
    "Contemporary clothing designed for individuals who value simplicity, quality, and timeless expression.",
  description:
    "ATELIER makes considered everyday clothing — heavyweight cotton, honest wool and precise silhouettes, built to be worn for years.",
  email: "care@atelier-essentials.com",
  social: {
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    pinterest: "https://pinterest.com/",
  },
  hero: {
    headline: "Defined by style.",
    copy: "Timeless essentials. Modern silhouettes. Designed for everyday expression.",
    image:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=2400&q=80",
    imageAlt: "Man in a dark bomber jacket and tan trousers sitting in a circular concrete window",
  },
  story: {
    eyebrow: "The Atelier",
    headline: "Fewer, better things.",
    copy: "We design a tight wardrobe of pieces that work together, season after season. Every garment is cut in small runs from fabric we would choose to wear ourselves — then refined until there is nothing left to remove.",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=80",
    imageAlt: "Knitwear and neutral garments hanging beside dried pampas grass",
  },
} as const;

export const commerce = {
  currency: "eur",
  locale: "en-IE",
  /** Orders at or above this subtotal (after discount) ship free. In cents. */
  freeShippingThresholdCents: 15000,
  /** Flat standard shipping rate in cents. */
  standardShippingCents: 800,
  /** Countries Stripe Checkout accepts as shipping destinations. */
  shippingCountries: ["NL", "BE", "DE", "FR", "LU", "AT", "IE", "ES", "IT", "DK", "SE", "FI", "PT", "GB"] as const,
  /** How long inventory is held for an unpaid checkout. Stripe requires >= 30 minutes. */
  reservationMinutes: 30,
  maxQuantityPerLine: 10,
  returnsWindowDays: 30,
  productsPerPage: 12,
} as const;

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
