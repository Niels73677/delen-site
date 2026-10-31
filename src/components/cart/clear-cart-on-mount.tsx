"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart";

/** Empties the local bag once payment has been confirmed. */
export function ClearCartOnMount() {
  useEffect(() => {
    useCart.getState().clear();
  }, []);
  return null;
}
