import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/policy-page";
import { brand, commerce } from "@/config/brand";

export const metadata: Metadata = { title: "Returns", alternates: { canonical: "/returns" } };

export default function ReturnsPage() {
  return (
    <PolicyPage eyebrow="Customer care" title="Returns" updated="31 October 2026">
      <p>
        If something isn&apos;t right, you can return it within {commerce.returnsWindowDays} days of delivery. Returns are free from all
        countries we ship to.
      </p>
      <h2>Conditions</h2>
      <ul>
        <li>Items must be unworn, unwashed and with original tags attached.</li>
        <li>Underwear and altered items cannot be returned for hygiene reasons.</li>
        <li>Discounted items are refunded at the price paid.</li>
      </ul>
      <h2>How to return</h2>
      <p>
        Email {brand.email} with your order number and we will send a prepaid return label. Pack the items securely, attach the label and
        drop the parcel at any carrier point.
      </p>
      <h2>Refunds</h2>
      <p>
        Refunds are issued to your original payment method within 5 business days of your return arriving at our studio. You will receive
        an email once it has been processed.
      </p>
    </PolicyPage>
  );
}
