"use client";

import { useEffect } from "react";

/** Frees the stock held for the abandoned checkout so others can buy it. */
export function ReleaseReservation({ orderId }: { orderId: string }) {
  useEffect(() => {
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) return;
    void fetch("/api/checkout/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
      keepalive: true,
    }).catch(() => undefined);
  }, [orderId]);
  return null;
}
