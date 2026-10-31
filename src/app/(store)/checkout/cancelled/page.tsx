import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReleaseReservation } from "./release-reservation";

export const metadata: Metadata = { title: "Checkout cancelled", robots: { index: false } };

type Props = { searchParams: Promise<{ order?: string }> };

export default async function CheckoutCancelledPage({ searchParams }: Props) {
  const { order } = await searchParams;
  return (
    <div className="container-page py-24 text-center lg:py-32">
      {order && <ReleaseReservation orderId={order} />}
      <p className="eyebrow text-muted-foreground">Checkout cancelled</p>
      <h1 className="text-headline mt-5 font-semibold uppercase">No harm done.</h1>
      <p className="mx-auto mt-6 max-w-md text-muted-foreground">
        Your payment was not completed and you have not been charged. Everything is still waiting in your bag.
      </p>
      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/cart">Return to bag</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Keep browsing</Link>
        </Button>
      </div>
    </div>
  );
}
