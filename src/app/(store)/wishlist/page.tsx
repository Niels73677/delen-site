import type { Metadata } from "next";
import { WishlistView } from "@/components/product/wishlist-view";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="container-page pb-24 pt-10 lg:pt-16">
      <p className="eyebrow text-muted-foreground">Saved</p>
      <h1 className="text-headline mb-12 mt-4 font-semibold uppercase">Wishlist</h1>
      <WishlistView />
    </div>
  );
}
