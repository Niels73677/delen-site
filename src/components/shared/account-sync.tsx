"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { loadAccountCart, loadAccountWishlist, saveAccountCart, saveAccountWishlist } from "@/app/actions/sync";

/**
 * When a customer is signed in, merges the local (guest) bag and wishlist with
 * the ones saved to their account, then keeps the account copy up to date.
 */
export function AccountSync() {
  const userId = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    let unsubCart: (() => void) | undefined;
    let unsubWish: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const start = async (id: string) => {
      if (userId.current === id) return;
      userId.current = id;
      const [cart, wishlist] = await Promise.all([loadAccountCart(), loadAccountWishlist()]);
      if (cart) useCart.getState().merge(cart);
      if (wishlist) useWishlist.getState().merge(wishlist);
      await Promise.all([
        saveAccountCart(useCart.getState().lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity }))),
        saveAccountWishlist(useWishlist.getState().ids),
      ]);
      unsubCart = useCart.subscribe((s, prev) => {
        if (s.lines === prev.lines) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          void saveAccountCart(s.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })));
        }, 800);
      });
      unsubWish = useWishlist.subscribe((s, prev) => {
        if (s.ids !== prev.ids) void saveAccountWishlist(s.ids);
      });
    };

    const stop = () => {
      userId.current = null;
      unsubCart?.();
      unsubWish?.();
    };

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void start(data.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") stop();
      else if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) void start(session.user.id);
    });

    return () => {
      sub.subscription.unsubscribe();
      stop();
      clearTimeout(timer);
    };
  }, []);

  return null;
}
