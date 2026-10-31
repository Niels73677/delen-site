import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/policy-page";
import { commerce } from "@/config/brand";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Shipping", alternates: { canonical: "/shipping" } };

export default function ShippingPage() {
  return (
    <PolicyPage eyebrow="Customer care" title="Shipping" updated="31 October 2026">
      <p>
        Every order is packed by hand in our studio in recycled, plastic-free packaging. Orders placed before 14:00 CET on a business day
        ship the same day.
      </p>
      <h2>Rates & delivery times</h2>
      <ul>
        <li>
          Standard (2–5 business days): {formatPrice(commerce.standardShippingCents)} — complimentary on orders over{" "}
          {formatPrice(commerce.freeShippingThresholdCents)}.
        </li>
        <li>We currently ship to the European Union and the United Kingdom.</li>
      </ul>
      <h2>Tracking</h2>
      <p>
        You will receive an email with a tracking link as soon as your order leaves the studio. Signed-in customers can also follow
        every order from their account.
      </p>
      <h2>Duties & taxes</h2>
      <p>All prices include VAT. Orders to the United Kingdom are shipped duties-paid, so there is nothing more to pay on delivery.</p>
    </PolicyPage>
  );
}
