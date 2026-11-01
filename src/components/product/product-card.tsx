"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getQuickAddData, type QuickAddData } from "@/app/actions/catalog";
import { useCart } from "@/stores/cart";
import { colorsOf, defaultColor, sizesForColor } from "@/lib/catalog/variants";
import type { ProductCardData } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import { Price } from "./price";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
}: {
  product: ProductCardData;
  priority?: boolean;
  sizes?: string;
}) {
  const [primary, secondary] = product.images;
  const soldOut = product.totalStock <= 0;
  const [quickOpen, setQuickOpen] = useState(false);
  const [data, setData] = useState<QuickAddData | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const lines = useCart((s) => s.lines);

  const openQuickAdd = () => {
    setQuickOpen(true);
    if (data) return;
    startLoading(async () => {
      const result = await getQuickAddData(product.id);
      if (!result) {
        toast.error("This product is unavailable right now.");
        setQuickOpen(false);
        return;
      }
      setData(result);
      setColor(defaultColor(result.variants));
    });
  };

  const quickAdd = (variantId: string) => {
    const variant = data?.variants.find((v) => v.id === variantId);
    if (!variant) return;
    const added = add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        colorName: variant.colorName,
        size: variant.size,
        imageUrl: data?.imagesByColor[variant.colorName] ?? data?.imagesByColor["*"] ?? primary?.url ?? null,
        unitPriceCents: variant.priceCents,
        maxQuantity: variant.stock,
      },
      1,
    );
    if (added === 0) {
      toast("You already have all available stock of this size in your bag.");
      return;
    }
    setQuickOpen(false);
    openCart();
  };

  return (
    <article className="group/card relative" data-testid="product-card" data-reveal>
      <div data-fx="tilt" className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Link href={`/products/${product.slug}`} aria-label={product.name} data-cursor="View" className="absolute inset-0 z-[1]" />
        {primary ? (
          <Image
            src={primary.url}
            alt={primary.alt || product.name}
            fill
            priority={priority}
            sizes={sizes}
            className={cn(
              "object-cover transition-[transform,opacity] duration-[1.2s] ease-[var(--ease-editorial)] group-hover/card:scale-[1.04]",
              secondary && "group-hover/card:opacity-0",
              soldOut && "opacity-70",
            )}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
        {secondary && (
          <Image
            src={secondary.url}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            className="scale-[1.04] object-cover opacity-0 transition-[transform,opacity] duration-[1.2s] ease-[var(--ease-editorial)] group-hover/card:scale-100 group-hover/card:opacity-100"
          />
        )}

        <div className="pointer-events-none absolute left-3 top-3 z-[2] flex flex-col gap-1.5">
          {soldOut ? (
            <Badge variant="dark">Sold out</Badge>
          ) : (
            <>
              {product.isNew && <Badge>New</Badge>}
              {product.compareAtCents && <Badge variant="accent">Sale</Badge>}
            </>
          )}
        </div>
        <WishlistButton
          productId={product.id}
          productName={product.name}
          className="absolute right-1.5 top-1.5 z-[2] opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 lg:focus-visible:opacity-100 [&[aria-pressed=true]]:opacity-100"
        />

        {!soldOut && (
          <div className="absolute inset-x-2 bottom-2 z-[2] sm:inset-x-3 sm:bottom-3">
            <AnimatePresence mode="wait" initial={false}>
              {quickOpen ? (
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35 }}
                  className="bg-background/95 p-3 backdrop-blur-sm"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="eyebrow text-[10px]">Select size</span>
                    <button
                      type="button"
                      onClick={() => setQuickOpen(false)}
                      className="-m-2 flex size-8 items-center justify-center"
                      aria-label="Close quick add"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  {loading || !data ? (
                    <div className="flex h-9 items-center justify-center">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      {colorsOf(data.variants).length > 1 && (
                        <div className="mb-2 flex gap-1.5" role="radiogroup" aria-label="Colour">
                          {colorsOf(data.variants).map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              role="radio"
                              aria-checked={color === c.name}
                              aria-label={c.name}
                              title={c.name}
                              onClick={() => setColor(c.name)}
                              className={cn(
                                "size-5 rounded-full border border-foreground/15 ring-offset-2 ring-offset-background transition-shadow",
                                color === c.name && "ring-1 ring-foreground",
                              )}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {sizesForColor(data.variants, color ?? "").map(({ size, variant, available }) => {
                          const inBag = lines.find((l) => l.variantId === variant.id)?.quantity ?? 0;
                          const disabled = !available || inBag >= variant.stock;
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => quickAdd(variant.id)}
                              className="h-9 min-w-10 flex-1 border border-border bg-card px-2 text-xs transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:text-muted-foreground/50 disabled:line-through"
                              aria-label={`Add size ${size}${disabled ? " (unavailable)" : ""}`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div key="trigger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-end">
                  <button
                    type="button"
                    onClick={openQuickAdd}
                    className="eyebrow flex h-10 items-center gap-2 bg-background/95 px-4 text-[10px] backdrop-blur-sm transition-colors hover:bg-foreground hover:text-background lg:translate-y-2 lg:opacity-0 lg:transition-[opacity,transform,background-color,color] lg:duration-500 lg:group-hover/card:translate-y-0 lg:group-hover/card:opacity-100 lg:focus-visible:translate-y-0 lg:focus-visible:opacity-100"
                    aria-label={`Quick add ${product.name}`}
                  >
                    <Plus className="!size-3" strokeWidth={2} />
                    <span className="hidden sm:inline">Quick add</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3 sm:mt-4">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-medium sm:text-sm">
            <Link href={`/products/${product.slug}`} className="hover:opacity-70">
              {product.name}
            </Link>
          </h3>
          {product.colors.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5" aria-label={`Available in ${product.colors.map((c) => c.name).join(", ")}`}>
              {product.colors.slice(0, 5).map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="size-2.5 rounded-full border border-foreground/15"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {product.colors.length > 5 && <span className="text-[11px] text-muted-foreground">+{product.colors.length - 5}</span>}
              <span className="ml-1 text-[11px] text-muted-foreground">
                {product.colors.length === 1 ? product.colors[0]!.name : `${product.colors.length} colours`}
              </span>
            </div>
          )}
        </div>
        <Price cents={product.priceCents} compareAtCents={product.compareAtCents} className="shrink-0 text-[13px] sm:text-sm" />
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="aspect-[4/5] animate-pulse bg-surface" />
      <div className="mt-4 h-3 w-2/3 animate-pulse bg-surface" />
      <div className="mt-2 h-3 w-1/4 animate-pulse bg-surface" />
    </div>
  );
}
