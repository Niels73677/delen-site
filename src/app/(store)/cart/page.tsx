import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/cart-page-view";
import { RecentlyViewed } from "@/components/product/recently-viewed";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
  return (
    <>
      <div className="container-page pb-20 pt-10 lg:pt-16">
        <h1 className="text-headline mb-10 font-semibold uppercase lg:mb-14">Your bag</h1>
        <CartPageView />
      </div>
      <RecentlyViewed />
    </>
  );
}
