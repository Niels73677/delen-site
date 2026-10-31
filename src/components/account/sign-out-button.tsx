"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { cn } from "@/lib/utils";

/** Signs out and clears this device's copy of the bag and wishlist (they stay saved to the account). */
export function SignOutButton({ className }: { className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          useCart.setState({ lines: [], discountCode: null });
          useWishlist.setState({ ids: [] });
          await signOut();
        })
      }
      className={cn("flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50", className)}
    >
      <LogOut className="size-4" strokeWidth={1.5} /> {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
