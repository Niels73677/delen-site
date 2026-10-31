import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center px-2 py-1 text-[0.625rem] font-medium uppercase leading-none tracking-[0.16em]", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      dark: "bg-foreground text-background",
      accent: "bg-accent text-foreground",
      muted: "bg-surface text-muted-foreground",
      outline: "border border-border text-muted-foreground",
      success: "bg-success/10 text-success",
      warning: "bg-accent/25 text-foreground",
      destructive: "bg-destructive/10 text-destructive",
    },
  },
  defaultVariants: { variant: "default" },
});

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
