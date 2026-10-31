"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/stores/wishlist";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  productName,
  className,
  variant = "icon",
}: {
  productId: string;
  productName: string;
  className?: string;
  variant?: "icon" | "full";
}) {
  const router = useRouter();
  const mounted = useMounted();
  const saved = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  const active = mounted && saved;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(productId);
    toast(added ? `${productName} saved to your wishlist.` : `${productName} removed from your wishlist.`, {
      action: added ? { label: "View", onClick: () => router.push("/wishlist") } : undefined,
    });
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn("eyebrow inline-flex h-12 items-center gap-2 transition-opacity hover:opacity-60", className)}
      >
        <Heart className={cn("size-4 transition-colors", active && "fill-foreground")} strokeWidth={1.5} />
        {active ? "Saved" : "Save to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className={cn("flex size-10 items-center justify-center transition-transform duration-300 hover:scale-110", className)}
    >
      <Heart className={cn("size-[18px] transition-colors", active && "fill-foreground")} strokeWidth={1.5} />
    </button>
  );
}
