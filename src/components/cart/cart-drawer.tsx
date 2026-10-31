"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, selectItemCount } from "@/stores/cart";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { useCheckout } from "@/hooks/use-checkout";
import { useMounted } from "@/hooks/use-mounted";
import { computeTotals } from "@/lib/cart/calc";
import { formatPrice } from "@/lib/utils";
import { CartLineItem } from "./cart-line-item";
import { FreeShippingMeter } from "./free-shipping-meter";

export function CartDrawer() {
  const mounted = useMounted();
  const pathname = usePathname();
  const isOpen = useCart((s) => s.isOpen);
  const setOpen = useCart((s) => s.setOpen);
  const close = useCart((s) => s.close);
  const lines = useCart((s) => s.lines);
  const count = useCart(selectItemCount);
  const { quote, refresh } = useCartQuote(isOpen);
  const { checkout, pending } = useCheckout(() => void refresh());

  useEffect(() => {
    close();
  }, [pathname, close]);

  // Server totals when available; local estimate while loading.
  const estimate = computeTotals(lines.map((l) => ({ unitPriceCents: l.unitPriceCents, quantity: l.quantity })));
  const totals = quote?.totals && quote.totals.itemCount === estimate.itemCount ? quote.totals : estimate;

  return (
    <Sheet open={mounted && isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" data-testid="cart-drawer">
        <SheetHeader>
          <SheetTitle>
            Bag <span className="text-muted-foreground">({count})</span>
          </SheetTitle>
          <SheetDescription className="sr-only">Review the items in your shopping bag</SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="text-2xl font-medium tracking-tight">Your bag is empty</p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Start with the essentials — pieces designed to be worn every day.
            </p>
            <Button asChild className="mt-8" onClick={close}>
              <Link href="/shop">Shop the collection</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-6 py-4">
              <FreeShippingMeter remainingCents={totals.freeShippingRemainingCents} />
            </div>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <CartLineItem key={line.variantId} line={line} onNavigate={close} />
                ))}
              </AnimatePresence>
            </ul>
            <div className="border-t border-border px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums" data-testid="drawer-subtotal">{formatPrice(totals.subtotalCents)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="tabular-nums">{totals.shippingCents === 0 ? "Complimentary" : formatPrice(totals.shippingCents)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-muted-foreground">Discount codes can be added in your bag. Taxes included.</p>
              <div className="mt-5 grid gap-2">
                <Button onClick={checkout} disabled={pending} size="lg" className="w-full" data-testid="drawer-checkout">
                  {pending ? <Loader2 className="animate-spin" /> : <Lock className="!size-3.5" />}
                  Checkout · {formatPrice(totals.totalCents)}
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/cart" onClick={close}>
                    View bag <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
