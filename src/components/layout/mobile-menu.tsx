"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { mainNav, serviceLinks } from "@/config/navigation";
import { brand } from "@/config/brand";

const item = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }),
};

export function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const pathname = usePathname();
  useEffect(() => {
    onOpenChange(false);
    // Close whenever the route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const links = [...mainNav, { label: "Wishlist", href: "/wishlist" }, { label: "Account", href: "/account" }];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Content forceMount asChild aria-describedby={undefined}>
              <motion.div
                className="fixed inset-0 z-50 flex flex-col bg-background"
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                exit={{ clipPath: "inset(0 0 100% 0)" }}
                transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              >
                <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
                <div className="container-page flex h-16 items-center justify-between">
                  <span className="text-[1.0625rem] font-semibold tracking-[0.42em]">{brand.name}</span>
                  <DialogPrimitive.Close className="-mr-3 flex size-11 items-center justify-center" aria-label="Close menu">
                    <X className="size-5" strokeWidth={1.5} />
                  </DialogPrimitive.Close>
                </div>
                <nav aria-label="Mobile" className="container-page flex flex-1 flex-col justify-between overflow-y-auto pb-10 pt-8">
                  <ul className="space-y-1">
                    {links.map((link, i) => (
                      <motion.li key={link.href} custom={i} variants={item} initial="hidden" animate="show">
                        <Link
                          href={link.href}
                          className="block py-2 text-[2.5rem] font-medium leading-none tracking-[-0.03em]"
                          onClick={() => onOpenChange(false)}
                        >
                          {link.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                  <motion.ul
                    className="mt-12 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.5 } }}
                  >
                    {serviceLinks.slice(0, 4).map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm text-muted-foreground" onClick={() => onOpenChange(false)}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                </nav>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
