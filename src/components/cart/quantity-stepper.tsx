"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
  label?: string;
}) {
  const btn = cn(
    "flex items-center justify-center transition-opacity hover:opacity-60 disabled:opacity-25 disabled:hover:opacity-25",
    size === "sm" ? "size-9" : "size-12",
  );
  return (
    <div className={cn("inline-flex items-center border border-border", size === "sm" ? "h-9" : "h-12")} role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="size-3.5" strokeWidth={1.5} />
      </button>
      <span className={cn("text-center text-sm tabular-nums", size === "sm" ? "w-6" : "w-8")} aria-live="polite" aria-atomic>
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="size-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
