import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/register-form";
import { getAuth } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getAuth()) redirect("/account");
  return (
    <AuthShell title="Create account" subtitle="Faster checkout, order history and early access to new collections.">
      <RegisterForm next={next} />
    </AuthShell>
  );
}
