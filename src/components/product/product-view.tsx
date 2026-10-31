"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, RotateCcw, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { commerce } from "@/config/brand";
import { sizeGuideFor } from "@/config/size-guide";
import {
  colorsOf,
  defaultColor,
  defaultSize,
  findVariant,
  imagesForColor,
  maxAddable,
  sizesForColor,
  stockStatus,
} from "@/lib/catalog/variants";
import type { ProductDetail } from "@/lib/catalog/types";
import { useCart } from "@/stores/cart";
import { useRecentlyViewed } from "@/stores/recently-viewed";
import { cn, formatPrice } from "@/lib/utils";
import { ProductGallery } from "./product-gallery";
import { SizeGuideDialog } from "./size-guide-dialog";
import { WishlistButton } from "./wishlist-button";
import { Price } from "./price";

export function ProductView({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const colors = useMemo(() => colorsOf(product.variants), [product.variants]);

  const initialColor = (() => {
    const fromUrl = searchParams.get("color");
    return colors.find((c) => c.name.toLowerCase() === fromUrl?.toLowerCase())?.name ?? defaultColor(product.variants);
  })();

  const [color, setColor] = useState<string | null>(initialColor);
  const [size, setSize] = useState<string | null>(() => defaultSize(product.variants, initialColor));
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addButton = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const lines = useCart((s) => s.lines);
  const pushRecent = useRecentlyViewed((s) => s.push);

  useEffect(() => pushRecent(product.id), [product.id, pushRecent]);

  useEffect(() => {
    const el = addButton.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setShowSticky(!entry!.isIntersecting && entry!.boundingClientRect.top < 0));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const sizes = color ? sizesForColor(product.variants, color) : [];
  const variant = findVariant(product.variants, color, size);
  const inBag = variant ? (lines.find((l) => l.variantId === variant.id)?.quantity ?? 0) : 0;
  const addable = maxAddable(variant, inBag, commerce.maxQuantityPerLine);
  const status = variant ? stockStatus(variant.stock) : null;
  const allSoldOut = colors.every((c) => !c.inStock);
  const images = imagesForColor(product.images, color);
  const guide = sizeGuideFor(product.category?.slug);
  const price = variant?.priceCents ?? product.priceCents;

  // Keep the quantity within what can still be added.
  useEffect(() => {
    setQuantity((q) => Math.max(1, Math.min(q, Math.max(1, addable))));
  }, [addable]);

  const selectColor = (name: string) => {
    setColor(name);
    const stillValid = size && findVariant(product.variants, name, size)?.stock;
    if (!stillValid) setSize(defaultSize(product.variants, name));
    const params = new URLSearchParams(searchParams.toString());
    params.set("color", name.toLowerCase());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleAdd = () => {
    if (!variant) {
      setSizeError(true);
      document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (variant.stock <= 0) return;
    if (addable <= 0) {
      toast("You already have all available stock of this item in your bag.");
      return;
    }
    setAdding(true);
    const added = add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        colorName: variant.colorName,
        size: variant.size,
        imageUrl: images[0]?.url ?? null,
        unitPriceCents: variant.priceCents,
        maxQuantity: variant.stock,
      },
      quantity,
    );
    setTimeout(() => {
      setAdding(false);
      if (added > 0) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1800);
        openCart();
        if (added < quantity) toast(`Only ${added} could be added — that's all the stock we have.`);
      }
    }, 250);
  };

  const buttonLabel = allSoldOut
    ? "Sold out"
    : !variant
      ? "Select a size"
      : variant.stock <= 0
        ? "Sold out in this size"
        : addable <= 0
          ? "Maximum in bag"
          : "Add to bag";

  const disabled = allSoldOut || (variant !== null && (variant.stock <= 0 || addable <= 0)) || adding;

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16">
      <div className="lg:col-span-7">
        <ProductGallery images={images} productName={product.name} />
      </div>

      <div className="lg:col-span-5 xl:col-span-4 xl:col-start-9">
        <div className="lg:sticky lg:top-24">
          <div className="flex items-start justify-between gap-4">
            <div>
              {product.category && <p className="eyebrow text-muted-foreground">{product.category.name}</p>}
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{product.name}</h1>
            </div>
            <WishlistButton productId={product.id} productName={product.name} className="-mr-2 -mt-1 shrink-0" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Price cents={price} compareAtCents={product.compareAtCents} className="text-lg" />
            {product.isNew && <Badge variant="outline">New</Badge>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Taxes included. Shipping calculated at checkout.</p>

          {/* Colour */}
          <fieldset className="mt-8">
            <legend className="eyebrow flex gap-2">
              Colour <span className="font-normal normal-case tracking-normal text-muted-foreground">{color}</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Colour">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  role="radio"
                  aria-checked={color === c.name}
                  aria-label={`${c.name}${c.inStock ? "" : " — sold out"}`}
                  title={c.name}
                  onClick={() => selectColor(c.name)}
                  className={cn(
                    "relative flex size-11 items-center justify-center rounded-full transition-shadow",
                    color === c.name ? "ring-1 ring-foreground" : "hover:ring-1 hover:ring-border",
                  )}
                >
                  <span className="size-8 rounded-full border border-foreground/15" style={{ backgroundColor: c.hex }} />
                  {!c.inStock && (
                    <span className="absolute inset-0 m-auto h-px w-9 rotate-45 bg-foreground/60" aria-hidden />
                  )}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Size */}
          <fieldset className="mt-8" id="size-selector">
            <div className="flex items-center justify-between">
              <legend className="eyebrow">Size</legend>
              {guide && <SizeGuideDialog guide={guide} fit={product.fit} />}
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2" role="radiogroup" aria-label="Size" aria-describedby={sizeError ? "size-error" : undefined}>
              {sizes.map(({ size: s, available }) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  aria-disabled={!available}
                  aria-label={`${s}${available ? "" : " — sold out"}`}
                  onClick={() => {
                    if (!available) return;
                    setSize(s);
                    setSizeError(false);
                  }}
                  className={cn(
                    "relative h-12 border text-sm transition-colors",
                    s.length > 4 && "col-span-5",
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : available
                        ? "border-border hover:border-foreground"
                        : "cursor-not-allowed border-border text-muted-foreground/50",
                    sizeError && !size && "border-destructive/60",
                  )}
                  data-testid={`size-${s}`}
                >
                  {s}
                  {!available && (
                    <span className="absolute inset-0 overflow-hidden" aria-hidden>
                      <span className="absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-[22deg] bg-border" />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 min-h-5 text-[13px]" aria-live="polite">
              {sizeError && !size ? (
                <p id="size-error" className="text-destructive">
                  Please select a size.
                </p>
              ) : status ? (
                <p className={cn("flex items-center gap-2", status.level === "low" ? "text-foreground" : "text-muted-foreground")}>
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      status.level === "in" && "bg-success",
                      status.level === "low" && "bg-accent",
                      status.level === "out" && "bg-destructive",
                    )}
                  />
                  {status.label}
                  {inBag > 0 && <span className="text-muted-foreground">· {inBag} in your bag</span>}
                </p>
              ) : allSoldOut ? (
                <p className="text-muted-foreground">This piece is sold out. Save it to your wishlist to keep it close.</p>
              ) : null}
            </div>
          </fieldset>

          {/* Quantity + add */}
          <div className="mt-6 flex gap-3" ref={addButton}>
            <QuantityStepper value={quantity} max={Math.max(1, addable)} onChange={setQuantity} />
            <Button onClick={handleAdd} disabled={disabled} size="lg" className="h-12 flex-1" data-testid="add-to-bag">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={adding ? "adding" : justAdded ? "added" : buttonLabel}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  {adding ? <Loader2 className="animate-spin" /> : justAdded ? <Check /> : null}
                  {adding ? "Adding" : justAdded ? "Added" : buttonLabel}
                  {!adding && !justAdded && variant && addable > 0 && <span className="opacity-60">· {formatPrice(price * quantity)}</span>}
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>

          <ul className="mt-6 space-y-2.5 text-[13px] text-muted-foreground">
            <li className="flex items-center gap-3">
              <Truck className="size-4 shrink-0" strokeWidth={1.5} /> Complimentary shipping over {formatPrice(commerce.freeShippingThresholdCents)} ·
              2–5 business days
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw className="size-4 shrink-0" strokeWidth={1.5} /> Free returns within {commerce.returnsWindowDays} days
            </li>
          </ul>

          <p className="mt-8 text-[0.9375rem] leading-relaxed text-muted-foreground">{product.description}</p>

          <Accordion type="multiple" defaultValue={["details"]} className="mt-8 border-t border-border">
            {product.details.length > 0 && (
              <AccordionItem value="details">
                <AccordionTrigger>Details</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-1.5 pl-4">
                    {product.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="specs">
              <AccordionTrigger>Materials & care</AccordionTrigger>
              <AccordionContent>
                <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-3">
                  {product.materials && (
                    <>
                      <dt className="text-foreground">Composition</dt>
                      <dd>{product.materials}</dd>
                    </>
                  )}
                  {product.care && (
                    <>
                      <dt className="text-foreground">Care</dt>
                      <dd>{product.care}</dd>
                    </>
                  )}
                  {product.fit && (
                    <>
                      <dt className="text-foreground">Fit</dt>
                      <dd>{product.fit}</dd>
                    </>
                  )}
                  {variant && (
                    <>
                      <dt className="text-foreground">SKU</dt>
                      <dd className="font-mono text-xs leading-5">{variant.sku}</dd>
                    </>
                  )}
                </dl>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping</AccordionTrigger>
              <AccordionContent>
                Standard delivery in 2–5 business days across the EU and UK for {formatPrice(commerce.standardShippingCents)}, complimentary on
                orders over {formatPrice(commerce.freeShippingThresholdCents)}. Orders placed before 14:00 CET ship the same day. You will receive
                a tracking link as soon as your parcel leaves the studio.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger>Returns</AccordionTrigger>
              <AccordionContent>
                Return unworn items with tags attached within {commerce.returnsWindowDays} days for a full refund. Returns are free — start one
                from your account or contact our care team. Refunds are issued to the original payment method within 5 business days of
                arrival.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Mobile sticky add-to-bag */}
      <AnimatePresence>
        {showSticky && !allSoldOut && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(price)} · {color}
                  {size ? ` · ${size}` : ""}
                </p>
              </div>
              <Button onClick={handleAdd} disabled={disabled} className="shrink-0">
                {variant ? (addable > 0 ? "Add to bag" : buttonLabel) : "Select size"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
