"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { initFx } from "@/lib/fx/fx";

/** Mounts the interaction layer and re-scans the page after each navigation. */
export function FxRuntime() {
  const pathname = usePathname();
  useEffect(() => initFx(document), [pathname]);
  return null;
}
