"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type RecentState = { ids: string[]; push: (id: string) => void };

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (id) => set((s) => ({ ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, 12) })),
    }),
    { name: "atelier-recent", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);
