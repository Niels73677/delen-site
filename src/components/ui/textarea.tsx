import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full border border-border bg-card px-4 py-3 text-[0.9375rem] transition-colors placeholder:text-muted-foreground/70 hover:border-foreground/40 focus-visible:border-foreground focus-visible:outline-none aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
