import Link from "next/link";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label={`${brand.name} — home`}
      className={cn("inline-flex items-baseline gap-2 text-[1.0625rem] font-semibold tracking-[0.42em] leading-none", className)}
    >
      <span>{brand.name}</span>
    </Link>
  );
}
