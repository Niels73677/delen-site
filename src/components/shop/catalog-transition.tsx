"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";

type Ctx = { pending: boolean; navigate: (href: string) => void };
const CatalogTransitionContext = createContext<Ctx>({ pending: false, navigate: () => {} });

/** Shares a single navigation transition between the filters and the grid. */
export function CatalogTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const navigate = (href: string) => start(() => router.push(href, { scroll: false }));
  return <CatalogTransitionContext.Provider value={{ pending, navigate }}>{children}</CatalogTransitionContext.Provider>;
}

export const useCatalogTransition = () => useContext(CatalogTransitionContext);
