"use client";

import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          unstyled: false,
          classNames: {
            toast: "!rounded-none !border-border !bg-foreground !text-background !font-sans !shadow-none !text-[13px]",
            description: "!text-background/70",
            actionButton: "!rounded-none !bg-background !text-foreground !uppercase !tracking-[0.12em] !text-[11px]",
          },
        }}
      />
    </MotionConfig>
  );
}
