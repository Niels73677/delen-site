import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** A styled native <select>: fully accessible and mobile-friendly by default. */
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "h-12 w-full appearance-none border border-border bg-card pl-4 pr-10 text-[0.9375rem] transition-colors hover:border-foreground/40 focus-visible:border-foreground focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </div>
  );
}

export { NativeSelect };
