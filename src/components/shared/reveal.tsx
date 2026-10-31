"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/** Fades content up when it scrolls into view. Honours prefers-reduced-motion via MotionConfig. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
