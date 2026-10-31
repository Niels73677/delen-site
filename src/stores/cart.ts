"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { addLine, mergeLines, reconcileLines, setLineQuantity, type CartLine, type LineRefresh } from "@/lib/cart/lines";

type CartState = {
  lines: CartLine[];
  discountCode: string | null;
  isOpen: boolean;
  /** Bumped on local edits so the account sync knows to push. */
  revision: number;
  add: (item: Omit<CartLine, "quantity">, quantity: number) => number;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setDiscountCode: (code: string | null) => void;
  merge: (lines: CartLine[]) => void;
  reconcile: (fresh: LineRefresh[]) => string[];
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      discountCode: null,
      isOpen: false,
      revision: 0,
      add: (item, quantity) => {
        const { lines, added } = addLine(get().lines, item, quantity);
        if (added > 0) set((s) => ({ lines, revision: s.revision + 1 }));
        return added;
      },
      setQuantity: (variantId, quantity) =>
        set((s) => ({ lines: setLineQuantity(s.lines, variantId, quantity), revision: s.revision + 1 })),
      remove: (variantId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId), revision: s.revision + 1 })),
      clear: () => set((s) => ({ lines: [], discountCode: null, revision: s.revision + 1 })),
      setDiscountCode: (code) => set({ discountCode: code }),
      merge: (incoming) => set((s) => ({ lines: mergeLines(s.lines, incoming) })),
      reconcile: (fresh) => {
        const { lines, notes } = reconcileLines(get().lines, fresh);
        set({ lines });
        return notes;
      },
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "atelier-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, discountCode: s.discountCode, revision: s.revision }),
    },
  ),
);

export const selectItemCount = (s: CartState) => s.lines.reduce((n, l) => n + l.quantity, 0);
