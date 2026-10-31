"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/stores/cart";
import type { Totals } from "@/lib/cart/calc";
import type { LineRefresh } from "@/lib/cart/lines";

type QuoteResponse = {
  lines: LineRefresh[];
  totals: Totals | null;
  discount: { code: string; valid: boolean; message: string | null } | null;
};

/**
 * Keeps the bag honest: asks the server for current prices, stock and discount
 * validity, applies the corrections, and exposes the server-calculated totals.
 */
export function useCartQuote(enabled: boolean) {
  const lines = useCart((s) => s.lines);
  const discountCode = useCart((s) => s.discountCode);
  const reconcile = useCart((s) => s.reconcile);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const key = JSON.stringify([lines.map((l) => [l.variantId, l.quantity]), discountCode]);
  const lastKey = useRef<string | null>(null);

  const refresh = useCallback(
    async (code: string | null = discountCode) => {
      const current = useCart.getState().lines;
      setLoading(true);
      try {
        const res = await fetch("/api/cart/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: current.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
            discountCode: code ?? undefined,
          }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as QuoteResponse;
        const notes = reconcile(data.lines);
        notes.forEach((n) => toast(n));
        setQuote(data);
        return data;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [discountCode, reconcile],
  );

  useEffect(() => {
    if (!enabled || lastKey.current === key) return;
    lastKey.current = key;
    const t = setTimeout(() => void refresh(), 150);
    return () => clearTimeout(t);
  }, [enabled, key, refresh]);

  return { quote, loading, refresh };
}
