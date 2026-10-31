import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/policy-page";
import { brand, commerce } from "@/config/brand";

export const metadata: Metadata = { title: "Terms & conditions", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <PolicyPage eyebrow="Legal" title="Terms & conditions" updated="31 October 2026">
      <p>
        These terms apply to all purchases made on this website. By placing an order you agree to them. Please read them carefully.
      </p>
      <h2>Orders</h2>
      <p>
        An order is a request to buy. A contract is formed once your payment is confirmed and we send an order confirmation. We reserve
        the right to cancel orders in case of obvious pricing errors or stock discrepancies, in which case you will be refunded in full.
      </p>
      <h2>Prices & payment</h2>
      <p>
        All prices are in euros and include VAT. Shipping costs are shown before you pay. Payment is taken at the time of order by our
        payment provider, Stripe.
      </p>
      <h2>Right of withdrawal</h2>
      <p>
        You have the right to withdraw from your purchase within 14 days of delivery without giving a reason, in line with EU consumer
        law. We extend this to {commerce.returnsWindowDays} days — see our returns policy for details.
      </p>
      <h2>Liability</h2>
      <p>
        Nothing in these terms limits your statutory rights. {brand.name} is not liable for indirect losses or delays caused by events
        outside our reasonable control.
      </p>
      <h2>Contact</h2>
      <p>Questions about these terms can be sent to {brand.email}.</p>
    </PolicyPage>
  );
}
