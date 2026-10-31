"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WishlistState = {
  ids: string[];
  revision: number;
  toggle: (productId: string) => boolean;
  has: (productId: string) => boolean;
  merge: (ids: string[]) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      revision: 0,
      toggle: (productId) => {
        const exists = get().ids.includes(productId);
        set((s) => ({
          ids: exists ? s.ids.filter((id) => id !== productId) : [productId, ...s.ids].slice(0, 100),
          revision: s.revision + 1,
        }));
        return !exists;
      },
      has: (productId) => get().ids.includes(productId),
      merge: (ids) => set((s) => ({ ids: [...new Set([...s.ids, ...ids])] })),
    }),
    { name: "atelier-wishlist", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);
