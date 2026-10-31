"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Loader2, Lock, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart, selectItemCount } from "@/stores/cart";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { useCheckout } from "@/hooks/use-checkout";
import { useMounted } from "@/hooks/use-mounted";
import { computeTotals } from "@/lib/cart/calc";
import { formatPrice } from "@/lib/utils";
import { CartLineItem } from "./cart-line-item";
import { FreeShippingMeter } from "./free-shipping-meter";

export function CartPageView() {
  const mounted = useMounted();
  const lines = useCart((s) => s.lines);
  const count = useCart(selectItemCount);
  const discountCode = useCart((s) => s.discountCode);
  const setDiscountCode = useCart((s) => s.setDiscountCode);
  const { quote, loading, refresh } = useCartQuote(mounted);
  const { checkout, pending } = useCheckout(() => void refresh());
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  if (!mounted) {
    return (
      <div className="grid gap-10 lg:grid-cols-12">
        <Skeleton className="h-64 lg:col-span-7" />
        <Skeleton className="h-64 lg:col-span-4 lg:col-start-9" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="text-3xl font-semibold tracking-tight">Your bag is empty</p>
        <p className="mt-4 max-w-sm text-muted-foreground">Nothing here yet. Explore the collection and find something worth keeping.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/shop">Shop all</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/collections/new-arrivals">New arrivals</Link>
          </Button>
        </div>
      </div>
    );
  }

  const estimate = computeTotals(lines.map((l) => ({ unitPriceCents: l.unitPriceCents, quantity: l.quantity })));
  const totals = quote?.totals && quote.totals.itemCount === estimate.itemCount ? quote.totals : estimate;
  const discountState = quote?.discount;

  const applyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    if (!value) return;
    if (!/^[A-Z0-9_-]{3,32}$/.test(value)) {
      setCodeError("Please enter a valid code.");
      return;
    }
    setApplying(true);
    setCodeError(null);
    const result = await refresh(value);
    setApplying(false);
    if (result?.discount?.valid) {
      setDiscountCode(value);
      setCode("");
    } else {
      setCodeError(result?.discount?.message ?? (result ? "This discount code is not valid." : "Could not check the code. Try again."));
      void refresh(discountCode);
    }
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <section className="lg:col-span-7" aria-labelledby="bag-items">
        <h2 id="bag-items" className="sr-only">
          Items
        </h2>
        <div className="border-b border-border pb-5">
          <FreeShippingMeter remainingCents={totals.freeShippingRemainingCents} />
        </div>
        <ul className="divide-y divide-border border-b border-border">
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <CartLineItem key={line.variantId} line={line} large />
            ))}
          </AnimatePresence>
        </ul>
      </section>

      <aside className="lg:col-span-5 xl:col-span-4 xl:col-start-9" aria-labelledby="summary-heading">
        <div className="bg-surface p-6 sm:p-8 lg:sticky lg:top-24">
          <h2 id="summary-heading" className="eyebrow">
            Order summary
          </h2>

          <form onSubmit={applyCode} className="mt-6" noValidate>
            <label htmlFor="discount" className="text-[13px] text-muted-foreground">
              Discount code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="discount"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCodeError(null);
                }}
                placeholder="Enter code"
                autoComplete="off"
                autoCapitalize="characters"
                maxLength={32}
                aria-invalid={Boolean(codeError)}
                aria-describedby={codeError ? "discount-error" : undefined}
                className="h-11 w-full border border-border bg-card px-3 text-sm uppercase placeholder:normal-case focus:border-foreground focus:outline-none"
                data-testid="discount-input"
              />
              <Button type="submit" variant="outline" className="h-11 shrink-0 px-5" disabled={applying || !code.trim()}>
                {applying ? <Loader2 className="animate-spin" /> : "Apply"}
              </Button>
            </div>
            {codeError && (
              <p id="discount-error" role="alert" className="mt-2 text-[13px] text-destructive">
                {codeError}
              </p>
            )}
            {discountCode && (
              <div className="mt-3 flex items-center justify-between bg-background px-3 py-2 text-[13px]">
                <span className="flex items-center gap-2">
                  <Tag className="size-3.5" />
                  {discountCode}
                  {discountState && !discountState.valid && <span className="text-destructive">— {discountState.message}</span>}
                </span>
                <button type="button" onClick={() => setDiscountCode(null)} aria-label="Remove discount code" className="p-1">
                  <X className="size-3.5" />
                </button>
              </div>
            )}
          </form>

          <dl className="mt-8 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal · {count} {count === 1 ? "item" : "items"}</dt>
              <dd className="tabular-nums" data-testid="cart-subtotal">
                {formatPrice(totals.subtotalCents)}
              </dd>
            </div>
            {totals.discountCents > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="tabular-nums text-success" data-testid="cart-discount">
                  −{formatPrice(totals.discountCents)}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping estimate</dt>
              <dd className="tabular-nums">{totals.shippingCents === 0 ? "Complimentary" : formatPrice(totals.shippingCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-base font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums" data-testid="cart-total">
                {loading && !quote ? <Loader2 className="size-4 animate-spin" /> : formatPrice(totals.totalCents)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">Prices include VAT. Final amount confirmed securely at checkout.</p>

          <Button onClick={checkout} disabled={pending} size="lg" className="mt-6 w-full" data-testid="cart-checkout">
            {pending ? <Loader2 className="animate-spin" /> : <Lock className="!size-3.5" />}
            Secure checkout
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Guest checkout available ·{" "}
            <Link href="/account/login?next=/cart" className="underline underline-offset-4">
              Sign in
            </Link>{" "}
            to save the order to your account.
          </p>
        </div>
      </aside>
    </div>
  );
}
