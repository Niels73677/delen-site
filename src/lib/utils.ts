import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { commerce } from "@/config/brand";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatter = new Intl.NumberFormat(commerce.locale, {
  style: "currency",
  currency: commerce.currency.toUpperCase(),
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formats an amount in minor units (cents) as a localized currency string. */
export function formatPrice(cents: number): string {
  return formatter.format(cents / 100).replace(/\.00$/, "");
}

export function formatDate(value: string | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  return new Intl.DateTimeFormat(commerce.locale, opts).format(new Date(value));
}

export function formatOrderNumber(n: number | string) {
  return `AT-${n}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Resizes an Unsplash URL; other URLs are returned untouched. */
export function imageUrl(url: string, width: number) {
  if (!url.includes("images.unsplash.com")) return url;
  const u = new URL(url);
  u.searchParams.set("w", String(width));
  return u.toString();
}
