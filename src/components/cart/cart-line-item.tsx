"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useCart } from "@/stores/cart";
import { lineLimit, type CartLine } from "@/lib/cart/lines";
import { formatPrice } from "@/lib/utils";
import { QuantityStepper } from "./quantity-stepper";

export function CartLineItem({ line, onNavigate, large = false }: { line: CartLine; onNavigate?: () => void; large?: boolean }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const max = Math.max(1, lineLimit(line));

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
      className="flex gap-4 py-5"
      data-testid="cart-line"
    >
      <Link
        href={`/products/${line.slug}`}
        onClick={onNavigate}
        className={large ? "relative aspect-[4/5] w-28 shrink-0 overflow-hidden bg-surface sm:w-36" : "relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-surface"}
      >
        {line.imageUrl && (
          <Image src={line.imageUrl} alt={line.name} fill sizes="150px" className="object-cover" />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/products/${line.slug}`} onClick={onNavigate} className="block truncate text-sm font-medium hover:opacity-70">
              {line.name}
            </Link>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {line.colorName} · {line.size}
            </p>
          </div>
          <p className="text-sm tabular-nums">{formatPrice(line.unitPriceCents * line.quantity)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            max={max}
            onChange={(q) => setQuantity(line.variantId, q)}
            label={`Quantity for ${line.name}`}
          />
          <button
            type="button"
            onClick={() => remove(line.variantId)}
            className="text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Remove
          </button>
        </div>
        {line.quantity >= max && max < 10 && (
          <p className="mt-2 text-[12px] text-muted-foreground">Maximum available quantity in your bag.</p>
        )}
      </div>
    </motion.li>
  );
}
