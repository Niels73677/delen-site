import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/policy-page";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <PolicyPage eyebrow="Legal" title="Privacy policy" updated="31 October 2026">
      <p>
        This policy explains what personal data {brand.name} collects, why, and the choices you have. We process data in accordance with
        the EU General Data Protection Regulation (GDPR).
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, email address, phone number and saved addresses.</li>
        <li>Order details: items purchased, shipping and billing addresses, and payment status.</li>
        <li>Newsletter: your email address, if you subscribe.</li>
        <li>Technical data: essential cookies that keep you signed in and remember your bag.</li>
      </ul>
      <h2>Payments</h2>
      <p>
        Payments are processed by Stripe. Card details are entered directly with Stripe and never reach our servers. We receive only the
        payment status and the addresses you provide.
      </p>
      <h2>How we use your data</h2>
      <ul>
        <li>To fulfil and deliver orders and provide customer service (contract).</li>
        <li>To send the newsletter you signed up for (consent — unsubscribe at any time).</li>
        <li>To meet legal obligations such as bookkeeping (legal obligation).</li>
      </ul>
      <h2>Your rights</h2>
      <p>
        You can request access to, correction of, or deletion of your personal data at any time by emailing {brand.email}. You may also
        lodge a complaint with your local data protection authority.
      </p>
      <h2>Retention</h2>
      <p>Order records are kept for seven years to meet tax requirements. Other data is deleted when no longer needed.</p>
    </PolicyPage>
  );
}
