import Link from "next/link";
import { brand } from "@/config/brand";

export default function GlobalNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-[1.0625rem] font-semibold tracking-[0.42em]">{brand.name}</p>
      <h1 className="mt-10 text-5xl font-semibold uppercase tracking-tight">Not found.</h1>
      <p className="mt-4 text-muted-foreground">This page doesn&apos;t exist.</p>
      <Link href="/" className="eyebrow mt-8 underline underline-offset-4">
        Back to home
      </Link>
    </main>
  );
}
