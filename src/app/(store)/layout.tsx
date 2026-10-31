import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AccountSync } from "@/components/shared/account-sync";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-foreground focus:px-4 focus:py-3 focus:text-background"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <AccountSync />
    </>
  );
}
