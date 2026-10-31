import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/login-form";
import { getAuth } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  if (await getAuth()) redirect(safeNext(next));
  return (
    <AuthShell title="Sign in" subtitle="Track orders, save addresses and keep your bag across devices.">
      <LoginForm next={next} linkError={error === "link"} />
    </AuthShell>
  );
}
