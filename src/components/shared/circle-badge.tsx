import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Rotating circular text link with a magnetic pull — the store's signature CTA. */
export function CircleBadge({ href, label, size = 132 }: { href: string; label: string; size?: number }) {
  const text = `${label} · ${label} · `;
  return (
    <Link
      href={href}
      data-fx="magnetic"
      data-cursor="Go"
      className="group relative inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size }}
      aria-label={label}
    >
      <svg data-fx="spin" viewBox="0 0 100 100" className="anim-spin absolute inset-0 size-full" aria-hidden>
        <defs>
          <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-foreground text-[8.4px] font-medium uppercase tracking-[0.28em]">
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </svg>
      <span className="flex size-[46%] items-center justify-center rounded-full bg-foreground text-background transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:scale-110">
        <ArrowRight className="size-5 -rotate-45 transition-transform duration-500 group-hover:rotate-0" strokeWidth={1.5} />
      </span>
    </Link>
  );
}
