"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only on the client after hydration — guards localStorage-backed UI. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
