"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Boxes, ExternalLink, Menu, Package, Tags, Ticket, Users, X } from "lucide-react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/catalog", label: "Categories & collections", icon: Tags },
  { href: "/admin/discounts", label: "Discounts", icon: Ticket },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function AdminNav({ email }: { email: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/admin" className="text-sm font-semibold tracking-[0.36em]">
          {brand.name}
          <span className="ml-2 align-middle text-[10px] font-medium tracking-[0.16em] text-background/50">ADMIN</span>
        </Link>
        <button type="button" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>
      <ul className="mt-4 flex-1 space-y-0.5 px-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-background/10 text-background" : "text-background/60 hover:text-background",
                )}
              >
                <Icon className="size-4" strokeWidth={1.5} /> {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-3 border-t border-background/10 p-6 text-xs text-background/50">
        <Link href="/" className="flex items-center gap-2 hover:text-background">
          <ExternalLink className="size-3.5" /> View store
        </Link>
        {email && <p className="truncate">{email}</p>}
      </div>
    </nav>
  );
  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" className="-ml-2 p-2">
          <Menu className="size-5" />
        </button>
        <span className="text-sm font-semibold tracking-[0.36em]">{brand.name}</span>
        <span className="w-9" />
      </div>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-foreground text-background lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 w-72 bg-foreground text-background">{nav}</aside>
        </div>
      )}
    </>
  );
}
