import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap text-[0.75rem] font-medium uppercase tracking-[0.14em] transition-[background-color,color,border-color,opacity,transform] duration-300 ease-[var(--ease-editorial)] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.99] [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background hover:bg-foreground/85",
        outline: "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        light: "bg-background text-foreground hover:bg-background/85",
        "outline-light": "border border-background/80 text-background hover:bg-background hover:text-foreground",
        ghost: "text-foreground hover:bg-foreground/5",
        link: "h-auto px-0 normal-case tracking-normal text-sm underline-offset-4 hover:underline",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-12 px-7",
        lg: "h-14 px-10",
        icon: "size-11 tracking-normal",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
