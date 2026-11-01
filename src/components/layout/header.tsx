"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { mainNav } from "@/config/navigation";
import { useCart, selectItemCount } from "@/stores/cart";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { SearchOverlay } from "./search-overlay";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mounted = useMounted();
  const count = useCart(selectItemCount);
  const openCart = useCart((s) => s.open);

  // The homepage hero sits under a transparent header until the user scrolls.
  const overlay = pathname === "/" && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const iconButton =
    "relative flex size-11 items-center justify-center transition-opacity duration-300 hover:opacity-60";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,color,border-color,backdrop-filter] duration-500 ease-[var(--ease-editorial)]",
          overlay
            ? "border-b border-transparent bg-transparent text-foreground"
            : "border-b border-border bg-background/90 text-foreground backdrop-blur-md",
        )}
      >
        <div
          className={cn(
            "container-page grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-500 ease-[var(--ease-editorial)]",
            scrolled ? "h-14" : "h-16 lg:h-[72px]",
          )}
        >
          <div className="flex items-center gap-1 lg:gap-8">
            <button
              type="button"
              className={cn(iconButton, "-ml-3 lg:hidden")}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu className="size-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className={cn(iconButton, "lg:hidden")}
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="size-[19px]" strokeWidth={1.5} />
            </button>
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {mainNav.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn("link-underline eyebrow py-1", active && "bg-[length:100%_1px]")}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <Logo className={cn("transition-[font-size] duration-500", scrolled ? "text-[0.95rem]" : "text-[1.0625rem]")} />

          <div className="flex items-center justify-end gap-0.5">
            <button
              type="button"
              className={cn(iconButton, "hidden lg:flex")}
              onClick={() => setSearchOpen(true)}
              aria-label="Search (Ctrl+K)"
            >
              <Search className="size-[19px]" strokeWidth={1.5} />
            </button>
            <Link href="/wishlist" className={cn(iconButton, "hidden lg:flex")} aria-label="Wishlist">
              <Heart className="size-[19px]" strokeWidth={1.5} />
            </Link>
            <Link href="/account" className={cn(iconButton, "hidden lg:flex")} aria-label="Account">
              <User className="size-[19px]" strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              className={cn(iconButton, "-mr-3 lg:mr-0")}
              onClick={openCart}
              aria-label={`Shopping bag${mounted && count ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
              data-testid="header-bag"
            >
              <ShoppingBag className="size-[19px]" strokeWidth={1.5} />
              <AnimatePresence>
                {mounted && count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 26 }}
                    className={cn(
                      "absolute right-1 top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                      "bg-foreground text-background",
                    )}
                    data-testid="bag-count"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>
      {/* Spacer so content starts below the fixed header (except the full-bleed homepage hero). */}
      {pathname !== "/" && <div aria-hidden className="h-16 lg:h-[72px]" />}
      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
