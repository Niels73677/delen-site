"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-checks the order status while we wait for the Stripe webhook. */
export function AutoRefresh({ intervalMs = 2500, maxAttempts = 24 }: { intervalMs?: number; maxAttempts?: number }) {
  const router = useRouter();
  useEffect(() => {
    let attempts = 0;
    const t = setInterval(() => {
      attempts += 1;
      if (attempts > maxAttempts) return clearInterval(t);
      router.refresh();
    }, intervalMs);
    return () => clearInterval(t);
  }, [router, intervalMs, maxAttempts]);
  return null;
}
