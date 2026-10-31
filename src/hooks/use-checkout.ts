"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/stores/cart";

/** Starts a Stripe Checkout session for the current bag and redirects to it. */
export function useCheckout(onStockIssue?: () => void) {
  const [pending, setPending] = useState(false);

  const checkout = async () => {
    const { lines, discountCode } = useCart.getState();
    if (lines.length === 0) return;
    setPending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
          discountCode: discountCode ?? undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; code?: string };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      if (data.code === "STOCK" || data.code === "PRICE_CHANGED") onStockIssue?.();
      if (data.code === "DISCOUNT_INVALID") useCart.getState().setDiscountCode(null);
      toast.error(data.error ?? "We could not start checkout. Please try again.");
    } catch {
      toast.error("Network error — please check your connection and try again.");
    }
    setPending(false);
  };

  return { checkout, pending };
}
